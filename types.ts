
export enum BusinessMode {
  CLINIC = 'Clinic',
  LABORATORY = 'Laboratory'
}

export enum CRMStage {
  LEAD = 'Lead',
  EVALUATION = 'Evaluation',
  PROPOSAL = 'Proposal',
  TREATMENT = 'Treatment',
  COMPLETED = 'Completed',
  DESIGN = 'Digital Design',
  PRODUCTION = 'In Production',
  QUALITY_CONTROL = 'QC & Sterilization',
  SHIPPING = 'Out for Delivery'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  duration: number; // minutes
  type: 'Consultation' | 'Surgery' | 'Cleaning' | 'Design' | 'Maintenance';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Proposal {
  id: string;
  title: string;
  items: { description: string; price: number }[];
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf_cnpj?: string;
  address?: {
    street: string;
    number: string;
    neighbor: string;
    city: string;
    state: string;
    zip: string;
  };
  birthday?: string;
  stage: CRMStage;
  lastInteraction: string;
  aiInsights: string[];
  totalValue: number;
  mode: BusinessMode;
  proposals?: Proposal[];
  filesCount?: number;
}

export interface SubUser {
  id: string;
  name: string;
  role: 'Admin' | 'Doctor' | 'Technician' | 'Assistant';
  email: string;
  lastActive: string;
}

export interface Organization {
  id: string;
  name: string;
  mode: BusinessMode;
  patients: Patient[];
  subUsers: SubUser[];
  appointments: Appointment[];
}
