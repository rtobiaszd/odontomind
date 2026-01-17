
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (provider: 'google' | 'microsoft' | 'demo', userData?: any) => void;
}

const GOOGLE_CLIENT_ID = "515292747893-g46u5ufjdolgdo6iogoumcrnnihi6i3h.apps.googleusercontent.com";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      onLogin('google', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        provider: 'google'
      });
    } catch (err) {
      console.error("Auth Error:", err);
      setIsLoading(false);
    }
  };

  const startDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin('demo', {
        name: 'Dr. Leonardo (Demo)',
        email: 'demo@odontomind.ai',
        picture: 'https://ui-avatars.com/api/?name=Dr+Leonardo&background=4f46e5&color=fff',
        provider: 'demo'
      });
    }, 1200);
  };

  useEffect(() => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large", width: 320, shape: "pill" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-white/20 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-10 shadow-xl shadow-indigo-500/20">O</div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">OdontoMind AI</h1>
          <p className="text-slate-400 text-sm font-medium mb-12 px-6 leading-relaxed italic">Gestão Inteligente para Clínicas e Laboratórios de Alta Performance.</p>

          <div className="w-full space-y-4">
            <div id="googleSignInButton" className="flex justify-center"></div>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 tracking-[0.3em] bg-white px-4">Ambiente Seguro</div>
            </div>

            <button 
              onClick={startDemo}
              disabled={isLoading}
              className="group relative w-full py-5 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-indigo-600 active:scale-95 shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  INICIALIZANDO...
                </span>
              ) : 'EXPLORAR MODO DEMO'}
            </button>
          </div>

          <div className="mt-12 space-y-2 opacity-50">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Empowering Dental Infrastructure</p>
             <p className="text-[9px] text-slate-300 font-medium">v3.1.0-stable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
