import axios from 'axios';
import { 
  ResearchIdea, 
  CreateResearchIdeaResponse, 
  GenerateIdeasResponse,
  ExperimentRun,
  CreateExperimentResponse,
  ExperimentStatusResponse
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const researchApi = {
  // Research Ideas
  async createIdea(formData: FormData): Promise<CreateResearchIdeaResponse> {
    const response = await api.post('/research/ideas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAllIdeas(): Promise<ResearchIdea[]> {
    const response = await api.get('/research/ideas');
    return response.data;
  },

  async getIdea(id: string): Promise<ResearchIdea> {
    const response = await api.get(`/research/ideas/${id}`);
    return response.data;
  },

  async generateIdeas(id: string): Promise<GenerateIdeasResponse> {
    const response = await api.post(`/research/ideas/${id}/generate`);
    return response.data;
  },

  // Experiments
  async runExperiment(ideaId: string): Promise<CreateExperimentResponse> {
    const response = await api.post(`/research/ideas/${ideaId}/experiments`);
    return response.data;
  },

  async getAllExperiments(): Promise<ExperimentRun[]> {
    const response = await api.get('/research/experiments');
    return response.data;
  },

  async getExperiment(id: string): Promise<ExperimentStatusResponse> {
    const response = await api.get(`/research/experiments/${id}`);
    return response.data;
  },
};

export default api; 