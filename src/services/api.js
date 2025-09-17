import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
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

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Servicios de productos
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// Servicios de clientes
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post('/clients', clientData),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
  search: (query) => api.get('/clients/search', { params: { q: query } }),
  getStats: () => api.get('/clients/stats/overview'),
};

// Servicios de proveedores
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
  changeStatus: (id, status) => api.patch(`/suppliers/${id}/status`, { status }),
  getStats: () => api.get('/suppliers/stats/overview'),
  getByCategory: (category) => api.get(`/suppliers/category/${category}`),
  getByStatus: (status) => api.get(`/suppliers/status/${status}`),
  search: (query, filters = {}) => api.get('/suppliers', { 
    params: { 
      search: query,
      ...filters 
    } 
  }),
};

// Servicios de recetas
export const recipesAPI = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (recipeData) => api.post('/recipes', recipeData),
  update: (id, recipeData) => api.put(`/recipes/${id}`, recipeData),
  delete: (id) => api.delete(`/recipes/${id}`),
  getCategories: () => api.get('/recipes/categories'),
  search: (query) => api.get('/recipes/search', { params: { q: query } }),
};

// Servicios de inventario
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  updateStock: (id, stockData) => api.patch(`/inventory/${id}/stock`, stockData),
  getMovements: (id) => api.get(`/inventory/${id}/movements`),
  getLowStock: () => api.get('/inventory/low-stock'),
  getStats: () => api.get('/inventory/stats/overview'),
};

// Servicios de ventas
export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => api.post('/sales', saleData),
  update: (id, saleData) => api.put(`/sales/${id}`, saleData),
  updatePaymentStatus: (id, status) => api.put(`/sales/${id}/payment-status`, { paymentStatus: status }),
  delete: (id) => api.delete(`/sales/${id}`),
  getStats: () => api.get('/sales/stats/overview'),
  getByDateRange: (startDate, endDate) => api.get('/sales/date-range', { 
    params: { startDate, endDate } 
  }),
  getAvailablePackages: () => api.get('/sales/available-packages'),
};

// Servicios de compras
export const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (purchaseData) => api.post('/purchases', purchaseData),
  update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
  delete: (id) => api.delete(`/purchases/${id}`),
  changeStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),
  getStats: () => api.get('/purchases/stats/overview'),
  getBySupplier: (supplierId) => api.get(`/purchases/supplier/${supplierId}`),
};

// Servicios de paquetes
export const packagesAPI = {
  getAll: (params) => api.get('/packages', { params }),
  getById: (id) => api.get(`/packages/${id}`),
  create: (packageData) => api.post('/packages', packageData),
  update: (id, packageData) => api.put(`/packages/${id}`, packageData),
  delete: (id) => api.delete(`/packages/${id}`),
  getStats: () => api.get('/packages/stats/overview'),
  checkStock: (id) => api.get(`/packages/${id}/stock-check`),
};

// Servicios de usuarios (solo admin)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  getStats: () => api.get('/users/stats/overview'),
};

// Servicios de configuración
export const configAPI = {
  getAll: () => api.get('/config'),
  getByKey: (key) => api.get(`/config/${key}`),
  create: (key, value, type, description) => api.post('/config', { key, value, type, description }),
  update: (key, value, type, description) => api.put(`/config/${key}`, { value, type, description }),
  delete: (key) => api.delete(`/config/${key}`),
  getAllValues: () => api.get('/config/values/all'),
};

export default api;
