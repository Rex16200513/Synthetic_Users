
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, Persona, ChatMessage, BigFiveConfig, ImpactMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILS ---

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const formatBigFive = (config: BigFiveConfig) => {
  return Object.entries(config)
    .filter(([_, level]) => level !== 'Medium')
    .map(([trait, level]) => `${level} ${trait}`)
    .join(", ") || "Average in all traits";
};

// --- CORE GENERATION FLOW ---

/**
 * Step 1: Generate Archetypes
 * Based on App Info + Big Five, define who these people are and what they search for.
 */
const generateArchetypes = async (
  appName: string,
  appDesc: string,
  configs: BigFiveConfig[]
) => {
  const prompt = `
    Context: UX Research for App "${appName}".
    App Description: "${appDesc}".

    Task: Define 3 distinct User Archetypes based on the provided Big Five Personality traits.
    
    For each user, provide:
    1. A 'role' (e.g. "Frequent Business Flyer", "Budget Student Backpacker").
    2. A 'searchQuery' (a sentence describing what kind of app reviews they would write, e.g., "Complaints about hidden fees and price", "Praise for clean UI and efficiency").

    User 1 Traits: ${formatBigFive(configs[0])}
    User 2 Traits: ${formatBigFive(configs[1])}
    User 3 Traits: ${formatBigFive(configs[2])}
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          archetypes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                searchQuery: { type: Type.STRING },
              },
              required: ["role", "searchQuery"],
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}").archetypes || [];
};

/**
 * Step 2: Vector Match
 * Match reviews to archetypes using embeddings.
 */
const matchReviewsToArchetypes = async (
  reviews: { content: string, author: string, rating: number }[],
  archetypes: { role: string, searchQuery: string }[]
) => {
  // 1. Embed Archetype Queries
  // We process them sequentially to ensure stability, though Promise.all is faster.
  const queryEmbeddings = await Promise.all(
    archetypes.map(async (arch) => {
      const res = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: arch.searchQuery,
      });
      return res.embeddings?.[0]?.values || [];
    })
  );

  // 2. Embed Reviews (Batching or limiting to top 50 to save time/quota for demo)
  // For a real app, we'd use a vector DB. Here we just take the first 50 valid reviews.
  const sampleReviews = reviews.filter(r => r.content.length > 5).slice(0, 50);
  
  const reviewEmbeddings = await Promise.all(
    sampleReviews.map(async (r) => {
      try {
        const res = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: r.content,
        });
        return res.embeddings?.[0]?.values;
      } catch (e) {
        return null;
      }
    })
  );

  // 3. Match
  return archetypes.map((arch, index) => {
    const qVec = queryEmbeddings[index];
    if (!qVec || qVec.length === 0) return [];

    const scored = sampleReviews.map((r, rIdx) => {
      const rVec = reviewEmbeddings[rIdx];
      if (!rVec) return { r, score: -1 };
      return { r, score: cosineSimilarity(qVec, rVec) };
    });

    // Sort by score desc, take top 3
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => `Review by ${item.r.author} (${item.r.rating}*): "${item.r.content}"`);
  });
};

/**
 * Step 3: Final Generation
 * Create the full Persona objects with the matched history injected.
 */
export const generatePersonasWithVectors = async (
  data: AppData,
  targetAppName: string,
  targetAppDesc: string,
  personaConfigs: BigFiveConfig[]
): Promise<Persona[]> => {
  
  // A. Generate Archetypes
  const archetypes = await generateArchetypes(targetAppName, targetAppDesc, personaConfigs);

  // B. Vector Matching
  const matchedReviewsList = await matchReviewsToArchetypes(data.reviews, archetypes);

  // C. Construct Final Prompt
  // We construct a specific prompt for EACH persona to ensure high quality, 
  // or one big prompt. Let's do one big prompt to return the array, passing the specific context.

  const personaRequests = archetypes.map((arch: any, i: number) => `
    [User ${i + 1} Profile]
    - Big Five: ${formatBigFive(personaConfigs[i])}
    - Suggested Role: ${arch.role}
    - Matched Past Reviews (These are their actual past experiences):
      ${matchedReviewsList[i].join("\n      ")}
  `).join("\n\n");

  const prompt = `
    You are a Lead User Researcher. 
    App: ${targetAppName}
    Description: ${targetAppDesc}

    Task: Create 3 detailed synthetic user personas based on the profiles below. 
    CRITICAL: You MUST incorporate the "Matched Past Reviews" into their bio and frustrations. 
    These reviews are things they ACTUALLY experienced.

    ${personaRequests}

    Requirements:
    1. **SystemInstruction**: Define their speaking style (e.g., "Short, angry sentences" for low Agreeableness).
    2. **Bio**: Incorporate the specific complaints/praises from their matched reviews.
    3. **Frustrations**: Must be derived from the matched reviews.

    Return JSON matching the Schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                bio: { type: Type.STRING },
                frustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                systemInstruction: { type: Type.STRING },
              },
              required: ["id", "name", "role", "bio", "frustrations", "goals", "systemInstruction"],
            }
          }
        }
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  const colors = ["bg-rose-100 text-rose-800", "bg-indigo-100 text-indigo-800", "bg-emerald-100 text-emerald-800"];

  return result.personas.map((p: any, index: number) => ({
    ...p,
    color: colors[index % colors.length],
    reflections: [],
    bigFive: personaConfigs[index],
    relevantReviews: matchedReviewsList[index] // Save the matched history
  }));
};


