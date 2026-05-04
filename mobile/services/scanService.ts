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

// ──────────────────────────────────────────────────────────────────────────────
// Hugging Face free Inference API — no key needed for public models
// Model: Falconsai/nsfw_image_detection is public. We use a pet-breed model.
// ──────────────────────────────────────────────────────────────────────────────
const HF_API_URL =
  'https://router.huggingface.co/hf-inference/models/microsoft/resnet-50';

// Known cat breeds (to classify species from HF label)
const CAT_KEYWORDS = [
  'cat', 'kitten', 'feline', 'tabby', 'siamese', 'persian', 'maine coon',
  'bengal', 'ragdoll', 'abyssinian', 'burmese', 'sphynx', 'birman', 'british shorthair',
  'egyptian mau', 'russian blue', 'scottish fold', 'norwegian forest',
];

function labelToSpecies(label: string): 'Cat' | 'Dog' {
  const lower = label.toLowerCase();
  return CAT_KEYWORDS.some(k => lower.includes(k)) ? 'Cat' : 'Dog';
}

function formatBreedLabel(label: string): string {
  // ImageNet labels look like "n02085620 Chihuahua" – strip the synset ID
  return label
    .replace(/^n\d+\s+/, '')      // strip "n02085620 "
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetch image as a Blob-compatible ArrayBuffer for HF API
// ──────────────────────────────────────────────────────────────────────────────
async function fetchImageAsBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
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

  // ── Breed prediction — uses Hugging Face free cloud API (always available) ─
  async predictBreed(imageUri: string): Promise<BreedResult> {
    console.log('Calling HuggingFace Breed API for:', imageUri);

    try {
      // Read image bytes from the local URI
      const imageBuffer = await fetchImageAsBuffer(imageUri);

      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`
        },
        body: imageBuffer,
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const results: { label: string; score: number }[] = await response.json();

      if (!results || results.length === 0) {
        throw new Error('No predictions returned');
      }

      const top = results[0];
      const breed = formatBreedLabel(top.label);
      const species = labelToSpecies(top.label);

      console.log(`HF Breed Prediction: ${breed} (${species}) @ ${(top.score * 100).toFixed(1)}%`);

      return {
        breed,
        species,
        confidence: top.score,
      };
    } catch (err) {
      console.log('HuggingFace API failed, falling back to local service');
      // Fallback to local AI service if HF fails
      return this._predictBreedLocal(imageUri);
    }
  },

  // ── Local fallback (your Flask service via tunnel) ─────────────────────────
  async _predictBreedLocal(imageUri: string): Promise<BreedResult> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    console.log('Calling local AI Breed Service at:', `${AI_BASE_URL}/predict-breed`);
    const { data } = await axios.post(`${AI_BASE_URL}/predict-breed`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Bypass-Tunnel-Reminder': 'true',
      },
      timeout: 15000,
    });

    return data;
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
