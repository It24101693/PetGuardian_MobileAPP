import { api } from './api';

export interface Vaccination {
  _id: string;
  petId: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  veterinarianName?: string;
  batchNumber?: string;
  notes?: string;
}

export interface MedicalRecord {
  _id: string;
  petId: string;
  title: string;
  type?: 'diagnosis' | 'treatment' | 'surgery' | 'checkup' | 'lab_result' | 'ai_scan' | 'other';
  recordDate: string;
  diagnosis?: string;
  treatment?: string;
  recoveryStatus?: 'Not Started' | 'In Progress' | 'Improving' | 'Fully Recovered' | 'Chronic';
  medications?: string; // Kept as string for simplicity in frontend form
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
}

export interface HealthPassport {
  _id: string;
  petId: string;
  bloodType?: string;
  allergies?: Array<{ name: string; severity: string; reaction?: string }>;
  currentMedications?: string[];
  dietaryRestrictions?: string;
  specialNeeds?: string;
}

export const healthService = {
  async getPassportByPetId(petId: string): Promise<{
    passport: HealthPassport;
    vaccinations: Vaccination[];
    medicalRecords: MedicalRecord[];
  }> {
    const { data } = await api.get(`/health/pet/${petId}`);
    return data.data;
  },

  async addVaccination(passportId: string, payload: Omit<Vaccination, '_id' | 'petId'>): Promise<Vaccination> {
    const { data } = await api.post(`/health/${passportId}/vaccinations`, payload);
    return data.data;
  },

  async updateVaccination(id: string, payload: Partial<Vaccination>): Promise<Vaccination> {
    const { data } = await api.put(`/health/vaccinations/${id}`, payload);
    return data.data;
  },

  async deleteVaccination(id: string): Promise<void> {
    await api.delete(`/health/vaccinations/${id}`);
  },

  async addMedicalRecord(passportId: string, payload: Omit<MedicalRecord, '_id' | 'petId'>): Promise<MedicalRecord> {
    const { data } = await api.post(`/health/${passportId}/records`, payload);
    return data.data;
  },

  async updateMedicalRecord(id: string, payload: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const { data } = await api.put(`/health/records/${id}`, payload);
    return data.data;
  },

  async deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`/health/records/${id}`);
  },

  async addAllergy(passportId: string, allergy: { name: string; severity: string; reaction?: string }): Promise<HealthPassport> {
    const { data } = await api.post(`/health/${passportId}/allergies`, allergy);
    return data.data;
  },

  async deleteAllergy(passportId: string, allergyId: string): Promise<HealthPassport> {
    const { data } = await api.delete(`/health/${passportId}/allergies/${allergyId}`);
    return data.data;
  },

  async updatePassport(id: string, payload: Partial<HealthPassport>): Promise<HealthPassport> {
    const { data } = await api.put(`/health/${id}`, payload);
    return data.data;
  },
};
