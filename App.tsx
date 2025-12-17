
import React, { useState, useEffect, useRef } from 'react';
import { RAW_DATA } from './constants';
import { Persona, ChatMessage, BigFiveConfig, BigFiveLevel, BigFiveTrait, AppData, ImpactMetrics } from './types';
import { generatePersonasWithVectors, evaluateDesignAsPersona, analyzeResponseImpact, generatePersonaReflection } from './services/geminiService';

// Icons
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const RobotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const BulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const FileJsonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13h4"/><path d="M10 17h4"/><path d="M10 9h1"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.1.2-2.1.5-3h.001c.3 1.28.6 2.02.999 2.5z"/></svg>;

// --- COMPONENTS ---

const ImpactBadge: React.FC<{ metrics: ImpactMetrics }> = ({ metrics }) => {
    // Determine color intensity based on score. Max typical score ~30-50 depending on multipliers.
    // E (1-5) * S (0.5-1.5) * (1-2) * I (1-5). Max approx 5*1.5*2*5 = 75. 
    // High impact > 15 is worth noting.
    
    const isHighImpact = metrics.total_impact > 15;
    
    if (!isHighImpact) return null;

    return (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 animate-bounce-short z-10 border border-white">
            <FireIcon />
            {metrics.total_impact}
        </div>
    );
};

const PersonaCard: React.FC<{ 
    persona: Persona; 
    position: 'top' | 'left' | 'right' | 'mobile'; 
    isSpeaking: boolean;
    isReflecting: boolean;
    onClick?: () => void;
}> = ({ persona, position, isSpeaking, isReflecting, onClick }) => {
    
    // Config based on position
    const containerClasses = {
        top: "flex-col items-center max-w-md mx-auto w-full",
        left: "flex-col items-end text-right h-full justify-center w-full",
        right: "flex-col items-start text-left h-full justify-center w-full",
        mobile: "flex-row items-center w-[280px] shrink-0 mx-2 first:ml-4 last:mr-4" // Horizontal card for mobile carousel
    };

    const bubbleClasses = {
        top: "mt-2 text-center",
        left: "mr-3 text-right",
        right: "ml-3 text-left",
        mobile: "ml-3 flex-1 text-left"
    };

    const avatarSize = position === 'mobile' ? 'w-12 h-12 text-sm' : 'w-16 h-16 text-lg';
    
    const latestReflection = persona.reflections.length > 0 
        ? persona.reflections[persona.reflections.length - 1] 
        : null;

    return (
        <div 
            onClick={onClick}
            className={`flex ${containerClasses[position]} p-2 relative transition-all duration-300 cursor-pointer hover:brightness-95 group ${isSpeaking && position !== 'mobile' ? 'scale-105 z-10' : 'scale-100 z-0'} ${isSpeaking && position === 'mobile' ? 'bg-blue-50/50 rounded-xl' : ''}`}
        >
            {/* Avatar */}
            <div className={`
                relative rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-500 shrink-0 group-hover:shadow-lg
                ${avatarSize}
                ${isSpeaking ? 'border-blue-500 ring-4 ring-blue-100' : 'border-white'}
                ${isReflecting ? 'animate-bounce ring-4 ring-purple-200 border-purple-400 bg-purple-50' : ''}
                ${persona.color}
            `}>
                {isReflecting ? <BrainIcon /> : <RobotIcon />}
                
                {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 lg:h-4 lg:w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 lg:h-4 lg:w-4 bg-blue-500"></span>
                    </span>
                )}
            </div>
            
            {/* Info Bubble */}
            <div className={`${bubbleClasses[position]} bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-100 relative transition-all duration-500 ${position === 'mobile' ? 'min-w-0' : 'max-w-[240px]'}`}>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 justify-between">
                    <span className="truncate">{persona.name}</span>
                    {isReflecting && <span className="text-[10px] text-purple-500 font-normal animate-pulse whitespace-nowrap">反思中...</span>}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-slate-500 font-medium truncate">{persona.role}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">{persona.age}岁</span>
                </div>
                
                <div className={`flex flex-wrap gap-1 opacity-80 mb-2 ${position === 'left' ? 'justify-end' : 'justify-start'} ${position === 'top' ? 'justify-center' : ''}`}>
                   {Object.entries(persona.bigFive).filter(([_, v]) => v !== 'Medium').slice(0, 2).map(([k, v]) => (
                      <span key={k} className="text-[9px] uppercase bg-slate-100 text-slate-500 px-1 rounded border border-slate-200 whitespace-nowrap">
                         {v === 'High' ? '+' : '-'}{k.substring(0, 3)}
                      </span>
                   ))}
                </div>

                {/* Only show reflection if not mobile or if it's really important, to save space on mobile? 
                    Let's show it on mobile but truncated. 
                */}
                {latestReflection && (
                    <div className="pt-2 border-t border-purple-50 bg-purple-50/30 -mx-3 -mb-3 px-3 pb-3 rounded-b-xl">
                        <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold mb-1">
                            <BrainIcon />
                            <span>核心观点</span>
                        </div>
                        <p className="text-[10px] text-slate-700 italic leading-tight line-clamp-2">
                            "{latestReflection}"
                        </p>
                    </div>
                )}
                
                {/* Visual Hint for Clickability */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow">查看档案</div>
                </div>
            </div>
        </div>
    );
};

