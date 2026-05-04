import { api } from './api';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'health' | 'system' | 'community' | 'alert';
  isRead: boolean;
  relatedId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<{ notifications: Notification[], unreadCount: number }> {
    const { data } = await api.get('/notifications');
    return {
      notifications: data.data,
      unreadCount: data.unreadCount
    };
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
  
  async sendNotification(payload: { userId: string; title: string; message: string; type: string; priority: string }): Promise<any> {
    const { data } = await api.post('/notifications', payload);
    return data.data;
  }
};
