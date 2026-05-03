import { api } from './api';

export interface Appointment {
  _id: string;
  petId: { _id: string; name: string; species: string; imageUrl?: string } | string;
  ownerId: { _id: string; fullName: string; phoneNumber?: string; email: string } | string;
  vetId?: { _id: string; name: string; clinicName?: string; phone?: string } | string;
  appointmentDate: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt?: string;
}

export interface CreateAppointmentPayload {
  petId: string;
  vetId?: string;
  vetUserId?: string;
  appointmentDate: string;
  appointmentTime?: string;
  reason?: string;
  status?: string;
  notes?: string;
}

export const appointmentService = {
  async getMyAppointments(): Promise<Appointment[]> {
    const { data } = await api.get('/appointments');
    return data.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const { data } = await api.get(`/appointments/${id}`);
    return data.data;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.post('/appointments', payload);
    return data.data;
  },

  async updateAppointment(id: string, payload: Partial<Appointment>): Promise<Appointment> {
    const { data } = await api.put(`/appointments/${id}`, payload);
    return data.data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
