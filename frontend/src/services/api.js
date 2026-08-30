import axios from 'axios';

const API = axios.create({
  baseURL: 'https://finnovault-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  deleteAccount: () => API.delete('/auth/delete-account'),
};

export const accountsAPI = {
  getAccounts: () => API.get('/accounts'),
  createAccount: (data) => API.post('/accounts', data),
  updateAccount: (id, data) => API.put(`/accounts/${id}`, data),
  deleteAccount: (id) => API.delete(`/accounts/${id}`),
  transfer: (data) => API.post('/accounts/transfer', data),
};

export const transactionsAPI = {
  getTransactions: (params) => API.get('/transactions', { params }),
  createTransaction: (formData) => API.post('/transactions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateTransaction: (id, formData) => API.put(`/transactions/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteTransaction: (id) => API.delete(`/transactions/${id}`),
  uploadOCR: (formData) => API.post('/transactions/receipt-ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const budgetsAPI = {
  getBudgets: (params) => API.get('/budgets', { params }),
  createBudget: (data) => API.post('/budgets', data),
  updateBudget: (id, data) => API.put(`/budgets/${id}`, data),
  deleteBudget: (id) => API.delete(`/budgets/${id}`),
};

export const goalsAPI = {
  getGoals: () => API.get('/goals'),
  createGoal: (data) => API.post('/goals', data),
  updateGoal: (id, data) => API.put(`/goals/${id}`, data),
  deleteGoal: (id) => API.delete(`/goals/${id}`),
  contribute: (id, data) => API.post(`/goals/${id}/contribute`, data),
};

export const loansAPI = {
  getLoans: () => API.get('/loans'),
  createLoan: (data) => API.post('/loans', data),
  updateLoan: (id, data) => API.put(`/loans/${id}`, data),
  deleteLoan: (id) => API.delete(`/loans/${id}`),
  payEMI: (id, data) => API.post(`/loans/${id}/pay`, data),
};

export const debtAPI = {
  getDebts: () => API.get('/debt'),
  createDebt: (data) => API.post('/debt', data),
  updateDebt: (id, data) => API.put(`/debt/${id}`, data),
  deleteDebt: (id) => API.delete(`/debt/${id}`),
  recordPayment: (id, data) => API.post(`/debt/${id}/payment`, data),
};

export const assetsAPI = {
  getAssets: () => API.get('/assets'),
  createAsset: (formData) => API.post('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateAsset: (id, formData) => API.put(`/assets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAsset: (id) => API.delete(`/assets/${id}`),
};

export const investmentsAPI = {
  getInvestments: () => API.get('/investments'),
  createInvestment: (data) => API.post('/investments', data),
  updateInvestment: (id, data) => API.put(`/investments/${id}`, data),
  deleteInvestment: (id) => API.delete(`/investments/${id}`),
};

export const reportsAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
  downloadReport: (params) => API.get('/reports/download', { params, responseType: 'blob' }),
};

export const notificationsAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}`),
  markAllAsRead: () => API.put('/notifications/mark-all'),
};

export default API;
