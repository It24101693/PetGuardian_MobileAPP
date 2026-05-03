import { api } from './api';

export interface Vet {
  _id: string;
  name: string;
  clinicName?: string;
  specialization?: string[];
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  rating?: number;
  profileImageUrl?: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  isEmergency?: boolean;
  isAvailable?: boolean;
  distance?: number; // In meters or km
  userId?: string;
  doctors?: Array<{
    name: string;
    specialization?: string;
    experience?: string;
    availableDays?: string[];
  }>;
  availableSlots?: Array<{
    time: string;
    isBooked: boolean;
  }>;
}

export const vetService = {
  async getVets(): Promise<Vet[]> {
    const { data } = await api.get('/vets');
    return data.data;
  },

  async getNearbyVets(lat: number, lng: number, radius: number = 5000): Promise<Vet[]> {
    const { data } = await api.get(`/vets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return data.data;
  },

  async getEmergencyVets(): Promise<Vet[]> {
    const { data } = await api.get('/vets/emergency');
    return data.data;
  },

  async getVetById(id: string): Promise<Vet> {
    const { data } = await api.get(`/vets/${id}`);
    return data.data;
  },

  async createVet(payload: any): Promise<Vet> {
    const { data } = await api.post('/vets', payload);
    return data.data;
  },

  async updateVet(id: string, payload: any): Promise<Vet> {
    const { data } = await api.put(`/vets/${id}`, payload);
    return data.data;
  },

  async deleteVet(id: string): Promise<void> {
    await api.delete(`/vets/${id}`);
  },
};
