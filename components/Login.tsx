
import React, { useEffect, useState } from 'react';

interface LoginProps {
  onLogin: (provider: 'google' | 'microsoft', userData?: any) => void;
}

const GOOGLE_CLIENT_ID = "515292747893-g46u5ufjdolgdo6iogoumcrnnihi6i3h.apps.googleusercontent.com";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [sdkError, setSdkError] = useState<string | null>(null);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decodificar o JWT (ID Token) para obter informações do usuário
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        provider: 'google'
      };

      onLogin('google', userData);
    } catch (err) {
      console.error("Erro ao processar login do Google:", err);
      setSdkError("Erro ao processar os dados do perfil. Tente novamente.");
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          google.accounts.id.renderButton(
            document.getElementById("googleSignInButton"),
            { 
              theme: "filled_blue", 
              size: "large", 
              width: "320", 
              shape: "pill",
              text: "continue_with",
              logo_alignment: "left"
            }
          );
        } catch (e) {
          console.error("Google Auth Init Error:", e);
        }
      } else {
        // Retry logic se o script ainda não carregou
        setTimeout(initGoogle, 500);
      }
    };

    initGoogle();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)] p-8 lg:p-14 border border-white/20 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black mb-10 shadow-2xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
            O
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">OdontoMind AI</h1>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed px-2 opacity-80">
              Gestão Autônoma e Inteligência Clínica para o Ecossistema Odontológico.
            </p>
          </div>

          <div className="w-full space-y-5 flex flex-col items-center">
            {/* Google Button Container */}
            <div id="googleSignInButton" className="min-h-[50px] transition-all hover:scale-[1.02] active:scale-[0.98]"></div>

            {sdkError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl w-full text-center">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{sdkError}</p>
                <p className="text-[9px] text-rose-400 mt-1 font-bold">Verifique se o domínio está autorizado no Console Google.</p>
              </div>
            )}

            <div className="flex items-center w-full gap-4 py-2">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ou</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <button
              onClick={() => onLogin('microsoft')}
              className="w-full max-w-[320px] flex items-center justify-center gap-4 px-6 py-4 bg-white border-2 border-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm text-sm"
            >
              <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
              Entrar com Microsoft 365
            </button>
          </div>

          <div className="mt-14 pt-10 border-t border-slate-100 w-full text-center">
            <div className="flex justify-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cloud Safe Protocol</span>
            </div>
            <p className="text-[10px] text-slate-400 px-6 leading-relaxed font-bold">
              Sincronização via APIs oficiais Google Workspace & Microsoft Graph.
            </p>
          </div>
        </div>
        
        <div className="mt-14 flex flex-col items-center gap-8">
          <div className="flex gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-500">GCP Certified</span>
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-500">HIPAA Compliant</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black tracking-widest uppercase opacity-40">© 2026 OdontoMind Labs Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
