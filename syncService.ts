
import { Organization, Patient, SubUser, BusinessMode, CRMStage, Appointment } from './types';

const STORAGE_KEY = 'odontomind_cloud_db';

// Simulação de Endpoints do Workspace do Cliente (Google API / MS Graph)
// Em produção, estas funções chamariam as APIs REST do Google/MS com o token OAuth do usuário.
const WORKSPACE_API = {
  SAVE_DOCUMENT: async (fileName: string, content: any) => {
    console.log(`📡 [WORKSPACE-SYNC] Gravando via API do Cliente: ${fileName}`);
    // Simula a persistência na infraestrutura do cliente (ex: AppDataFolder do Google Drive)
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, version: Date.now() }), 600));
  },
  AUDIT_LOG: async (action: string, user: string) => {
    console.log(`🛡️ [AUDIT] Ação: ${action} por ${user} registrada no Workspace.`);
  }
};

export const cloudDB = {
  fetchState: (): Organization => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        id: 'org_enterprise_001',
        name: 'Workspace Corporativo Ativo',
        mode: BusinessMode.CLINIC,
        patients: [
          { id: 'p1', name: 'Alice Johnson', email: 'alice@example.com', phone: '5511999999', stage: CRMStage.LEAD, lastInteraction: '2h ago', aiInsights: ['WhatsApp Lead'], totalValue: 0, mode: BusinessMode.CLINIC, proposals: [] }
        ],
        subUsers: [{ id: 'u1', name: 'Diretor Clínico', role: 'Admin', email: 'admin@cliente.com', lastActive: 'Agora' }],
        appointments: []
      };
    }
    return JSON.parse(data);
  },

  saveState: async (data: Organization) => {
    // 1. Cache Local para UX imediata
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // 2. Persistência na Infra do Cliente (O dado nunca fica no servidor OdontoMind)
    await WORKSPACE_API.SAVE_DOCUMENT('odontomind_core_db.json', data);
  },

  addPatient: async (patient: Patient) => {
    const state = cloudDB.fetchState();
    state.patients.unshift(patient);
    await cloudDB.saveState(state);
    await WORKSPACE_API.AUDIT_LOG('CREATE_PATIENT', 'Admin');
    return state;
  },

  updatePatient: async (patientId: string, updates: Partial<Patient>) => {
    const state = cloudDB.fetchState();
    state.patients = state.patients.map(p => p.id === patientId ? { ...p, ...updates } : p);
    await cloudDB.saveState(state);
    return state;
  },

  addSubUser: async (user: SubUser) => {
    const state = cloudDB.fetchState();
    if (state.subUsers.find(u => u.email === user.email)) {
      throw new Error("E-mail já presente no diretório do Workspace.");
    }
    state.subUsers.push(user);
    await cloudDB.saveState(state);
    
    // Provisionamento no Workspace
    await WORKSPACE_API.SAVE_DOCUMENT(`governance/access_${user.id}.json`, { 
      grantedBy: 'Admin', 
      permissions: user.role 
    });
    return state;
  },

  removeSubUser: async (userId: string) => {
    const state = cloudDB.fetchState();
    state.subUsers = state.subUsers.filter(u => u.id !== userId);
    await cloudDB.saveState(state);
    return state;
  },

  addAppointment: async (app: Appointment) => {
    const state = cloudDB.fetchState();
    state.appointments.push(app);
    await cloudDB.saveState(state);
    return state;
  },

  deleteAppointment: async (id: string) => {
    const state = cloudDB.fetchState();
    state.appointments = state.appointments.filter(a => a.id !== id);
    await cloudDB.saveState(state);
    return state;
  }
};