// --- EXISTING CHAT LOGIC (Updated to return JSON metrics) ---

export const evaluateDesignAsPersona = async (
  persona: Persona,
  chatHistory: ChatMessage[],
  imageBase64: string | null,
  userMessage: string
): Promise<{ text: string, metrics: ImpactMetrics }> => {
  const parts: any[] = [];
  
  const observationStream = chatHistory
    .slice(-8) 
    .map(msg => {
      const actor = msg.role === 'user' ? '设计师(User)' : (msg.personaId === persona.id ? '我(Self)' : '其他用户(Other)');
      return `[观察] ${actor}: ${msg.text}`;
    })
    .join("\n");

  const reflectionContext = persona.reflections.length > 0
    ? `\n[长期记忆/信念 (Reflections)]:\n${persona.reflections.map((r, i) => `• ${r}`).join('\n')}\n(请基于这些过往的感悟来决定当下的反应)`
    : "\n[长期记忆]: 暂无 (这是第一次交互)";

  // Inject the Vector-Matched History
  const vectorHistoryContext = persona.relevantReviews.length > 0
    ? `\n[你的过往真实经历 (来自历史评论)]:\n${persona.relevantReviews.join('\n')}\n(这些是你之前对该App的真实评价，它们定义了你的初始态度)`
    : "";

  const personalityContext = `
    [你的大五人格设定]
    - Openness: ${persona.bigFive.Openness}
    - Conscientiousness: ${persona.bigFive.Conscientiousness}
    - Extraversion: ${persona.bigFive.Extraversion}
    - Agreeableness: ${persona.bigFive.Agreeableness}
    - Neuroticism: ${persona.bigFive.Neuroticism}
  `;

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    });
  }
  
  const promptText = `
    ${personalityContext}
    ${vectorHistoryContext}

    [记忆流 (Memory Stream)]
    ${observationStream}

    ${reflectionContext}

    [当前事件]
    设计师展示了新的设计/回复: "${userMessage || "请查看最新的界面设计。"}"
    
    [任务]
    作为 ${persona.name} (${persona.role})，请对设计做出反应。
    你必须同时根据以下公式评估你当前反应的 **Impact Score (影响力分数)**:
    E_impact = E_mo * S_persona * (1 + C_group) * I_pain

    请评估以下4个参数:
    1. emotional_intensity (E_mo): 你的情绪有多强烈？(1=平淡, 5=极度激动/愤怒/开心)
    2. role_fit (S_persona): 这个话题对你的角色重要吗？(0.5=不相关, 1.0=一般, 1.5=核心利益相关)
    3. group_consensus (C_group): 你是否在附和其他用户？(0=无, 1=明确附和)
    4. memory_resonance (I_pain): 这是否触碰到了你的[过往真实经历]？(1=无关, 5=完全命中历史痛点)

    [决策逻辑]
    1. **Retrieve**: 结合[过往真实经历]、[长期记忆]和[当前事件]。
    2. **Personality**: 你的反应必须符合你的大五人格设定。
    3. **Constructiveness**: **必须提出一个具体的修改建议**。
    4. **Interaction**: 参考其他用户的发言。

    [输出要求]
    请返回一个合法的 JSON 对象。请务必在 "thought" 字段中先思考，然后在 "text" 字段中输出回复。
    JSON 格式如下:
    {
      "thought": "简短的思考过程...",
      "text": "你的口语化回复内容 (必填，不可为空)",
      "metrics": {
        "emotional_intensity": 1-5,
        "role_fit": 0.5-1.5,
        "group_consensus": 0 or 1,
        "memory_resonance": 1-5
      }
    }
  `;

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      role: "user",
      parts: parts,
    },
    config: {
      systemInstruction: persona.systemInstruction,
      responseMimeType: "application/json",
      // Removed strict schema to allow for better chain-of-thought and prevent empty text generation
    }
  });

  // ULTRA-ROBUST JSON EXTRACTION
  let parsed: any = {};
  try {
    const rawText = response.text || "{}";
    
    // 1. Try to find the first '{' and last '}' to isolate JSON object
    const firstOpen = rawText.indexOf('{');
    const lastClose = rawText.lastIndexOf('}');
    
    let jsonString = rawText;
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        jsonString = rawText.substring(firstOpen, lastClose + 1);
    }

    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    // Fallback if strictly invalid JSON
    parsed = { text: response.text || "(用户思考中...)" };
  }
  
  // Calculate Total Impact locally to ensure consistency
  // Formula: E_mo * S_persona * (1 + C_group) * I_pain
  const m = parsed.metrics || { 
     emotional_intensity: 1, 
     role_fit: 1.0, 
     group_consensus: 0, 
     memory_resonance: 1 
  };

  const total = (m.emotional_intensity * m.role_fit * (1 + m.group_consensus) * m.memory_resonance).toFixed(1);

  // Fallback: Use 'thought' if 'text' is missing
  const finalText = parsed.text && parsed.text.trim() !== "" 
    ? parsed.text 
    : (parsed.thought || "(用户似乎无话可说)");

  return {
    text: finalText,
    metrics: {
        ...m,
        total_impact: parseFloat(total)
    }
  };
};

export const generatePersonaReflection = async (
    persona: Persona, 
    chatHistory: ChatMessage[]
): Promise<string> => {
    const recentObservations = chatHistory.slice(-10).map(m => 
      `${m.role === 'user' ? '设计师' : (m.personaId === persona.id ? '我' : '其他人')}: ${m.text}`
    ).join('\n');

    const prompt = `
      你是 ${persona.name}。
      大五人格: ${formatBigFive(persona.bigFive)}。

      [最近的观察记录]
      ${recentObservations}

      [任务: 深度反思 (Reflection)]
      请回顾上述对话，提炼出高阶观点。
      
      思考方向：
      1. 设计师是否回应了你的核心痛点？
      2. 基于你的性格，你现在的感受如何？

      请生成一条精炼的信念 (50字以内)。
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return (response.text || "").trim();
};

// Re-export old function just in case, but unused in new flow
export const generatePersonasFromReviews = generatePersonasWithVectors;
