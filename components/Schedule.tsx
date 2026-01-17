
import React, { useState, useEffect } from 'react';
import { Appointment, Patient, BusinessMode } from '../types';
import { cloudDB } from '../syncService';

const Schedule: React.FC<{ mode: BusinessMode }> = ({ mode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    dateTime: '',
    duration: 60,
    type: 'Consultation',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    const state = cloudDB.fetchState();
    setAppointments(state.appointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    setPatients(state.patients.filter(p => p.mode === mode));
  }, [mode]);

  const validate = () => {
    const errs = [];
    if (!formData.patientId) errs.push("Selecione um paciente");
    if (!formData.dateTime) errs.push("Selecione data e hora");
    
    // Validar conflito
    const hasConflict = appointments.some(a => 
      new Date(a.dateTime).getTime() === new Date(formData.dateTime!).getTime()
    );
    if (hasConflict) errs.push("Já existe um agendamento para este horário");

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const patient = patients.find(p => p.id === formData.patientId);
      const newApp: Appointment = {
        id: 'app_' + Math.random().toString(36).substr(2, 5),
        patientId: formData.patientId!,
        patientName: patient?.name || 'Unknown',
        dateTime: formData.dateTime!,
        duration: formData.duration!,
        type: formData.type as any,
        status: 'Scheduled',
        notes: formData.notes
      };

      cloudDB.addAppointment(newApp);
      setAppointments([...appointments, newApp].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
      setIsModalOpen(false);
      setFormData({ patientId: '', dateTime: '', duration: 60, type: 'Consultation' });
    }
  };

  const deleteApp = (id: string) => {
    cloudDB.deleteAppointment(id);
    setAppointments(appointments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Agenda Inteligente</h2>
          <p className="text-slate-500 text-sm font-medium">Gerencie o tempo da sua {mode === BusinessMode.CLINIC ? 'clínica' : 'produção'}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
        >
          <span>+ AGENDAR HORÁRIO</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
              <span className="text-5xl mb-4 block">📅</span>
              <p className="font-bold text-slate-400">Nenhum compromisso agendado para hoje.</p>
            </div>
          ) : (
            appointments.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
                <div className="flex flex-col items-center justify-center bg-slate-50 w-20 h-20 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(app.dateTime).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="text-2xl font-black text-slate-900">{new Date(app.dateTime).getDate()}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase">{app.type}</span>
                    <span className="text-[10px] font-bold text-slate-300">● {app.duration} min</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg leading-none">{app.patientName}</h4>
                  <p className="text-sm font-bold text-slate-400 mt-1">Horário: {new Date(app.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteApp(app.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-xs font-bold">EXCLUIR</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <h4 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span> Sugestão da IA
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Sua clínica tem maior produtividade entre <strong className="text-white">09:00 e 11:30</strong>. 
              Tente priorizar procedimentos complexos neste intervalo.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">Novo Agendamento</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Paciente *</label>
                <select 
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data e Hora *</label>
                  <input 
                    type="datetime-local" 
                    value={formData.dateTime}
                    onChange={e => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Duração (min)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipo de Procedimento</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold"
                >
                  <option value="Consultation">Consulta</option>
                  <option value="Surgery">Cirurgia</option>
                  <option value="Cleaning">Limpeza</option>
                  <option value="Design">Planejamento Digital</option>
                </select>
              </div>

              {errors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  {errors.map((err, i) => (
                    <p key={i} className="text-[10px] font-black text-rose-500 uppercase tracking-tight">● {err}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
              >
                CONFIRMAR AGENDAMENTO
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest"
              >
                SAIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
