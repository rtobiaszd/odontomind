
import React, { useState, useEffect } from 'react';
import { SubUser } from '../types';
import { cloudDB } from '../syncService';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const state = cloudDB.fetchState();
    setSubUsers(state.subUsers);
    const keyStatus = await (window as any).aistudio.hasSelectedApiKey();
    setHasGeminiKey(keyStatus);
  };

  const handleSetupGemini = async () => {
    await (window as any).aistudio.openSelectKey();
    refreshData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32">
      {/* Gemini Integration Section */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">🤖</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <p className="text-[10px] font-black uppercase tracking-widest">
                {hasGeminiKey ? 'Inteligência Artificial Ativa' : 'IA Desconectada'}
              </p>
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4">Google Gemini Pro</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              O cérebro do OdontoMind. Configure sua chave do Google AI Studio para habilitar previsões de faturamento, análise de leads e comandos de voz.
            </p>
          </div>
          <button 
            onClick={handleSetupGemini}
            className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              hasGeminiKey ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {hasGeminiKey ? 'ALTERAR CHAVE API' : 'CONFIGURAR GEMINI IA'}
          </button>
        </div>
      </section>

      {/* Staff & Workspace Section */}
      <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-xl font-black text-slate-900 tracking-tight">Equipe Corporativa</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Sync Ativo</span>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="pb-6">Integrante</th>
                <th className="pb-6">Cargo</th>
                <th className="pb-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subUsers.map(user => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase">{user.role}</span>
                  </td>
                  <td className="py-6 text-right">
                    <button className="text-slate-300 hover:text-rose-500 font-bold text-[10px] uppercase">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-10 border-t border-slate-100 flex gap-6">
        <div className="flex-1 bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100">
          <h5 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-2">Encerrar Sessão</h5>
          <p className="text-rose-400 text-[11px] font-medium mb-6">Sua conta será desconectada deste terminal.</p>
          <button onClick={onLogout} className="px-8 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200">Logout</button>
        </div>
        <div className="flex-1 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
          <h5 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-2">Segurança de Dados</h5>
          <p className="text-slate-400 text-[11px] font-medium mb-6">O OdontoMind não armazena dados em servidores próprios.</p>
          <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Privacidade</button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
