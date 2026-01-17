
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRM from './components/CRM';
import Schedule from './components/Schedule';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import Login from './components/Login';
import { BusinessMode, CRMStage } from './types';
import { translations, Language } from './translations';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessMode, setBusinessMode] = useState<BusinessMode>(BusinessMode.CLINIC);
  const [user, setUser] = useState<{name: string, email: string, picture?: string, provider: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('pt');
  
  // Voice Control State
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('odonto_session');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setIsAuthenticated(true);
        setUser(data);
      } catch (e) {
        localStorage.removeItem('odonto_session');
      }
    }
    const savedLang = localStorage.getItem('odonto_lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleVoiceCommand = async () => {
    if (isListening) {
      if (liveSessionRef.current) liveSessionRef.current.close();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Você é o assistente de voz do OdontoMind AI. 
          Sua função é navegar no app baseado no comando do usuário.
          Comandos disponíveis: 
          - "dashboard": para ver o resumo.
          - "crm": para ver pacientes ou funil.
          - "agenda": para ver compromissos.
          - "modo laboratório": mudar para modo Lab.
          - "modo clínica": mudar para modo Clínica.
          Se o usuário pedir algo, use as ferramentas disponíveis. Responda de forma curta e profissional.`,
          tools: [{
            functionDeclarations: [
              {
                name: 'navigateTo',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: { tab: { type: 'STRING' as any, enum: ['dashboard', 'crm', 'schedule', 'integrations', 'settings'] } },
                  required: ['tab']
                }
              },
              {
                name: 'setBusinessMode',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: { mode: { type: 'STRING' as any, enum: ['Clinic', 'Laboratory'] } },
                  required: ['mode']
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'navigateTo') {
                  setActiveTab(fc.args.tab as string);
                  sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: 'Navegação concluída' } } }));
                }
                if (fc.name === 'setBusinessMode') {
                  setBusinessMode(fc.args.mode as BusinessMode);
                  sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: 'Modo alterado' } } }));
                }
              }
            }
          },
          onclose: () => setIsListening(false),
          onerror: () => setIsListening(false)
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleLogin = (provider: 'google' | 'microsoft', userData?: any) => {
    if (userData) {
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('odonto_session', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('odonto_session');
  };

  const t = translations[lang];

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard mode={businessMode} t={t} />;
      case 'crm': return <CRM mode={businessMode} t={t} />;
      case 'schedule': return <Schedule mode={businessMode} />;
      case 'integrations': return <Integrations />;
      case 'settings': return <Settings onLogout={handleLogout} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} mode={businessMode} setMode={setBusinessMode} isOpen={isMobileMenuOpen} t={t} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 lg:px-10 lg:py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="flex items-center gap-3">
              {user?.picture ? <img src={user.picture} className="w-10 h-10 rounded-2xl shadow-lg border-2 border-white" /> : <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold">{user?.name.charAt(0)}</div>}
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{businessMode === BusinessMode.CLINIC ? t.welcome_clinic : t.welcome_lab}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
             {/* Voice Input Button */}
             <button 
                onClick={toggleVoiceCommand}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                title="Comando de Voz AI"
             >
               {isListening ? (
                 <div className="flex gap-0.5">
                   <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                   <div className="w-1 h-5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                   <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 </div>
               ) : (
                 <span className="text-xl">🎙️</span>
               )}
             </button>

             <div className="bg-slate-100 p-1 rounded-xl flex items-center">
               {(['pt', 'en', 'es'] as Language[]).map((l) => (
                 <button key={l} onClick={() => { setLang(l); localStorage.setItem('odonto_lang', l); }} className={`px-2 py-1 text-[10px] font-black rounded-lg ${lang === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{l.toUpperCase()}</button>
               ))}
             </div>
             
             <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100">
               {t.logout}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-10">
            {renderContent()}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <button className="pointer-events-auto w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-slate-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-2xl z-10 animate-bounce-slow">🤖</span>
        </button>
      </div>

      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
      `}</style>
    </div>
  );
};

export default App;
