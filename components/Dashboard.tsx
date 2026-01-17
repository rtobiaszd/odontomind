
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
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
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-950 p-8 lg:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            ODONTOMIND AI LIVE
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {mode === BusinessMode.CLINIC ? 'Expansão de Faturamento' : 'Otimização de Lab'}
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Sua IA detectou <strong>R$ 12.400,00</strong> em oportunidades de upsell baseadas no histórico dos leads atuais.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
              Gerar Relatório IA
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-white/10 transition-all">
              Ver Insights
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-y-1/4 translate-x-1/4">
          <div className="w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: 'R$ 84.2k', change: '+18.4%', trend: 'up', icon: '💎' },
          { label: 'Ticket Médio', value: 'R$ 3.8k', change: '+4.2%', trend: 'up', icon: '📈' },
          { label: 'Conversão Lead', value: '32%', change: '+12%', trend: 'up', icon: '🎯' },
          { label: 'ROI da IA', value: '4.2x', change: 'Ativo', trend: 'neutral', icon: '🤖' },
        ].map((stat, i) => (
          <div key={i} className="glass-effect p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
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
        <div className="xl:col-span-2 glass-effect p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fluxo de Caixa Semanal</h3>
              <p className="text-sm text-slate-400 font-medium">Performance real vs Metas da IA</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-600"></span><span className="text-[10px] font-bold text-slate-400">REAL</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-200"></span><span className="text-[10px] font-bold text-slate-400">META</span></div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px'}}
                />
                <Area type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-4">Meta do Trimestre</h4>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black tracking-tighter">R$ 250k</span>
                <span className="text-indigo-200 font-bold mb-1">/ R$ 300k</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
                <div className="w-[83%] h-full bg-white rounded-full"></div>
              </div>
              <p className="text-sm font-medium text-indigo-100">83% da meta atingida. Projeção indica conclusão em 12 dias.</p>
            </div>
          </div>

          <div className="glass-effect p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h4 className="text-lg font-black text-slate-900 mb-6">Próximos Passos (IA)</h4>
            <div className="space-y-4">
              {[
                { title: 'Cobrar Lead Alice', meta: 'R$ 4.2k', icon: '📞' },
                { title: 'Revisar Lab Job #42', meta: 'Urgente', icon: '🔬' },
                { title: 'Aprovar Orçamento', meta: 'Alta Margem', icon: '💰' },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="text-xl">{task.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 leading-none">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{task.meta}</p>
                  </div>
                  <div className="text-slate-300">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;