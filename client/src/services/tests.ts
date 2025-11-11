import api from './api';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  _id: string;
  title: string;
  pdfUrl: string;
  numQuestions: number;
  questions: Question[];
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateTestData {
  title: string;
  pdfUrl: string;
  numQuestions: number;
  questions: Question[];
}

export interface UpdateTestData {
  title?: string;
  pdfUrl?: string;
  numQuestions?: number;
  questions?: Question[];
}

export const testService = {
  async getAllTests(): Promise<Test[]> {
    const response = await api.get('/tests');
    return response.data.tests;
  },

  async getTestById(id: string): Promise<Test> {
    const response = await api.get(`/tests/${id}`);
    return response.data.test;
  },

  async createTest(data: CreateTestData): Promise<Test> {
    const response = await api.post('/tests', data);
    return response.data.test;
  },

  async updateTest(id: string, data: UpdateTestData): Promise<Test> {
    const response = await api.put(`/tests/${id}`, data);
    return response.data.test;
  },

  async deleteTest(id: string): Promise<void> {
    await api.delete(`/tests/${id}`);
  },
};