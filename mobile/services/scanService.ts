import axios from 'axios';
import { api } from './api';
import { AI_BASE_URL, HUGGINGFACE_TOKEN } from './api';

export interface ScanResult {
  diseaseName: string;
  probability: number;
  isEmergency: boolean;
  severity: string;
  treatment: string;
  urgencyMessage?: string;
  homeCare?: string[];
  symptoms?: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface BreedResult {
  breed: string;
  species: string;
  confidence: number;
}

export const scanService = {
  // ── Disease scan — uses your local/hosted Flask AI service ────────────────
  async analyzeImage(imageUri: string): Promise<ScanResult> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    console.log('Calling AI Disease Service at:', `${AI_BASE_URL}/predict/enhanced`);
    const { data } = await axios.post(`${AI_BASE_URL}/predict/enhanced`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Bypass-Tunnel-Reminder': 'true',
      },
      timeout: 30000,
    });

    return data;
  },

  // ── Breed prediction — uses your deployed AI service ─
  async predictBreed(imageUri: string): Promise<BreedResult> {
    console.log('🔍 Starting breed prediction for:', imageUri);
    
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      console.log('📤 Calling AI Breed Service at:', `${AI_BASE_URL}/predict-breed`);
      
      const { data } = await axios.post(`${AI_BASE_URL}/predict-breed`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Bypass-Tunnel-Reminder': 'true',
        },
        timeout: 30000,
      });

      console.log('✅ Breed prediction successful:', data);
      
      return {
        breed: data.breed || 'Unknown',
        species: data.species || 'Dog',
        confidence: data.confidence || 0,
      };
    } catch (err: any) {
      console.error('❌ Breed prediction error:', err.message);
      if (err.response) {
        console.error('❌ Error response:', err.response.data);
        console.error('❌ Error status:', err.response.status);
      }
      
      // Return a default result instead of throwing
      console.log('⚠️ Returning default breed result');
      return {
        breed: 'Unknown',
        species: 'Dog',
        confidence: 0,
      };
    }
  },

  async saveScan(petId: string, result: ScanResult, imageUrl?: string) {
    await api.post('/scans', {
      petId,
      disease: result.diseaseName,
      probability: result.probability,
      imageUrl,
    });
  },
};
