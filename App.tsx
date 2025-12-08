import React, { useState, useEffect, useRef } from 'react';
import { RAW_DATA } from './constants';
import { Persona, ChatMessage, AppData } from './types';
import { generatePersonasFromReviews, evaluateDesignAsPersona, generatePersonaReflection } from './services/geminiService';

// Icons
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const RobotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const BulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;

// A Card component for the Synthetic Users
const PersonaCard: React.FC<{ 
    persona: Persona; 
    position: 'top' | 'left' | 'right'; 
    isSpeaking: boolean;
    isReflecting: boolean;
}> = ({ persona, position, isSpeaking, isReflecting }) => {
    
    const containerClasses = {
        top: "flex-col items-center max-w-md mx-auto",
        left: "flex-col items-end text-right h-full justify-center",
        right: "flex-col items-start text-left h-full justify-center"
    };

    const bubbleClasses = {
        top: "mt-2",
        left: "mr-3",
        right: "ml-3"
    };

    const latestReflection = persona.reflections.length > 0 
        ? persona.reflections[persona.reflections.length - 1] 
        : null;

    return (
        <div className={`flex ${containerClasses[position]} p-4 relative transition-all duration-300 ${isSpeaking ? 'scale-105 z-10' : 'scale-100 z-0'}`}>
            <div className={`
                relative w-16 h-16 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-500
                ${isSpeaking ? 'border-blue-500 ring-4 ring-blue-100' : 'border-white'}
                ${isReflecting ? 'animate-bounce ring-4 ring-purple-200 border-purple-400 bg-purple-50' : ''}
                ${persona.color}
            `}>
                {isReflecting ? <BrainIcon /> : <RobotIcon />}
                
                {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                    </span>
                )}
            </div>
            
            <div className={`${bubbleClasses[position]} bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-100 max-w-[240px] relative transition-all duration-500`}>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 justify-between">
                    {persona.name}
                    {isReflecting && <span className="text-[10px] text-purple-500 font-normal animate-pulse">正在反思...</span>}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-2">{persona.role}</p>
                
                <div className="flex flex-wrap gap-1 justify-end opacity-80 mb-2">
                    {persona.frustrations.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 truncate max-w-full">
                            {f.length > 8 ? f.substring(0, 8) + '..' : f}
                        </span>
                    ))}
                </div>

                {/* Reflection/Insight Bubble */}
                {latestReflection && (
                    <div className="pt-2 border-t border-purple-50 bg-purple-50/30 -mx-3 -mb-3 px-3 pb-3 rounded-b-xl">
                        <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold mb-1">
                            <BrainIcon />
                            <span>核心观点 (Insight)</span>
                        </div>
                        <p className="text-[10px] text-slate-700 italic leading-tight">
                            "{latestReflection}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [speakingPersonaId, setSpeakingPersonaId] = useState<string | null>(null);
  const [appData, setAppData] = useState<AppData>(RAW_DATA);
  const [customDataLoaded, setCustomDataLoaded] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(true);
  const [setupData, setSetupData] = useState<{
    researchName: string;
    researchType: string;
    useDefaultData: boolean;
  }>({
    researchName: RAW_DATA.research_info.name,
    researchType: RAW_DATA.research_info.type,
    useDefaultData: true
  });
  // New state for setup file upload
  const [setupFile, setSetupFile] = useState<File | null>(null);
  const [setupLoading, setSetupLoading] = useState<boolean>(false);
  
  // Track turns to trigger reflection
  const turnCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const REFLECTION_INTERVAL = 5;

  // Skip initial setup if we have existing data
  useEffect(() => {
    if (!showSetup) {
      // Don't auto-init, wait for user action
    }
  }, [showSetup]);

  const initFocusGroup = async (data: AppData) => {
    setLoading(true);
    try {
      const generated = await generatePersonasFromReviews(data);
      setPersonas(generated);
      setAppData(data);
      
      const researchName = data.research_info.name || "该研究对象";
      const researchType = data.research_info.type || "应用";
      
      setChatHistory([{
        id: 'sys-1',
        role: 'model',
        text: `焦点小组就位。基于 ${researchName} (${researchType}) 的用户评论，我们生成了三位具备“记忆”与“反思”能力的合成用户。他们会根据您的设计提出具体的修改建议。每 ${REFLECTION_INTERVAL} 轮对话，他们会深度反思一次。`,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error("Failed to generate personas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const jsonData: AppData = JSON.parse(content);
          
          // Reset conversation state for fresh start with new personas
          turnCountRef.current = 0;
          setCustomDataLoaded(true);
          
          // Show loading state immediately
          setLoading(true);
          setChatHistory([{
            id: 'sys-loading',
            role: 'model',
            text: "🔄 正在加载新数据并生成合成用户角色...",
            timestamp: Date.now()
          }]);
          
          // Generate new personas with the uploaded data
          await initFocusGroup(jsonData);
        } catch (error) {
          alert('无效的 JSON 文件格式。请检查文件内容。');
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } else {
      alert('请选择有效的 JSON 文件。');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isReflecting]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const performReflections = async (currentHistory: ChatMessage[]) => {
    setIsReflecting(true);
    
    // Add a system notice
    const noticeId = Date.now().toString();
    setChatHistory(prev => [...prev, {
        id: noticeId,
        role: 'model',
        text: "🧠 正在进行周期性反思 (Synthesizing Insights)... 用户们正在更新他们的长期信念。",
        timestamp: Date.now()
    }]);

    try {
        const updatedPersonas = await Promise.all(personas.map(async (p) => {
            const reflection = await generatePersonaReflection(p, currentHistory);
            return {
                ...p,
                reflections: [...p.reflections, reflection]
            };
        }));
        
        setPersonas(updatedPersonas);
        
        // Update notice
        setChatHistory(prev => prev.map(msg => 
            msg.id === noticeId 
            ? { ...msg, text: "✨ 反思完成。用户们的认知模型已更新，下一轮对话将基于新的信念。" }
            : msg
        ));

    } catch (error) {
        console.error("Reflection failed", error);
    } finally {
        setIsReflecting(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || personas.length === 0 || isEvaluating || isReflecting) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };
    
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsEvaluating(true);
    setInputText("");
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : null;
    setSelectedImage(null);

    turnCountRef.current += 1;

    // 2. Trigger Responses from all 3 personas
    try {
        // Sequential speaking to make it feel more like a conversation, or parallel? 
        // Let's do parallel for speed but display naturally.
        const responses = await Promise.all(personas.map(async (persona) => {
            // Artificial delay variance
            await new Promise(r => setTimeout(r, Math.random() * 1500 + 500));
            
            // Pass full history here for Memory Stream
            const text = await evaluateDesignAsPersona(persona, updatedHistory, imageToSend, userMsg.text);
            return { persona, text };
        }));

        // Display messages one by one to avoid UI jank
        for (const { persona, text } of responses) {
            setSpeakingPersonaId(persona.id);
            setChatHistory(prev => [...prev, {
                id: Date.now() + Math.random().toString(),
                role: 'model' as const,
                personaId: persona.id,
                text: text,
                timestamp: Date.now()
            }]);
            await new Promise(r => setTimeout(r, 800)); // Read time
        }
        setSpeakingPersonaId(null);

        // 3. Check for Reflection Trigger
        if (turnCountRef.current > 0 && turnCountRef.current % REFLECTION_INTERVAL === 0) {
            setIsEvaluating(false); 
            await performReflections(chatHistory.concat(responses.map(r => ({
                id: 'temp', role: 'model', personaId: r.persona.id, text: r.text, timestamp: 0
            }))));
        }

    } catch (err) {
        console.error(err);
    } finally {
      setIsEvaluating(false);
      setSpeakingPersonaId(null);
    }
  };

  const handleSetupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      setSetupFile(file);
    } else {
      alert('请选择有效的 JSON 文件。');
    }
  };

  const handleSetupSubmit = async () => {
    setSetupLoading(true);
    
    try {
      if (setupData.useDefaultData) {
        // 使用默认数据，更新应用名称和类型
        const updatedDefaultData = {
          ...RAW_DATA,
          research_info: {
            ...RAW_DATA.research_info,
            name: setupData.researchName,
            type: setupData.researchType
          }
        };
        setShowSetup(false);
        await initFocusGroup(updatedDefaultData);
      } else {
        // 使用自定义数据，需要先读取文件
        if (!setupFile) {
          alert('请先选择 JSON 文件。');
          setSetupLoading(false);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const jsonData: AppData = JSON.parse(content);
            
            // Update research info with user input
            jsonData.research_info = {
              ...jsonData.research_info,
              name: setupData.researchName,
              type: setupData.researchType
            };
            
            setShowSetup(false);
            setCustomDataLoaded(true);
            await initFocusGroup(jsonData);
          } catch (error) {
            alert('无效的 JSON 文件格式。请检查文件内容。');
            setSetupLoading(false);
          }
        };
        reader.readAsText(setupFile);
      }
    } catch (error) {
      console.error('Setup submission failed:', error);
      setSetupLoading(false);
    }
  };

  // 初始设置界面
  if (showSetup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            <span className="flex items-center justify-center gap-2">
              <BrainIcon />
              Synthetic User Lab
            </span>
          </h1>
          <p className="text-slate-600 mb-6 text-center">
            配置您的研究项目，生成符合学术要求的合成用户角色
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleSetupSubmit(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                研究对象名称
              </label>
              <input
                type="text"
                value={setupData.researchName}
                onChange={(e) => setSetupData({ ...setupData, researchName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="例如：航旅纵横-民航官方直销平台"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                研究对象类型
              </label>
              <select
                value={setupData.researchType}
                onChange={(e) => setSetupData({ ...setupData, researchType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="mobile_app">移动应用</option>
                <option value="web_app">网页应用</option>
                <option value="desktop_app">桌面应用</option>
                <option value="website">网站</option>
                <option value="product">实体产品</option>
                <option value="service">服务</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  数据来源
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  选择使用默认示例数据或上传自定义用户评论数据
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">默认数据</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!setupData.useDefaultData}
                    onChange={(e) => setSetupData({ ...setupData, useDefaultData: !e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="text-sm font-medium text-slate-700">自定义数据</span>
                </label>
              </div>
            </div>

            {/* Custom file upload section - only show if custom data is selected */}
            {!setupData.useDefaultData && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  上传自定义 JSON 数据
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 border-radius-lg cursor-pointer bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="mb-1 text-sm text-slate-500">
                      <span className="font-semibold">点击上传</span> 或拖放文件
                    </p>
                    <p className="text-xs text-slate-500">JSON 文件 (最大 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleSetupFileChange}
                  />
                  {setupFile && (
                    <div className="mt-2 text-sm text-slate-600">
                      📄 已选择文件: {setupFile.name}
                    </div>
                  )}
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={setupLoading}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${setupLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {setupLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  加载中...
                </div>
              ) : (
                '开始研究'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              基于 Google Gemini API | 支持大五人格理论和设计学用户分类
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <div className="animate-spin mb-6 text-blue-600">
            <RefreshIcon />
        </div>
        <h2 className="text-xl font-bold mb-2">正在构建智能体认知模型...</h2>
        <p className="text-slate-400">正在分析数据并生成 Memory Stream 结构...</p>
      </div>
    );
  }

  const topPersona = personas[0];
  const leftPersona = personas[1];
  const rightPersona = personas[2];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. TOP SECTION */}
      <div className="h-40 bg-slate-200 border-b border-white/50 flex justify-center items-end pb-2 relative shrink-0">
          <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Synthetic User Lab v2.0</div>
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
             <div className="flex gap-2">
                <label className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 cursor-pointer transition-all hover:bg-blue-100 hover:text-blue-700">
                    <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                    上传JSON数据
                </label>
                {customDataLoaded && (
                    <span className="text-[10px] text-green-600 font-medium">
                        ✅ 自定义数据已加载
                    </span>
                )}
             </div>
             <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                对话轮次: {turnCountRef.current}
             </span>
             <span className="text-[10px] text-purple-500 font-medium">
                距离下次反思: {REFLECTION_INTERVAL - (turnCountRef.current % REFLECTION_INTERVAL)} 轮
             </span>
          </div>
          {topPersona && <PersonaCard persona={topPersona} position="top" isSpeaking={speakingPersonaId === topPersona.id} isReflecting={isReflecting} />}
      </div>

      {/* 2. MIDDLE SECTION */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* Left Persona */}
          <div className="w-72 bg-slate-200 border-r border-white/50 flex flex-col justify-center shrink-0">
             {leftPersona && <PersonaCard persona={leftPersona} position="left" isSpeaking={speakingPersonaId === leftPersona.id} isReflecting={isReflecting} />}
          </div>

          {/* CENTER TABLE */}
          <div className="flex-1 bg-white relative flex flex-col shadow-inner">
              <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
              >
                  {chatHistory.map((msg) => {
                      const sender = personas.find(p => p.id === msg.personaId);
                      const isUser = msg.role === 'user';
                      
                      // Special System Message
                      if (!isUser && !sender) {
                          return (
                              <div key={msg.id} className="flex justify-center my-4 animate-fadeIn">
                                  <span className="bg-purple-50 text-purple-600 text-xs px-4 py-1.5 rounded-full border border-purple-100 font-medium flex items-center gap-2 shadow-sm">
                                      <BrainIcon />
                                      {msg.text}
                                  </span>
                              </div>
                          );
                      }
                      
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                            {!isUser && sender && (
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${sender.color.split(' ')[0]} ${sender.color.split(' ')[1]}`}>
                                    {sender.name[0]}
                                </div>
                            )}

                            <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                {isUser ? (
                                    <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md">
                                        {msg.image && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-blue-400">
                                                <img src={msg.image} alt="User Upload" className="max-w-full h-40 object-cover" />
                                            </div>
                                        )}
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 text-slate-800 px-5 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-bold text-slate-700">{sender?.name}</span>
                                            {sender && <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-white border border-slate-200 rounded-full">{sender.role}</span>}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        
                                        {/* Identify Constructive Feedback visually if possible, or just style nicely */}
                                        <div className="mt-2 flex items-center gap-1 opacity-20">
                                           <BulbIcon />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isUser && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                                    <UserIcon />
                                </div>
                            )}
                        </div>
                      );
                  })}
                  
                  {isEvaluating && (
                     <div className="flex justify-center py-4">
                        <div className="bg-white border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-blue-500 shadow-sm">
                            <span className="animate-spin"><RefreshIcon /></span>
                            <span>用户正在结合记忆思考中...</span>
                        </div>
                     </div>
                  )}
              </div>
          </div>

          {/* Right Persona */}
          <div className="w-72 bg-slate-200 border-l border-white/50 flex flex-col justify-center shrink-0">
             {rightPersona && <PersonaCard persona={rightPersona} position="right" isSpeaking={speakingPersonaId === rightPersona.id} isReflecting={isReflecting} />}
          </div>

      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="h-24 bg-white border-t border-slate-200 p-4 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex gap-3 h-full items-center">
             {selectedImage && (
                <div className="h-full aspect-square rounded-xl border border-slate-200 overflow-hidden relative group shadow-sm">
                    <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ×
                    </button>
                </div>
             )}
             
             <label className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 cursor-pointer transition-all active:scale-95">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <UploadIcon />
             </label>

             <div className="flex-1 relative h-12">
                 <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="向用户展示新设计，或询问他们的建议..."
                    className="w-full h-full pl-5 pr-14 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                    disabled={isEvaluating || isReflecting}
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={isEvaluating || isReflecting || (!inputText && !selectedImage)}
                    className="absolute right-2 top-2 h-8 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-90 shadow-sm"
                 >
                    <SendIcon />
                 </button>
             </div>
        </div>
      </div>

    </div>
  );
};

export default App;