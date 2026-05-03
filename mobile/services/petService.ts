import { api } from './api';

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  imageUrl?: string;
  qrCode?: string;
  status?: string;
  ownerId?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  medicalNotes?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreatePetPayload {
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  medicalNotes?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
}

export const petService = {
  async getMyPets(): Promise<Pet[]> {
    const { data } = await api.get('/pets');
    return data.data;
  },

  async getPetById(id: string): Promise<Pet> {
    const { data } = await api.get(`/pets/${id}`);
    return data.data;
  },

  async createPet(payload: any): Promise<Pet> {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(payload).forEach(key => {
      if (key === 'imageUrl' && payload[key]) {
        const uri = payload[key];
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri,
          name: filename,
          type,
        } as any);
      } else if (payload[key] !== undefined) {
        if (typeof payload[key] === 'object') {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }
    });

    const { data } = await api.post('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  async updatePet(id: string, payload: any): Promise<Pet> {
    const formData = new FormData();
    
    Object.keys(payload).forEach(key => {
      if (key === 'imageUrl' && payload[key] && payload[key].startsWith('file:')) {
        const uri = payload[key];
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri,
          name: filename,
          type,
        } as any);
      } else if (payload[key] !== undefined) {
        if (typeof payload[key] === 'object') {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }
    });

    const { data } = await api.put(`/pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  async deletePet(id: string): Promise<void> {
    await api.delete(`/pets/${id}`);
  },

  async getPetByQrCode(qrCode: string): Promise<{ pet: Pet; passport: any }> {
    const { data } = await api.get(`/pets/qr/${qrCode}`);
    return data.data;
  },
};
