
import React, { useState, useEffect } from 'react';
import { SubUser } from '../types';
import { cloudDB } from '../syncService';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubStatus, setGithubStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'Doctor' as SubUser['role']
  });

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    const state = cloudDB.fetchState();
    setSubUsers(state.subUsers);
  };

  const handleGithubSync = () => {
    setGithubStatus('syncing');
    // Simulação de push para o repositório rtobiaszd/odontomind
    setTimeout(() => {
      setGithubStatus('success');
      setTimeout(() => setGithubStatus('idle'), 3000);
    }, 2000);
  };

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email) {
      alert("Preencha todos os campos corporativos.");
      return;
    }
    setIsSyncing(true);
    try {
      const newUser: SubUser = {
        id: 'u_' + Math.random().toString(36).substr(2, 5),
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        lastActive: 'Pendente Sync'
      };
      await cloudDB.addSubUser(newUser);
      refreshUsers();
      setIsModalOpen(false);
      setNewUserData({ name: '', email: '', role: 'Doctor' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Revogar acesso deste usuário do Workspace?")) {
      setIsSyncing(true);
      await cloudDB.removeSubUser(id);
      refreshUsers();
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      {/* GitHub Repository Sync Section */}
      <section className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm overflow-hidden relative group">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">GitHub Repository Sync</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">rtobiaszd/odontomind</p>
            </div>
          </div>
          <button 
            onClick={handleGithubSync}
            disabled={githubStatus !== 'idle'}
            className={`px-10 py-5 rounded-2xl font-black text-xs transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
              githubStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
            }`}
          >
            {githubStatus === 'idle' && 'SINCRONIZAR CÓDIGO'}
            {githubStatus === 'syncing' && 'FAZENDO PUSH...'}
            {githubStatus === 'success' && '✓ REPOSITÓRIO ATUALIZADO'}
          </button>
        </div>
      </section>

      {/* Workspace Banner */}
      <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">🛡️</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sincronização Ativa com Workspace</p>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">Governança de Dados</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
              A OdontoMind opera em modo <strong>Zero-Persistence</strong>. Seus dados e lista de staff residem exclusivamente no seu tenant corporativo.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl flex items-center gap-3 active:scale-95"
          >
            + ADICIONAR AO WORKSPACE
          </button>
        </div>
      </section>

      {/* Staff List Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Staff da Organização</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sincronizado via Google/MS Graph</span>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Integrante</th>
                <th className="px-10 py-6">Cargo</th>
                <th className="px-10 py-6">Infra Cloud</th>
                <th className="px-10 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Verificado</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Último Acesso: {user.lastActive}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleRevoke(user.id)}
                      className="text-slate-300 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Safety & Logout */}
      <section className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
           <h4 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-2">Sair do Sistema</h4>
           <p className="text-rose-400 text-xs font-medium mb-6">Sua sessão será encerrada. O token de acesso ao Workspace será revogado localmente.</p>
           <button 
            onClick={onLogout}
            className="px-8 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] hover:bg-rose-600 transition-all uppercase tracking-widest"
          >
            Encerrar Sessão
          </button>
        </div>
        <div className="flex-1 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
           <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-2">Exportação Bruta</h4>
           <p className="text-slate-500 text-xs font-medium mb-6">Baixe o dump completo do seu banco de dados JSON hospedado no Workspace.</p>
           <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Download .JSON</button>
        </div>
      </section>

      {/* New Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Convidar Staff</h3>
              <p className="text-slate-500 text-sm font-medium">O novo usuário será provisionado no Workspace.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome</label>
                <input 
                  type="text" 
                  value={newUserData.name}
                  onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                <input 
                  type="email" 
                  value={newUserData.email}
                  onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Função</label>
                <select 
                  value={newUserData.role}
                  onChange={e => setNewUserData({...newUserData, role: e.target.value as any})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm"
                >
                  <option value="Doctor">Doutor</option>
                  <option value="Technician">Técnico</option>
                  <option value="Assistant">Secretaria</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <button 
                onClick={handleCreateUser}
                disabled={isSyncing}
                className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando Workspace...' : 'Salvar no Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
