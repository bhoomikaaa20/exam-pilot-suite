import api from './api';

export interface Answer {
  questionIndex: number;
  selectedAnswer: number;
}

export interface Result {
  _id: string;
  testId: {
    _id: string;
    title: string;
    questions?: any[];
  };
  studentId: {
    _id: string;
    fullName: string;
    email: string;
  };
  answers: Answer[];
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}

export interface SubmitResultData {
  testId: string;
  answers: Answer[];
}

export interface TestResults {
  test: {
    id: string;
    title: string;
  };
  results: Result[];
}

export const resultService = {
  async submitResult(data: SubmitResultData): Promise<{
    id: string;
    testId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
  }> {
    const response = await api.post('/results', data);
    return response.data.result;
  },

  async getMyResults(): Promise<Result[]> {
    const response = await api.get('/results/my');
    return response.data.results;
  },

  async getAllResults(): Promise<Result[]> {
    const response = await api.get('/results/admin/all');
    return response.data.results;
  },

  async getTestResults(testId: string): Promise<TestResults> {
    const response = await api.get(`/results/admin/test/${testId}`);
    return response.data;
  },

  async getResultById(id: string): Promise<Result> {
    const response = await api.get(`/results/${id}`);
    return response.data.result;
  },
};