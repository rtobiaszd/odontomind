
import React from 'react';

const Integrations: React.FC = () => {
  const apps = [
    { name: 'Google Workspace', status: 'Connected', icon: '🌐', color: 'bg-blue-50' },
    { name: 'Microsoft 365', status: 'Connect', icon: '🏢', color: 'bg-emerald-50' },
    { name: 'WhatsApp Cloud API', status: 'Connected', icon: '💬', color: 'bg-green-50' },
    { name: 'Telegram Bot', status: 'Connect', icon: '✈️', color: 'bg-sky-50' },
    { name: 'Slack', status: 'Connect', icon: '🐝', color: 'bg-purple-50' },
    { name: 'Webhook (Web)', status: 'Active', icon: '🔗', color: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Integrations Ecosystem</h2>
        <p className="text-slate-500">Connect your tools and let the AI sync everything automatically.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner`}>
              {app.icon}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{app.name}</h3>
            <p className="text-xs text-slate-400 mb-6">Automate your dental workflow with native {app.name} sync.</p>
            <button className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
              app.status === 'Connected' || app.status === 'Active'
                ? 'bg-slate-100 text-slate-400 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}>
              {app.status === 'Connected' || app.status === 'Active' ? '✓ ' + app.status : 'Connect Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-4">Enterprise API & Webhooks</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Build custom integrations using our secure GraphQL endpoint. Automate prosthetic lab orders or connect your proprietary billing system.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm">Documentation</button>
            <button className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-700">Get API Key</button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 13a1 1 0 0 0-1 1v4.29l-5-5a1 1 0 0 0-1.42 1.42l5 5H14a1 1 0 0 0 0 2h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1zm-15-2a1 1 0 0 0 1-1V5.71l5 5a1 1 0 0 0 1.42-1.42l-5-5H10a1 1 0 0 0 0-2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
