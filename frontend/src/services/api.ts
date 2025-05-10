import axios from 'axios';
import { ResearchIdea, ExperimentRun, ExperimentResult, AIScientistSettings } from '../types/models';
import { runtimeConfig } from '../utils/runtime-config';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Research Ideas API
export const ideasApi = {
  // Get all research ideas
  getAllIdeas: async (): Promise<ResearchIdea[]> => {
    const response = await api.get('/research/ideas');
    return response.data;
  },
  
  // Get a specific research idea
  getIdea: async (id: string): Promise<ResearchIdea> => {
    const response = await api.get(`/research/ideas/${id}`);
    return response.data;
  },
  
  // Create a new research idea
  createIdea: async (formData: FormData): Promise<ResearchIdea> => {
    const response = await api.post('/research/ideas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Generate hypotheses for an idea
  generateIdeas: async (ideaId: string): Promise<any> => {
    const response = await api.post(`/research/ideas/${ideaId}/generate`);
    return response.data;
  },
};

// Experiments API
export const experimentsApi = {
  // Get all experiments
  getExperiments: async (): Promise<ExperimentRun[]> => {
    const response = await api.get('/research/experiments');
    return response.data;
  },
  
  // Get a specific experiment
  getExperiment: async (id: string): Promise<ExperimentRun> => {
    const response = await api.get(`/research/experiments/${id}`);
    return response.data;
  },
  
  // Create an experiment for an idea
  createExperiment: async (ideaId: string): Promise<ExperimentRun> => {
    const response = await api.post(`/research/ideas/${ideaId}/experiments`);
    return response.data;
  },

  // Get experiment results
  getExperimentResults: async (resultId: string): Promise<ExperimentResult> => {
    const response = await api.get(`/research/experiments/results/${resultId}`);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  // Get task status
  getTaskStatus: async (taskId: string) => {
    const response = await api.get(`/research/tasks/${taskId}`);
    return response.data;
  },
  
  // Cancel a task
  cancelTask: async (taskId: string) => {
    const response = await api.post(`/research/tasks/${taskId}/cancel`);
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  // Get current settings
  getSettings: async (): Promise<AIScientistSettings> => {
    const response = await api.get('/settings/');
    return response.data;
  },
  
  // Update settings
  updateSettings: async (settings: AIScientistSettings): Promise<AIScientistSettings> => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
  
  // Reset settings to defaults
  resetSettings: async (): Promise<AIScientistSettings> => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
};

export default api; 