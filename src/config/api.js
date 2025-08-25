import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://productonebackend.onrender.com/api';

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

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
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

// Funciones de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Funciones de productos
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stockData) => api.put(`/products/${id}/stock`, stockData),
  getLowStock: () => api.get('/products/low-stock'),
};

// Funciones de clientes
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post('/clients', clientData),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Funciones de proveedores
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Funciones de recetas
export const recipesAPI = {
  getAll: (params) => {
    // Agregar populate para productToProduce e ingredients.product
    const apiParams = {
      ...params,
      populate: 'productToProduce,ingredients.product'
    };
    return api.get('/recipes', { params: apiParams });
  },
  getById: (id) => api.get(`/recipes/${id}?populate=productToProduce,ingredients.product`),
  create: (recipeData) => api.post('/recipes', recipeData),
  update: (id, recipeData) => api.put(`/recipes/${id}`, recipeData),
  delete: (id) => api.delete(`/recipes/${id}`),
  getCost: (id) => api.get(`/recipes/${id}/cost`),
  updateStatus: (id, statusData) => api.put(`/recipes/${id}/status`, statusData),
};

// Funciones de ventas
export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => api.post('/sales', saleData),
  updatePaymentStatus: (id, status) => api.put(`/sales/${id}/payment-status`, { paymentStatus: status }),
  getStats: (params) => api.get('/sales/stats/summary', { params }),
};

// Funciones de inventario
export const inventoryAPI = {
  getSummary: () => api.get('/inventory/summary'),
  getLowStock: () => api.get('/inventory/low-stock'),
  adjustStock: (id, stockData) => api.put(`/inventory/${id}/adjust`, stockData),
  getMovements: (id) => api.get(`/inventory/${id}/movements`),
};

// Funciones de usuarios (solo admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