const TraitSelector: React.FC<{
  label: string;
  value: BigFiveLevel;
  onChange: (val: BigFiveLevel) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-50 last:border-0 gap-2 sm:gap-0">
      <span className="text-sm font-semibold text-slate-700 w-32">{label}</span>
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
        {(['Low', 'Medium', 'High'] as BigFiveLevel[]).map((level) => {
            const isActive = value === level;
            const activeClass = level === 'High' ? 'bg-blue-500 text-white shadow-sm' : 
                               level === 'Low' ? 'bg-slate-500 text-white shadow-sm' : 
                               'bg-blue-300 text-white shadow-sm';
            
            return (
                <button
                    key={level}
                    onClick={() => onChange(level)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        isActive ? activeClass : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {level}
                </button>
            );
        })}
      </div>
    </div>
  );
};

const PersonaDetailsModal: React.FC<{
    persona: Persona;
    onClose: () => void;
}> = ({ persona, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-scaleIn">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                    <CloseIcon />
                </button>

                {/* Header Profile - Using High Contrast Text */}
                <div className={`p-8 pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 ${persona.color.replace('text', 'bg').replace('100', '50')}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white ${persona.color}`}>
                        <RobotIcon />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">{persona.name}</h2>
                            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-xs font-bold text-slate-800 self-center sm:self-auto shadow-sm">
                                {persona.age}岁 · {persona.role}
                            </span>
                        </div>
                        {/* Improved contrast for Bio text */}
                        <p className="text-slate-900 font-medium text-sm leading-relaxed mb-4">{persona.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {Object.entries(persona.bigFive).map(([trait, level]) => (
                                <span key={trait} className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                    level === 'High' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    level === 'Low' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                    'bg-white text-slate-500 border-slate-200'
                                }`}>
                                    {trait.substring(0,4)}: {level}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 space-y-8 bg-white">
                    
                    {/* Section: Matched Memories (Vector DB Results) */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <DatabaseIcon />
                            <span>真实记忆映射 (Vector Matched Reviews)</span>
                        </h3>
                        <div className="space-y-3">
                            {persona.relevantReviews.length > 0 ? (
                                persona.relevantReviews.map((reviewStr, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl relative group hover:border-blue-200 hover:shadow-sm transition-all">
                                        <div className="absolute top-4 left-3 text-slate-300 text-4xl font-serif leading-none opacity-50">“</div>
                                        <p className="pl-6 text-sm text-slate-700 italic leading-relaxed">
                                            {reviewStr.replace(/^Review by .*?: "/, '').replace(/"$/, '')}
                                        </p>
                                        <div className="mt-2 pl-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            <span>真实来源</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>余弦相似度匹配</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    暂无关联的真实记忆
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-3 text-center">
                            * 这些评论是通过向量检索 (Embedding Retrieval) 从真实数据集中匹配得出的，构成了该合成用户的核心痛点和初始态度。
                        </p>
                    </div>

                    {/* Section: Reflections */}
                    {persona.reflections.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <BrainIcon />
                                <span>即时思维链 (Reflections)</span>
                            </h3>
                            <div className="space-y-2">
                                {persona.reflections.map((ref, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{ref}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'chat'>('setup');
  
  // Setup State
  const [appName, setAppName] = useState<string>("航旅纵横");
  const [appDesc, setAppDesc] = useState<string>("民航官方直销平台，提供值机、航班查询等服务。");
  const [activePersonaTab, setActivePersonaTab] = useState<number>(0);
  const [customData, setCustomData] = useState<AppData | null>(null);
  const [reviewMatchCount, setReviewMatchCount] = useState<number>(5);
  
  const [personaConfigs, setPersonaConfigs] = useState<BigFiveConfig[]>([
    { Openness: 'Medium', Conscientiousness: 'High', Extraversion: 'Medium', Agreeableness: 'Low', Neuroticism: 'High' }, // Default Critical User
    { Openness: 'High', Conscientiousness: 'Medium', Extraversion: 'High', Agreeableness: 'High', Neuroticism: 'Low' },   // Default Positive/Social User
    { Openness: 'Low', Conscientiousness: 'Low', Extraversion: 'Low', Agreeableness: 'Medium', Neuroticism: 'Medium' }    // Default Passive/Confused User
  ]);

  // Chat State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [speakingPersonaId, setSpeakingPersonaId] = useState<string | null>(null);
  const [inspectingPersona, setInspectingPersona] = useState<Persona | null>(null);
  
  const turnCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const REFLECTION_INTERVAL = 5; 

  const updatePersonaConfig = (index: number, trait: BigFiveTrait, value: BigFiveLevel) => {
    const newConfigs = [...personaConfigs];
    newConfigs[index] = { ...newConfigs[index], [trait]: value };
    setPersonaConfigs(newConfigs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (json.reviews && Array.isArray(json.reviews)) {
                    setCustomData(json);
                    alert(`成功加载 ${json.reviews.length} 条评论数据！`);
                } else {
                    alert("JSON 格式无效。请确保文件包含 'reviews' 数组。");
                }
            } catch (err) {
                alert("文件解析失败，请检查是否为有效的 JSON。");
            }
        };
        reader.readAsText(file);
    }
  };

  const startSimulation = async () => {
    setView('chat');
    setLoading(true);
    setLoadingStep("正在根据您的设定构建用户画像...");
    
    // Use custom data if available, otherwise default
    const dataToUse = customData || RAW_DATA;

    try {
      // Pass the user-defined match count
      const generated = await generatePersonasWithVectors(dataToUse, appName, appDesc, personaConfigs, reviewMatchCount);
      
      setLoadingStep("匹配过往经历完成。正在初始化焦点小组...");
      setPersonas(generated);
      
      setChatHistory([{
        id: 'sys-1',
        role: 'model',
        text: `焦点小组就位。我根据您的 App 设定，为您匹配了三位具有真实背景的用户。\n他们拥有基于真实评论数据的历史记忆 (Vector Matching)，会根据各自的性格和过往经历对您的设计做出反应。`,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error("Failed to generate personas", err);
      alert("生成失败，请重试。");
      setView('setup');
    } finally {
      setLoading(false);
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
    const noticeId = Date.now().toString();
    setChatHistory(prev => [...prev, {
        id: noticeId,
        role: 'model',
        text: "🧠 正在进行周期性反思 (Synthesizing Insights)...",
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
        setChatHistory(prev => prev.map(msg => 
            msg.id === noticeId 
            ? { ...msg, text: "✨ 反思完成。用户认知模型已更新。" }
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

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };
    
    // Add user message to state immediately
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsEvaluating(true);
    setInputText("");
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : null;
    setSelectedImage(null);

    turnCountRef.current += 1;

    try {
        // We process personas sequentially or in parallel? Parallel is faster.
        // We need to keep the order in which they reply.
        
        // Let's generate all responses first
        const promises = personas.map(async (persona, index) => {
            // Delay slightly to stagger in UI if we were streaming, but here we wait for all.
            await new Promise(r => setTimeout(r, index * 800)); 

            // STEP 1: Persona Speaks (Text only)
            const { text } = await evaluateDesignAsPersona(persona, updatedHistory, imageToSend, userMsg.text);
            
            // STEP 2: The Clerk Evaluates (Metrics) - independent of Persona's self-image
            // We pass the generated text to the Clerk.
            const metrics = await analyzeResponseImpact(persona, userMsg.text, text, updatedHistory);

            return { persona, text, metrics };
        });

        const responses = await Promise.all(promises);

        for (const { persona, text, metrics } of responses) {
            setSpeakingPersonaId(persona.id);
            setChatHistory(prev => [...prev, {
                id: Date.now() + Math.random().toString(),
                role: 'model' as const,
                personaId: persona.id,
                text: text,
                timestamp: Date.now(),
                metrics: metrics // Now verified by The Clerk
            }]);
            await new Promise(r => setTimeout(r, 1000)); // Reading time delay
        }
        setSpeakingPersonaId(null);

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

  // --- VIEW: SETUP SCREEN ---
  if (view === 'setup') {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
              <div className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-6">
                  
                  {/* HEADER */}
                  <div className="text-center py-6">
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                          <span className="bg-blue-600 text-white p-2 rounded-lg"><SettingsIcon /></span>
                          Synthetic User Lab
                      </h1>
                      <p className="text-slate-500 mt-2 text-sm lg:text-lg">基于真实评论数据的多模态用户模拟平台</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* LEFT COLUMN: APP CONTEXT */}
                      <div className="lg:col-span-4 space-y-6">
                          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">1</span>
                                  目标产品上下文
                              </h2>
                              
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-sm font-bold text-slate-800 mb-2">App 名称</label>
                                      <input 
                                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-900 placeholder:text-slate-400"
                                          value={appName}
                                          onChange={e => setAppName(e.target.value)}
                                          placeholder="例如: 航旅纵横"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-slate-800 mb-2">功能描述</label>
                                      <textarea 
                                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition h-32 resize-none leading-relaxed text-slate-900 placeholder:text-slate-400"
                                          value={appDesc}
                                          onChange={e => setAppDesc(e.target.value)}
                                          placeholder="描述 App 的核心功能和目标用户群..."
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">2</span>
                                  数据源 (Vector Matching)
                              </h2>
                              
                              <div className="space-y-4">
                                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                      {customData ? (
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                  <FileJsonIcon />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <div className="text-sm font-bold text-slate-800 truncate">已加载自定义数据</div>
                                                  <div className="text-xs text-slate-500">{customData.reviews?.length} 条评论记录</div>
                                              </div>
                                              <button onClick={() => setCustomData(null)} className="text-xs text-rose-500 hover:underline whitespace-nowrap">移除</button>
                                          </div>
                                      ) : (
                                          <div className="text-center py-2">
                                              <div className="text-sm text-slate-500 mb-2">当前使用默认数据集 (航旅纵横)</div>
                                              <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100 w-full lg:w-auto"
                                              >
                                                  上传 JSON 评论数据
                                              </button>
                                              <input 
                                                  ref={fileInputRef}
                                                  type="file" 
                                                  accept=".json" 
                                                  className="hidden" 
                                                  onChange={handleFileUpload} 
                                              />
                                          </div>
                                      )}
                                  </div>

                                  {/* NEW: Review Match Count Control */}
                                  <div>
                                     <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-slate-800">
                                            记忆深度: {reviewMatchCount} 条
                                        </label>
                                     </div>
                                     <input 
                                        type="range" 
                                        min="3" 
                                        max="50" 
                                        step="1"
                                        value={reviewMatchCount}
                                        onChange={(e) => setReviewMatchCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                     />
                                     <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                                        <span>3 (快)</span>
                                        <span>50 (深)</span>
                                     </div>
                                     <p className="text-xs text-slate-400 leading-normal mt-2">
                                       * 决定每个合成用户将匹配多少条过往真实评论作为其“亲身经历”。数量越多，记忆越丰富，但生成时间略长。
                                     </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* RIGHT COLUMN: PERSONA CONFIG */}
                      <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[500px]">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">3</span>
                                  合成用户人格配置 (Big Five)
                              </h2>
                          </div>

                          {/* TABS */}
                          <div className="flex border-b border-slate-100 bg-slate-50/50">
                              {[0, 1, 2].map(idx => (
                                  <button
                                      key={idx}
                                      onClick={() => setActivePersonaTab(idx)}
                                      className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                                          activePersonaTab === idx 
                                          ? 'text-blue-600 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
                                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                      }`}
                                  >
                                      User {idx + 1}
                                      {activePersonaTab === idx && (
                                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                                      )}
                                  </button>
                              ))}
                          </div>

                          {/* TAB CONTENT */}
                          <div className="p-4 lg:p-8 flex-1">
                              <div className="max-w-xl mx-auto">
                                  <div className="mb-6 flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ${['bg-rose-400', 'bg-indigo-400', 'bg-emerald-400'][activePersonaTab]}`}>
                                          {activePersonaTab + 1}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-slate-800">配置 User {activePersonaTab + 1} 的核心特质</h3>
                                          <p className="text-xs text-slate-500 mt-1">
                                              系统将根据这些特质生成用户的职业、说话风格以及对 App 的态度。
                                          </p>
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                      {(['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'] as BigFiveTrait[]).map(trait => (
                                          <TraitSelector 
                                            key={trait} 
                                            label={trait} 
                                            value={personaConfigs[activePersonaTab][trait]} 
                                            onChange={(v) => updatePersonaConfig(activePersonaTab, trait, v)}
                                          />
                                      ))}
                                  </div>
                              </div>
                          </div>

                          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                              <button 
                                  onClick={startSimulation}
                                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                              >
                                  <RobotIcon />
                                  生成焦点小组
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
            <div className="animate-spin mb-6 text-blue-600 w-12 h-12">
                <RefreshIcon />
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">AI 正在构建智能体</h2>
            <p className="text-slate-500 text-sm mb-6">{loadingStep}</p>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full w-2/3 animate-pulse rounded-full"></div>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: CHAT ---
  const topPersona = personas[0];
  const leftPersona = personas[1];
  const rightPersona = personas[2];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. MOBILE HEADER (Visible < lg) - Horizontal Scroll Carousel */}
      <div className="lg:hidden bg-slate-200 border-b border-white/50 flex flex-col shrink-0 z-20 shadow-sm">
         <div className="flex justify-between items-center px-4 py-2 bg-white/50 backdrop-blur-sm">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Synthetic User Lab</div>
             <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    <BrainIcon />
                    <span>{REFLECTION_INTERVAL - (turnCountRef.current % REFLECTION_INTERVAL)}</span>
                 </div>
                 <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded border border-slate-300">
                    R{turnCountRef.current}
                 </span>
                 <button onClick={() => setView('setup')} className="text-xs text-blue-600 font-medium">重置</button>
             </div>
         </div>
         <div className="flex overflow-x-auto p-2 pb-3 gap-0 snap-x snap-mandatory scrollbar-hide">
            {personas.map((p) => (
               <div key={p.id} className="snap-center shrink-0">
                  <PersonaCard 
                      persona={p} 
                      position="mobile" 
                      isSpeaking={speakingPersonaId === p.id} 
                      isReflecting={isReflecting} 
                      onClick={() => setInspectingPersona(p)}
                  />
               </div>
            ))}
         </div>
      </div>

      {/* 1. DESKTOP HEADER (Visible >= lg) - Original Top Persona Layout */}
      <div className="hidden lg:flex h-40 bg-slate-200 border-b border-white/50 justify-center items-end pb-2 relative shrink-0">
          <div className="absolute top-4 left-4 flex flex-col">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Synthetic User Lab</div>
              <div className="text-[10px] text-slate-400">Target: {appName}</div>
          </div>
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
             <button onClick={() => setView('setup')} className="text-xs text-blue-600 hover:underline mb-1">重置配置</button>
             <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                对话轮次: {turnCountRef.current}
             </span>
             <span className="text-[10px] text-purple-500 font-medium">
                距离下次反思: {REFLECTION_INTERVAL - (turnCountRef.current % REFLECTION_INTERVAL)} 轮
             </span>
          </div>
          {topPersona && <PersonaCard persona={topPersona} position="top" isSpeaking={speakingPersonaId === topPersona.id} isReflecting={isReflecting} onClick={() => setInspectingPersona(topPersona)} />}
      </div>

      {/* 2. MIDDLE SECTION */}
      <div className="flex-1 flex overflow-hidden relative">
          {/* Left Persona (Hidden on mobile) */}
          <div className="hidden lg:flex w-72 bg-slate-200 border-r border-white/50 flex-col justify-center shrink-0">
             {leftPersona && <PersonaCard persona={leftPersona} position="left" isSpeaking={speakingPersonaId === leftPersona.id} isReflecting={isReflecting} onClick={() => setInspectingPersona(leftPersona)} />}
          </div>

          {/* CENTER TABLE */}
          <div className="flex-1 bg-white relative flex flex-col shadow-inner w-full">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 scroll-smooth">
                  {chatHistory.map((msg) => {
                      const sender = personas.find(p => p.id === msg.personaId);
                      const isUser = msg.role === 'user';
                      
                      if (!isUser && !sender) {
                          return (
                              <div key={msg.id} className="flex justify-center my-4 animate-fadeIn">
                                  <span className="bg-purple-50 text-purple-600 text-xs px-4 py-1.5 rounded-full border border-purple-100 font-medium flex items-center gap-2 shadow-sm text-center">
                                      <BrainIcon />
                                      {msg.text}
                                  </span>
                              </div>
                          );
                      }
                      
                      const hasHighImpact = msg.metrics && msg.metrics.total_impact > 15;

                      return (
                        <div key={msg.id} className={`flex gap-2 lg:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-slideIn relative group`}>
                            {!isUser && sender && (
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${sender.color.split(' ')[0]} ${sender.color.split(' ')[1]}`}>
                                    {sender.name[0]}
                                </div>
                            )}

                            <div className={`max-w-[85%] lg:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'} relative`}>
                                {/* Impact Badge - Only for persona messages */}
                                {!isUser && msg.metrics && <ImpactBadge metrics={msg.metrics} />}

                                {isUser ? (
                                    <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md">
                                        {msg.image && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-blue-400">
                                                <img src={msg.image} alt="User Upload" className="max-w-full h-32 lg:h-40 object-cover" />
                                            </div>
                                        )}
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                ) : (
                                    <div className={`bg-slate-50 text-slate-800 px-4 py-3 lg:px-5 lg:py-3 rounded-2xl rounded-tl-none border shadow-sm hover:shadow-md transition-all ${hasHighImpact ? 'border-rose-200 shadow-rose-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-bold text-slate-700">{sender?.name}</span>
                                            {sender && <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-white border border-slate-200 rounded-full">{sender.role}</span>}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || "(无言以对...)"}</p>
                                        
                                        {/* Quantitative Footer */}
                                        {msg.metrics && (
                                            <div className="mt-2 pt-2 border-t border-slate-200/50 flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded">
                                                    <span>Emo:</span> <span className="font-mono text-slate-600">{msg.metrics.emotional_intensity}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded">
                                                    <span>Role:</span> <span className="font-mono text-slate-600">{msg.metrics.role_fit}x</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded">
                                                    <span>Group:</span> <span className="font-mono text-slate-600">+{msg.metrics.group_consensus}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded">
                                                    <span>Pain:</span> <span className="font-mono text-slate-600">{msg.metrics.memory_resonance}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                  })}
                  
                  {isEvaluating && (
                     <div className="flex justify-center py-4">
                        <div className="bg-white border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-blue-500 shadow-sm">
                            <span className="animate-spin"><RefreshIcon /></span>
                            <span>用户正在思考...</span>
                        </div>
                     </div>
                  )}
              </div>
          </div>

          {/* Right Persona (Hidden on mobile) */}
          <div className="hidden lg:flex w-72 bg-slate-200 border-l border-white/50 flex flex-col justify-center shrink-0">
             {rightPersona && <PersonaCard persona={rightPersona} position="right" isSpeaking={speakingPersonaId === rightPersona.id} isReflecting={isReflecting} onClick={() => setInspectingPersona(rightPersona)} />}
          </div>
      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="h-20 lg:h-24 bg-white border-t border-slate-200 p-3 lg:p-4 shrink-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex gap-2 lg:gap-3 h-full items-center">
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
             
             <label className="h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 cursor-pointer transition-all active:scale-95 shrink-0">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <UploadIcon />
             </label>

             <div className="flex-1 relative h-10 lg:h-12">
                 <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入消息..."
                    className="w-full h-full pl-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400 text-sm lg:text-base"
                    disabled={isEvaluating || isReflecting}
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={isEvaluating || isReflecting || (!inputText && !selectedImage)}
                    className="absolute right-1.5 top-1.5 lg:right-2 lg:top-2 h-7 w-8 lg:h-8 lg:w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-90 shadow-sm"
                 >
                    <SendIcon />
                 </button>
             </div>
        </div>
      </div>

      {/* INSPECT MODAL */}
      {inspectingPersona && (
          <PersonaDetailsModal 
              persona={inspectingPersona} 
              onClose={() => setInspectingPersona(null)} 
          />
      )}
    </div>
  );
};

export default App;
