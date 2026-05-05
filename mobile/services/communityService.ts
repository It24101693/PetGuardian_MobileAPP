import { api } from './api';

export interface Post {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  feeling?: string;
  likes: string[];
  comments: Array<{
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export const communityService = {
  async getPosts(filter: 'latest' | 'popular' = 'latest'): Promise<Post[]> {
    const { data } = await api.get(`/community?filter=${filter}`);
    return data.data;
  },

  async createPost(payload: { content: string; image?: string; feeling?: string }): Promise<Post> {
    if (payload.image) {
      const formData = new FormData();
      formData.append('content', payload.content);
      if (payload.feeling) formData.append('feeling', payload.feeling);
      formData.append('title', 'Community Post'); // Backend model requires a title
      
      const filename = payload.image.split('/').pop() || 'post.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: payload.image,
        name: filename,
        type,
      } as any);

      const { data } = await api.post('/community', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } else {
      const { data } = await api.post('/community', { 
        ...payload, 
        title: 'Community Post' // Backend model requires a title
      });
      return data.data;
    }
  },

  async updatePost(id: string, payload: { content: string; feeling?: string }): Promise<Post> {
    const { data } = await api.put(`/community/${id}`, payload);
    return data.data;
  },


  async toggleLike(id: string): Promise<void> {
    await api.post(`/community/${id}/like`);
  }
};

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const chatService = {
  async sendMessage(message: string): Promise<ChatMessage> {
    const { data } = await api.post('/ai/chat', { message });
    return data.data;
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    const { data } = await api.get('/ai/chat/history');
    return data.data;
  }
};
