
import React from 'react';
import { BusinessMode } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
  isOpen?: boolean;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, mode, setMode, isOpen, t }) => {
  const tabs = [
    { id: 'dashboard', icon: '📊', label: t.dashboard },
    { id: 'crm', icon: mode === BusinessMode.CLINIC ? '🎯' : '📦', label: mode === BusinessMode.CLINIC ? t.crm : t.hub },
    { id: 'schedule', icon: '📅', label: t.schedule },
    { id: 'integrations', icon: '🔌', label: t.integrations },
    { id: 'settings', icon: '⚙️', label: t.settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">O</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-br from-indigo-600 to-blue-500 bg-clip-text text-transparent leading-none">OdontoMind</h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Enterprise AI</span>
          </div>
        </div>

        <div className="mb-8 p-1.5 bg-slate-100 rounded-2xl flex">
          <button 
            onClick={() => setMode(BusinessMode.CLINIC)}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${mode === BusinessMode.CLINIC ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.clinic}
          </button>
          <button 
            onClick={() => setMode(BusinessMode.LABORATORY)}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${mode === BusinessMode.LABORATORY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.lab}
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 mt-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-5 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">🤖</div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Active AI</p>
            <p className="text-sm font-bold mb-4">Gemini 3 Pro</p>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg">
              Manager Panel
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
