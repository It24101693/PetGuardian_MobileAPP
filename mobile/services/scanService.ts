import axios from 'axios';
import { api } from './api';

import { AI_BASE_URL } from './api';

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
  async analyzeImage(imageUri: string): Promise<ScanResult> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const { data } = await axios.post(`${AI_BASE_URL}/predict/enhanced`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  async predictBreed(imageUri: string): Promise<BreedResult> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const { data } = await axios.post(`${AI_BASE_URL}/predict-breed`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  async saveScan(petId: string, result: ScanResult, imageUrl?: string) {
    // This calls our Node backend to log the scan activity
    await api.post('/scans', {
      petId,
      disease: result.diseaseName,
      probability: result.probability,
      imageUrl
    });
  }
};
