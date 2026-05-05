import { api } from './api';

export interface AdminStats {
  totalUsers: number;
  totalPets: number;
  totalAppointments: number;
  owners: number;
  vets: number;
  recentUsers: any[];
  recentPets: any[];
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get('/users/admin/stats');
    return data.data;
  },

  async getAllUsers(): Promise<any[]> {
    const { data } = await api.get('/users');
    return data.data;
  },

  async createUser(userData: any): Promise<any> {
    const { data } = await api.post('/users', userData);
    return data.data;
  },

  async updateUser(id: string, userData: any): Promise<any> {
    const { data } = await api.put(`/users/${id}`, userData);
    return data.data;
  },

  async getUserById(id: string): Promise<any> {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },

 

  async toggleUserStatus(id: string): Promise<any> {
    const { data } = await api.put(`/users/${id}/toggle-status`);
    return data.data;
  }
};
