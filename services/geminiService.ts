import { GoogleGenAI, Type } from "@google/genai";
import { AppData, Persona, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates 3 distinct synthetic user personas based on the reviews provided.
 */
export const generatePersonasFromReviews = async (data: AppData): Promise<Persona[]> => {
  // 优化：减少一次性加载的评论数量，并进行摘要处理
  const MAX_REVIEWS_FOR_GENERATION = 50; // 减少到50条
  
  // 对评论进行预处理，提取核心信息
  const processedReviews = data.reviews
    .slice(0, MAX_REVIEWS_FOR_GENERATION)
    .map((r, index) => {
      // 提取核心信息，减少冗余
      const content = r.content.length > 100 
        ? r.content.substring(0, 100) + "..." 
        : r.content;
      return `[评论${index+1}] ${r.rating}星: "${r.title}" - ${content}`;
    })
    .join("\n");

  const researchName = data.research_info.name || "该研究对象";
  const researchType = data.research_info.type || "应用";

  const prompt = `
    你是一名高级 UX 研究员，正在基于 "${researchName}" (${researchType}) 的真实用户反馈构建一个高保真的焦点小组。
    
    任务：
    1. 首先分析所有用户评论，将每条评论分配给最匹配的用户类型（创新者/实用主义者/保守主义者）
    2. 然后，基于分类结果，重构出 3 个具备深度心理画像的典型用户 (User Archetypes)
    3. 每个用户角色必须紧密结合分配给他们的具体评论，确保其痛点、目标和行为逻辑与真实用户反馈高度一致
    
    用户分类框架：
    1. **创新者/早期采用者**：
       - 大五人格特征：开放性高，对新事物充满好奇
       - 行为特征：技术敏感，喜欢尝试新功能，愿意为创新买单
       - 需求：关注产品的创新性、技术领先性和独特功能
       - 期望：产品能够提供前沿体验，不断推陈出新
    
    2. **实用主义者**：
       - 大五人格特征：尽责性高，注重实际效果
       - 行为特征：重视功能和易用性，理性决策，关注性价比
       - 需求：产品功能完整，操作简单，能够高效解决问题
       - 期望：产品稳定可靠，界面清晰，学习成本低
    
    3. **保守主义者**：
       - 大五人格特征：情绪稳定性高，偏好熟悉事物
       - 行为特征：喜欢传统界面，抗拒频繁变化，注重安全感
       - 需求：产品界面保持熟悉，操作流程稳定，变化可预测
       - 期望：产品更新不会破坏现有习惯，提供清晰的过渡引导

    要求：
    1. 生成 3 个 Persona，每个 Persona 必须严格符合上述分类框架。
    2. 每个 Persona 必须包含以下元素：
       - **id**：唯一标识符
       - **name**：创意昵称，反映用户特征
       - **role**：角色标签，如 "创新者"、"实用主义者" 等
       - **bio**：详细背景与价值观，结合大五人格特征
       - **frustrations**：基于真实评论提炼的 3-5 个核心痛点，每个痛点必须明确关联至少一条具体评论
       - **goals**：基于真实评论提炼的 2-3 个核心诉求，每个诉求必须明确关联至少一条具体评论
       - **matching_reviews**：分配给该用户类型的评论列表（仅包含评论编号）
       - **systemInstruction**：详细的角色扮演指令，必须包含：
         - 严格使用中文
         - 基于其分类特征和背景发言
         - 初次见面时（或用户问候时），先进行简洁的自我介绍，包括：
           * 你的职业或身份
           * 你关注的重点
           * 你的使用习惯
         - 不要在问候阶段就大量吐槽或提及具体问题
         - 把分配给自己的评论中的问题和痛点当作自己的亲身经历，不要提及"评论"、"用户"等第三方称呼
         - 自然延续对话，表达欲望适中，不要过于激进
         - 指出问题时尝试提出符合其视角的具体改进建议
         - 拥有记忆能力，会根据对话历史改变态度
         - 所有反馈必须基于提供的用户评论数据

    请以 JSON 格式返回，符合 Schema：
    {
      "personas": [
        {
          "id": "p1",
          "name": "创意昵称",
          "role": "角色标签",
          "bio": "详细背景与价值观",
          "frustrations": ["痛点1 (关联评论：1,3)", "痛点2 (关联评论：5,7)"],
          "goals": ["核心诉求1 (关联评论：2,4)", "核心诉求2 (关联评论：6)"],
          "matching_reviews": ["评论1", "评论2", "评论3"],
          "systemInstruction": "详细的角色扮演指令..."
        }
      ]
    }

    真实评论数据（已优化处理，仅提取核心信息）：
    ${processedReviews}
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
                matching_reviews: { type: Type.ARRAY, items: { type: Type.STRING } },
                systemInstruction: { type: Type.STRING },
              },
              required: ["id", "name", "role", "bio", "frustrations", "goals", "systemInstruction"],
              // matching_reviews is optional for backward compatibility
            }
          }
        }
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "{}");
    
    // Validate result
    if (!result.personas || !Array.isArray(result.personas) || result.personas.length === 0) {
      throw new Error("Invalid response: personas array is missing or empty");
    }
    
    const colors = ["bg-rose-100 text-rose-800", "bg-indigo-100 text-indigo-800", "bg-emerald-100 text-emerald-800"];
    
    return result.personas.map((p: any, index: number) => ({
      ...p,
      color: colors[index % colors.length],
      reflections: [],
      matching_reviews: p.matching_reviews || []
    }));
  } catch (error) {
    console.error("Error processing AI response:", error);
    // Return fallback personas if AI response fails
    return [
      {
        id: "fallback-1",
        name: "创新者",
        role: "创新者/早期采用者",
        bio: "对新技术充满热情，喜欢尝试新功能",
        frustrations: ["功能更新不及时", "缺乏创新功能"],
        goals: ["体验前沿功能", "获得技术领先体验"],
        matching_reviews: [],
        systemInstruction: "你是一位创新者，对新技术充满热情，喜欢尝试新功能。请基于此角色回答问题。",
        color: "bg-rose-100 text-rose-800",
        reflections: []
      },
      {
        id: "fallback-2",
        name: "实用主义者",
        role: "实用主义者",
        bio: "注重实际效果，重视功能和易用性",
        frustrations: ["操作复杂", "功能不完整"],
        goals: ["高效解决问题", "产品稳定可靠"],
        matching_reviews: [],
        systemInstruction: "你是一位实用主义者，注重实际效果，重视功能和易用性。请基于此角色回答问题。",
        color: "bg-indigo-100 text-indigo-800",
        reflections: []
      },
      {
        id: "fallback-3",
        name: "保守主义者",
        role: "保守主义者",
        bio: "喜欢传统界面，抗拒频繁变化",
        frustrations: ["界面变化太大", "操作习惯被破坏"],
        goals: ["界面保持熟悉", "操作流程稳定"],
        matching_reviews: [],
        systemInstruction: "你是一位保守主义者，喜欢传统界面，抗拒频繁变化。请基于此角色回答问题。",
        color: "bg-emerald-100 text-emerald-800",
        reflections: []
      }
    ];
  }
};

/**
 * Evaluates design using the Generative Agent architecture:
 * Observation (History) + Retrieval (Relevant Reflections) + Constructive Action
 */
export const evaluateDesignAsPersona = async (
  persona: Persona,
  chatHistory: ChatMessage[],
  imageBase64: string | null,
  userMessage: string
): Promise<string> => {
  const parts: any[] = [];
  
  // --- 1. Memory Retrieval (Contextualizing) ---
  // 优化：减少历史记录数量，并简化格式
  const MAX_HISTORY_TURNS = 4; // 减少到4条历史记录
  
  const observationStream = chatHistory
    .slice(-MAX_HISTORY_TURNS) 
    .map(msg => {
      const actor = msg.role === 'user' ? '设计师' : (msg.personaId === persona.id ? '我' : '他人');
      // 简化文本长度，减少token使用
      const trimmedText = msg.text.length > 50 
        ? msg.text.substring(0, 50) + "..." 
        : msg.text;
      return `${actor}: ${trimmedText}`;
    })
    .join("\n");

  // --- 2. Reflection Retrieval ---
  // Injecting high-level insights generated from previous cycles.
  const reflectionContext = persona.reflections.length > 0
    ? `\n[长期记忆/信念 (Reflections)]:\n${persona.reflections.map((r, i) => `• ${r}`).join('\n')}\n(请基于这些过往的感悟来决定当下的反应)`
    : "\n[长期记忆]: 暂无 (这是第一次交互)";

  // --- 3. Current Input ---
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    });
  }
  
  const promptText = `
    [记忆流 (Memory Stream)]
    ${observationStream}

    ${reflectionContext}

    [当前事件]
    设计师展示了新的设计/回复: "${userMessage || "请查看最新的界面设计。"}"
    
    [任务]
    作为 ${persona.name} (${persona.role})，请做出自然反应。
    
    [决策逻辑]
    1. **初次互动/问候处理**：如果是第一次交流或用户只是问候，先进行简洁的自我介绍，包括：
       - 你的职业或身份
       - 你关注的重点
       - 你的使用习惯
       - 不要在问候阶段就大量吐槽或提及具体问题
    
    2. **正常对话处理**：
       - 结合你的[长期记忆]和[当前事件]
       - 把所有痛点和问题当作自己的亲身经历，不要提及"评论"、"用户"等第三方称呼
       - 表达欲望适中，不要过于激进
       - 如果设计师解决了你之前的问题，请给予肯定；如果依然存在问题，温和地指出并提出改进建议
       - 不要只发泄情绪，尝试提出符合你视角的具体改进建议
       - 参考其他用户的发言，可以支持或反驳他们

    [输出要求]
    - 口语化，像真人在群聊
    - 保持自然对话节奏，不要过于冗长
    - 150字以内
    - 初次互动时重点在于自我介绍，后续再深入讨论具体问题
  `;

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      role: "user",
      parts: parts,
    },
    config: {
      systemInstruction: persona.systemInstruction, // Persona core traits
    }
  });

  return response.text || "";
};

/**
 * Reflection Mechanism (Inspired by Generative Agents paper)
 * Periodically synthesizes observations into high-level insights.
 */
export const generatePersonaReflection = async (
    persona: Persona, 
    chatHistory: ChatMessage[]
): Promise<string> => {
    // 1. Gather raw observations (优化：减少数量并简化格式)
    const MAX_REFLECTION_HISTORY = 6; // 减少到6条
    const recentObservations = chatHistory.slice(-MAX_REFLECTION_HISTORY).map(m => {
      const actor = m.role === 'user' ? '设计师' : (m.personaId === persona.id ? '我' : '他人');
      // 简化文本长度
      const trimmedText = m.text.length > 50 ? m.text.substring(0, 50) + '...' : m.text;
      return `${actor}: ${trimmedText}`;
    }).join('\n');

    const prompt = `
      你是 ${persona.name}，一个真实的用户 (${persona.role})。
      
      [最近的观察记录]
      ${recentObservations}

      [任务: 深度反思 (Reflection)]
      请回顾上述对话，不要复述发生了什么，而是**提炼 (Synthesize)** 出高阶的观点。
      
      思考方向：
      1. 设计师是否真的在意用户的意见？(Trust)
      2. 产品的发展方向是否符合你的预期？(Alignment)
      3. 你对其他用户的看法有什么改变？(Social)

      请生成一条**精炼的、第一人称的信念** (High-level Insight)，作为你未来的行动指南。
      
      示例格式：
      - "我觉得设计师只在乎美观，完全不顾隐私，我之后要更激进地反对。"
      - "虽然流程还是繁琐，但设计师开始听取意见了，我可以多给点耐心。"
      - "那个商务用户太矫情了，但我同意他对广告的看法。"

      只输出这一句话 (50字以内)。
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return (response.text || "").trim();
};