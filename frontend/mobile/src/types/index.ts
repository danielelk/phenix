export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'accompagnateur' | 'adherent' | 'benevole';
  phone?: string;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  type: 'with_adherents' | 'without_adherents' | 'br';
  max_participants?: number;
  participant_count?: number;
  transport_available: boolean;
  transport_capacity?: number;
  is_paid: boolean;
  price?: number;
  status?: 'pending' | 'started' | 'completed';
  started_at?: string;
  completed_at?: string;
  created_by?: number;
  recurring_activity_id?: number;
}

export interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  needs_transport: boolean;
  present?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
}

export interface Expense {
  id: number;
  activity_id: number;
  title: string;
  amount: number;
  description?: string;
  created_at: string;
  created_by?: number;
}

export interface Presence {
  userId: number;
  present: boolean;
}

export interface ManualParticipant {
  firstName: string;
  lastName: string;
  phone?: string;
  present: boolean;
  temporary: boolean;
}