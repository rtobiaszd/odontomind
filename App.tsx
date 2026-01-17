import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRM from './components/CRM';
import Schedule from './components/Schedule';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import Login from './components/Login';
import { BusinessMode } from './types';
import { translations, Language } from './translations';
import { GoogleGenAI, Modality } from '@google/genai';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessMode, setBusinessMode] = useState<BusinessMode>(BusinessMode.CLINIC);
  const [user, setUser] = useState<{name: string, email: string, picture?: string, provider: string} | null>(null);
  const [lang] = useState<Language>('pt');
  
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
  }, []);

  const toggleVoiceCommand = async () => {
    if (user?.provider === 'demo') {
      alert("Comandos de Voz via Gemini Live requerem uma API Key real vinculada em Configurações.");
      return;
    }

    if (isListening) {
      if (liveSessionRef.current) liveSessionRef.current.close();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Você é o assistente sênior do OdontoMind. Use as ferramentas para navegar no sistema.`,
          tools: [{
            functionDeclarations: [
              {
                name: 'navigateTo',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: { tab: { type: 'STRING' as any, enum: ['dashboard', 'crm', 'schedule', 'integrations', 'settings'] } },
                  required: ['tab']
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            // Função de auxílio interna para encode Base64 performático
            const encodeBase64 = (bytes: Uint8Array) => {
              let binary = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              return btoa(binary);
            };

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const base64 = encodeBase64(new Uint8Array(int16.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: any) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'navigateTo') {
                  setActiveTab(fc.args.tab as string);
                  sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: 'ok' } } }));
                }
              }
            }
          },
          onclose: () => setIsListening(false),
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            setIsListening(false);
          }
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Media Error:", err);
      setIsListening(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('odonto_session');
    localStorage.removeItem('odontomind_cloud_db');
    window.location.reload();
  };

  const onLoginSuccess = (provider: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('odonto_session', JSON.stringify(userData));
  };

  // Garante que 't' seja sempre um objeto plano válido de strings para evitar o erro #31
  const t = useMemo(() => {
    const base = translations[lang] || translations['pt'];
    return base;
  }, [lang]);

  if (!isAuthenticated) return <Login onLogin={onLoginSuccess} />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {user?.provider === 'demo' && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-b-2xl shadow-2xl border-x border-b border-indigo-700">
          Demo Mode Ativo
        </div>
      )}
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} mode={businessMode} setMode={setBusinessMode} t={t} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
             <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold overflow-hidden shadow-xl shadow-slate-100">
                {user?.picture ? <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
             </div>
             <div>
                <p className="font-black text-sm text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{user?.provider === 'demo' ? 'Standard Tier' : 'Enterprise User'}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={toggleVoiceCommand}
                title={user?.provider === 'demo' ? 'Voz indisponível em Demo' : 'Comando de Voz'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-indigo-600 text-white animate-pulse shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
             >
                <span className="text-xl">🎙️</span>
             </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <button onClick={handleLogout} className="text-[11px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors">Sair</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard mode={businessMode} t={t} />}
            {activeTab === 'crm' && <CRM mode={businessMode} t={t} />}
            {activeTab === 'schedule' && <Schedule mode={businessMode} />}
            {activeTab === 'integrations' && <Integrations />}
            {activeTab === 'settings' && <Settings onLogout={handleLogout} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;