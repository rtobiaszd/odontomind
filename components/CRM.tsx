
import React, { useState, useEffect } from 'react';
import { CRMStage, Patient, BusinessMode, Proposal } from '../types';
import { cloudDB } from '../syncService';

interface CRMProps {
  mode: BusinessMode;
  t: any;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  totalValue?: string;
}

const CRM: React.FC<CRMProps> = ({ mode, t }) => {
  const [items, setItems] = useState<Patient[]>([]);
  const [editingItem, setEditingItem] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const clinicStages = [CRMStage.LEAD, CRMStage.EVALUATION, CRMStage.PROPOSAL, CRMStage.TREATMENT, CRMStage.COMPLETED];
  const labStages = [CRMStage.LEAD, CRMStage.DESIGN, CRMStage.PRODUCTION, CRMStage.QUALITY_CONTROL, CRMStage.SHIPPING];
  const stages = mode === BusinessMode.CLINIC ? clinicStages : labStages;

  useEffect(() => {
    const initData = async () => {
      const state = cloudDB.fetchState();
      const filtered = state.patients.filter(p => p.mode === mode);
      setItems(filtered);

      // Automated Logic for initial lead migration if needed
      const p1 = filtered.find(p => p.id === 'p1' && p.stage === CRMStage.LEAD);
      if (p1 && mode === BusinessMode.CLINIC) {
        await updateItemStage('p1', CRMStage.PROPOSAL);
      }
    };
    initData();
  }, [mode]);

  const refreshData = () => {
    const state = cloudDB.fetchState();
    setItems(state.patients.filter(p => p.mode === mode));
  };

  const validate = (item: Patient): boolean => {
    const newErrors: ValidationErrors = {};
    if (!item.name || item.name.trim().length < 3) newErrors.name = 'Mínimo 3 caracteres.';
    if (!item.phone || item.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Telefone inválido.';
    if (item.totalValue < 0) newErrors.totalValue = 'Valor inválido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    const id = 'p_' + Math.random().toString(36).substr(2, 5);
    const newItem: Patient = {
      id,
      name: '',
      email: '',
      phone: '',
      cpf_cnpj: '',
      address: { street: '', number: '', neighbor: '', city: '', state: '', zip: '' },
      stage: stages[0],
      lastInteraction: new Date().toISOString(),
      aiInsights: ['Novo Registro'],
      totalValue: 0,
      mode: mode,
      proposals: [],
      filesCount: 0
    };
    setEditingItem(newItem);
    setErrors({});
  };

  const generateAIProposal = async (item: Patient): Promise<Proposal> => {
    const isClinic = item.mode === BusinessMode.CLINIC;
    const suggestedItems = isClinic 
      ? [
          { description: 'Avaliação Estética Digital', price: 450 },
          { description: 'Tratamento Reabilitador (Lentes)', price: 12500 }
        ]
      : [
          { description: 'Escaneamento e Design CAD', price: 250 },
          { description: 'Fresagem Zircônia Multilayer', price: 1800 }
        ];

    const total = suggestedItems.reduce((sum, i) => sum + i.price, 0);
    
    return {
      id: 'prop_' + Math.random().toString(36).substr(2, 5),
      title: isClinic ? 'Plano de Tratamento Odontológico' : 'Ordem de Serviço Protetética',
      items: suggestedItems,
      total,
      status: 'Draft',
      createdAt: new Date().toISOString()
    };
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    if (validate(editingItem)) {
      let finalItem = { ...editingItem, lastInteraction: new Date().toISOString() };

      if (finalItem.stage === CRMStage.PROPOSAL && (!finalItem.proposals || finalItem.proposals.length === 0)) {
        setIsGenerating(true);
        const aiProp = await generateAIProposal(finalItem);
        finalItem.proposals = [aiProp];
        finalItem.totalValue = aiProp.total;
        finalItem.aiInsights = [...(finalItem.aiInsights || []), 'IA: Proposta Gerada'];
        setIsGenerating(false);
      }

      const exists = items.find(i => i.id === finalItem.id);
      if (exists) {
        await cloudDB.updatePatient(finalItem.id, finalItem);
      } else {
        await cloudDB.addPatient(finalItem);
      }

      setEditingItem(null);
      setErrors({});
      refreshData();
    }
  };

  const updateItemStage = async (id: string, newStage: CRMStage) => {
    const state = cloudDB.fetchState();
    const patient = state.patients.find(p => p.id === id);
    if (!patient) return;

    let updates: Partial<Patient> = { 
      stage: newStage,
      lastInteraction: new Date().toISOString()
    };

    if (newStage === CRMStage.PROPOSAL && (!patient.proposals || patient.proposals.length === 0)) {
      setIsGenerating(true);
      const aiProp = await generateAIProposal(patient);
      updates.proposals = [aiProp];
      updates.totalValue = aiProp.total;
      updates.aiInsights = [...(patient.aiInsights || []), 'IA: Sugestão de Proposta'];
      setIsGenerating(false);
    }

    await cloudDB.updatePatient(id, updates);
    refreshData();
  };

  const onDragStart = (id: string) => setDraggedId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (stage: CRMStage) => {
    if (draggedId) {
      updateItemStage(draggedId, stage);
      setDraggedId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI & Cloud Governance</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            {mode === BusinessMode.CLINIC ? 'Funil de Pacientes' : 'Fluxo de Pedidos'}
          </h2>
        </div>
        <button 
          onClick={handleAddItem}
          className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
        >
          <span className="text-xl">+</span>
          <span>{mode === BusinessMode.CLINIC ? 'ADICIONAR PACIENTE' : 'ADICIONAR PEDIDO'}</span>
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 -mx-4 px-4 lg:-mx-10 lg:px-10 no-scrollbar">
        {stages.map((stage) => (
          <div key={stage} className="min-w-[400px] max-w-[400px] flex flex-col" onDragOver={onDragOver} onDrop={() => onDrop(stage)}>
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2.5rem] shadow-sm mb-6 flex flex-col justify-between h-[120px]">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em]">{stage}</h3>
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500">
                  {items.filter(p => p.stage === stage).length}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Projeção Etapa</p>
                <p className="text-xl font-black text-slate-900">R$ {items.filter(p => p.stage === stage).reduce((s, p) => s + p.totalValue, 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-6 flex-1 kanban-column min-h-[60vh]">
              {items.filter(p => p.stage === stage).map((item) => (
                <div 
                  key={item.id} 
                  draggable 
                  onDragStart={() => onDragStart(item.id)}
                  className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden ${draggedId === item.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  <div className={`h-2 w-full ${item.proposals && item.proposals.length > 0 ? 'ai-shimmer' : 'bg-slate-50'}`}></div>
                  
                  <div className="p-7">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                          {item.name ? item.name.charAt(0) : '?'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-black text-slate-900 text-base leading-tight truncate">{item.name || 'Sem Nome'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold text-emerald-500 uppercase">Sincronizado</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { setEditingItem(item); setErrors({}); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">✏️</button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex flex-col gap-3">
                        {/* E-mail e Telefone */}
                        <div className="flex items-center gap-3 text-slate-500">
                           <span className="text-base">✉️</span>
                           <span className="text-[11px] font-bold truncate tracking-tight">{item.email || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                           <span className="text-base">📞</span>
                           <span className="text-[11px] font-bold tracking-tight">{item.phone || '--'}</span>
                        </div>
                        
                        {/* Endereço Detalhado */}
                        {item.address?.street && (
                          <div className="flex items-start gap-3 text-slate-400 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                             <span className="text-base mt-0.5">📍</span>
                             <span className="text-[10px] font-semibold leading-relaxed">
                                {item.address.street}, {item.address.number}<br/>
                                {item.address.neighbor}, {item.address.city} - {item.address.state}
                             </span>
                          </div>
                        )}

                        {/* Timestamp de Interação */}
                        <div className="flex items-center gap-3 text-indigo-400/60 pt-2">
                           <span className="text-base">🕒</span>
                           <span className="text-[10px] font-black uppercase tracking-widest">Interação: {formatDate(item.lastInteraction)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.aiInsights.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-indigo-100/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Valor Bruto</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">
                          R$ {item.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <button onClick={() => { setEditingItem(item); setErrors({}); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg">DETALHES</button>
                    </div>
                  </div>
                </div>
              ))}
              {items.filter(p => p.stage === stage).length === 0 && (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Aguardando Leads</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setEditingItem(null)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-0 overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
            
            <header className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-950 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-200">
                  {editingItem.name ? editingItem.name.charAt(0) : '?'}
                </div>
                <div>
                   <h3 className="text-3xl font-black tracking-tighter">{editingItem.name || 'Nova Ficha'}</h3>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{editingItem.stage}</p>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} className="w-14 h-14 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all font-bold text-slate-400">✕</button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
              {/* Informações de Contato */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm">👤</div>
                   <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Perfil de Contato</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Nome Completo do Cliente *</label>
                    <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className={`w-full bg-slate-50 border-2 rounded-2xl p-5 font-bold focus:ring-8 focus:ring-indigo-50/50 transition-all ${errors.name ? 'border-rose-400' : 'border-transparent'}`} placeholder="Ex: João da Silva" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">WhatsApp / Celular *</label>
                    <input type="tel" value={editingItem.phone} onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})} className={`w-full bg-slate-50 border-2 rounded-2xl p-5 font-bold transition-all ${errors.phone ? 'border-rose-400' : 'border-transparent'}`} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Email Corporativo</label>
                    <input type="email" value={editingItem.email} onChange={(e) => setEditingItem({...editingItem, email: e.target.value})} className="w-full bg-slate-50 border-transparent border-2 rounded-2xl p-5 font-bold focus:border-indigo-100" placeholder="cliente@exemplo.com" />
                  </div>
                </div>
              </section>

              {/* Logística de Endereço */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm">📍</div>
                   <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Logística e Localização</h4>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Rua / Logradouro</label>
                    <input type="text" value={editingItem.address?.street} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, street: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Nº</label>
                    <input type="text" value={editingItem.address?.number} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, number: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Bairro</label>
                    <input type="text" value={editingItem.address?.neighbor} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, neighbor: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">CEP</label>
                    <input type="text" value={editingItem.address?.zip} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, zip: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Cidade</label>
                    <input type="text" value={editingItem.address?.city} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, city: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">UF</label>
                    <input type="text" value={editingItem.address?.state} onChange={(e) => setEditingItem({...editingItem, address: {...editingItem.address!, state: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                </div>
              </section>

              {/* Etapa do Pipeline */}
              <section className="space-y-6">
                <h4 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em]">Status do Fluxo</h4>
                <div className="grid grid-cols-3 gap-3">
                  {stages.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setEditingItem({...editingItem, stage: s})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${editingItem.stage === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Propostas de IA */}
              {editingItem.proposals && editingItem.proposals.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm">🤖</div>
                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Análise e Orçamento IA</h4>
                  </div>
                  <div className="bg-emerald-50/30 border-2 border-emerald-100 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-600">✨</div>
                    {editingItem.proposals.map(prop => (
                      <div key={prop.id} className="space-y-6">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-slate-900 text-lg">{prop.title}</h5>
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase">Sugerido</span>
                        </div>
                        <div className="space-y-3">
                          {prop.items.map((pi, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-bold text-slate-600 border-b border-emerald-100/30 pb-3">
                              <span>{pi.description}</span>
                              <span className="text-slate-900">R$ {pi.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-6">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor de Investimento</span>
                           <span className="text-3xl font-black text-slate-900 tracking-tighter">R$ {prop.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <footer className="p-10 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-6">
              <button 
                onClick={handleSaveItem} 
                className="flex-1 py-6 bg-slate-950 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-[0.2em] text-xs active:scale-[0.98]"
              >
                CONFIRMAR E SINCRONIZAR
              </button>
              <button onClick={() => setEditingItem(null)} className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black text-xs hover:bg-slate-50 transition-all">DESCARTAR</button>
            </footer>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in">
           <div className="text-center">
             <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-indigo-500/20"></div>
             <p className="text-white font-black uppercase tracking-[0.5em] text-xs">Gemini processando proposta...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
