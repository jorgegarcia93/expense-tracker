import axios from 'axios';
import type {
  Expense,
  CreateExpense,
  Income,
  CreateIncome,
  Deduction,
  CreateDeduction,
  MonthlyRecord,
  MonthlyRecordDetail,
  ImportBatch,
  ImportedTransaction,
  ReviewTransaction,
  TrendAnalysis,
  MonthComparison,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expense API
export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },
  
  getById: async (id: number): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },
  
  getByMonth: async (year: number, month: number): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`/expenses/month/${year}/${month}`);
    return response.data;
  },
  
  create: async (expense: CreateExpense): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', expense);
    return response.data;
  },
  
  update: async (id: number, expense: CreateExpense): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

// Income API
export const incomeApi = {
  getAll: async (): Promise<Income[]> => {
    const response = await api.get<Income[]>('/incomes');
    return response.data;
  },
  
  getById: async (id: number): Promise<Income> => {
    const response = await api.get<Income>(`/incomes/${id}`);
    return response.data;
  },
  
  getByMonth: async (year: number, month: number): Promise<Income[]> => {
    const response = await api.get<Income[]>(`/incomes/month/${year}/${month}`);
    return response.data;
  },
  
  create: async (income: CreateIncome): Promise<Income> => {
    const response = await api.post<Income>('/incomes', income);
    return response.data;
  },
  
  update: async (id: number, income: CreateIncome): Promise<Income> => {
    const response = await api.put<Income>(`/incomes/${id}`, income);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/incomes/${id}`);
  },
};

// Deduction API
export const deductionApi = {
  getAll: async (): Promise<Deduction[]> => {
    const response = await api.get<Deduction[]>('/deductions');
    return response.data;
  },
  
  getById: async (id: number): Promise<Deduction> => {
    const response = await api.get<Deduction>(`/deductions/${id}`);
    return response.data;
  },
  
  getByMonth: async (year: number, month: number): Promise<Deduction[]> => {
    const response = await api.get<Deduction[]>(`/deductions/month/${year}/${month}`);
    return response.data;
  },
  
  create: async (deduction: CreateDeduction): Promise<Deduction> => {
    const response = await api.post<Deduction>('/deductions', deduction);
    return response.data;
  },
  
  update: async (id: number, deduction: CreateDeduction): Promise<Deduction> => {
    const response = await api.put<Deduction>(`/deductions/${id}`, deduction);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/deductions/${id}`);
  },
};

// Monthly Record API
export const monthlyRecordApi = {
  getAll: async (): Promise<MonthlyRecord[]> => {
    const response = await api.get<MonthlyRecord[]>('/monthlyrecords');
    return response.data;
  },
  
  getById: async (id: number): Promise<MonthlyRecordDetail> => {
    const response = await api.get<MonthlyRecordDetail>(`/monthlyrecords/${id}`);
    return response.data;
  },
  
  getByYearMonth: async (year: number, month: number): Promise<MonthlyRecordDetail> => {
    const response = await api.get<MonthlyRecordDetail>(`/monthlyrecords/${year}/${month}`);
    return response.data;
  },
  
  create: async (year: number, month: number, notes?: string): Promise<MonthlyRecord> => {
    const response = await api.post<MonthlyRecord>('/monthlyrecords', { year, month, notes });
    return response.data;
  },
  
  update: async (id: number, notes: string): Promise<MonthlyRecord> => {
    const response = await api.put<MonthlyRecord>(`/monthlyrecords/${id}`, { notes });
    return response.data;
  },
  
  reconcile: async (id: number, notes?: string): Promise<MonthlyRecord> => {
    const response = await api.post<MonthlyRecord>(`/monthlyrecords/${id}/reconcile`, { notes });
    return response.data;
  },
  
  lock: async (id: number): Promise<MonthlyRecord> => {
    const response = await api.post<MonthlyRecord>(`/monthlyrecords/${id}/lock`);
    return response.data;
  },
  
  unlock: async (id: number): Promise<MonthlyRecord> => {
    const response = await api.post<MonthlyRecord>(`/monthlyrecords/${id}/unlock`);
    return response.data;
  },
  
  getTrends: async (
    startYear?: number,
    startMonth?: number,
    endYear?: number,
    endMonth?: number
  ): Promise<TrendAnalysis> => {
    const params = new URLSearchParams();
    if (startYear) params.append('startYear', startYear.toString());
    if (startMonth) params.append('startMonth', startMonth.toString());
    if (endYear) params.append('endYear', endYear.toString());
    if (endMonth) params.append('endMonth', endMonth.toString());
    
    const response = await api.get<TrendAnalysis>(`/monthlyrecords/trends?${params}`);
    return response.data;
  },
  
  compare: async (
    year1: number,
    month1: number,
    year2: number,
    month2: number
  ): Promise<MonthComparison[]> => {
    const response = await api.get<MonthComparison[]>(
      `/monthlyrecords/compare?year1=${year1}&month1=${month1}&year2=${year2}&month2=${month2}`
    );
    return response.data;
  },
};

// Import API
export const importApi = {
  uploadCsv: async (
    file: File,
    config: {
      dateColumnIndex?: number;
      descriptionColumnIndex?: number;
      amountColumnIndex?: number;
      categoryColumnIndex?: number;
      dateFormat?: string;
      hasHeader?: boolean;
      source?: string;
    } = {}
  ): Promise<ImportBatch> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = new URLSearchParams();
    if (config.dateColumnIndex !== undefined) params.append('dateColumnIndex', config.dateColumnIndex.toString());
    if (config.descriptionColumnIndex !== undefined) params.append('descriptionColumnIndex', config.descriptionColumnIndex.toString());
    if (config.amountColumnIndex !== undefined) params.append('amountColumnIndex', config.amountColumnIndex.toString());
    if (config.categoryColumnIndex !== undefined) params.append('categoryColumnIndex', config.categoryColumnIndex.toString());
    if (config.dateFormat) params.append('dateFormat', config.dateFormat);
    if (config.hasHeader !== undefined) params.append('hasHeader', config.hasHeader.toString());
    if (config.source) params.append('source', config.source);
    
    const response = await api.post<ImportBatch>(`/import/csv?${params}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getAllBatches: async (): Promise<ImportBatch[]> => {
    const response = await api.get<ImportBatch[]>('/import/batches');
    return response.data;
  },
  
  getBatchById: async (id: number): Promise<ImportBatch> => {
    const response = await api.get<ImportBatch>(`/import/batches/${id}`);
    return response.data;
  },
  
  getPendingTransactions: async (): Promise<ImportedTransaction[]> => {
    const response = await api.get<ImportedTransaction[]>('/import/pending');
    return response.data;
  },
  
  reviewTransaction: async (id: number, review: ReviewTransaction): Promise<ImportedTransaction> => {
    const response = await api.post<ImportedTransaction>(`/import/transactions/${id}/review`, review);
    return response.data;
  },
  
  addTransactionToMonth: async (transactionId: number, monthlyRecordId: number): Promise<void> => {
    await api.post(`/import/transactions/${transactionId}/add-to-month/${monthlyRecordId}`);
  },
  
  ignoreTransaction: async (id: number): Promise<void> => {
    await api.post(`/import/transactions/${id}/ignore`);
  },
  
  addAllReviewedToMonth: async (batchId: number, monthlyRecordId: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/import/batches/${batchId}/add-all-to-month/${monthlyRecordId}`
    );
    return response.data;
  },
};

export default api;
