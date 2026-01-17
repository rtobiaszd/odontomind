
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BusinessMode } from '../types';

interface DashboardProps {
  mode: BusinessMode;
  t: any;
}

const revenueData = [
  { name: 'Seg', current: 4200, target: 4000 },
  { name: 'Ter', current: 5800, target: 4500 },
  { name: 'Qua', current: 3900, target: 4200 },
  { name: 'Qui', current: 7200, target: 5000 },
  { name: 'Sex', current: 8100, target: 5500 },
  { name: 'Sáb', current: 2500, target: 2000 },
];

const Dashboard: React.FC<DashboardProps> = ({ mode, t }) => {
  const [hasAI, setHasAI] = useState(true);

  useEffect(() => {
    const checkAI = async () => {
      const status = await (window as any).aistudio.hasSelectedApiKey();
      setHasAI(status);
    };
    checkAI();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {!hasAI && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-black text-amber-900 text-xs uppercase tracking-widest">IA Desativada</p>
              <p className="text-amber-700 text-sm font-medium">Configure sua Gemini API Key para habilitar análises preditivas.</p>
            </div>
          </div>
          <button className="bg-amber-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Configurar Agora</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-950 p-8 lg:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            ODONTOMIND {hasAI ? 'IA LIVE' : 'SISTEMA CORE'}
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {mode === BusinessMode.CLINIC ? 'Expansão de Faturamento' : 'Otimização de Lab'}
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {hasAI 
              ? <>Sua IA detectou <strong>R$ 12.400,00</strong> em oportunidades de upsell baseadas no histórico.</>
              : <>Dashboard de monitoramento em tempo real do seu faturamento clínico.</>}
          </p>
          <div className="mt-8 flex gap-4">
            <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
              {hasAI ? 'Gerar Relatório IA' : 'Visualizar Dados'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: 'R$ 84.2k', change: '+18.4%', trend: 'up', icon: '💎' },
          { label: 'Ticket Médio', value: 'R$ 3.8k', change: '+4.2%', trend: 'up', icon: '📈' },
          { label: 'Conversão Lead', value: '32%', change: '+12%', trend: 'up', icon: '🎯' },
          { label: 'Status Sistema', value: 'Conectado', change: 'Ativo', trend: 'neutral', icon: '☁️' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{stat.icon}</span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={5} fillOpacity={0.1} fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
