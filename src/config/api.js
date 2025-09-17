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

// Interceptor para agregar token de autenticación y tenant
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar tenant ID si está disponible
    const tenantId = localStorage.getItem('selectedTenant');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
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
    // Solo redirigir si es un error 401 y NO es una llamada de refresh o profile
    if (error.response?.status === 401) {
      const isRefreshCall = error.config?.url?.includes('/auth/refresh');
      const isProfileCall = error.config?.url?.includes('/auth/profile');
      
      // Log para debugging
      console.warn('Error 401 detectado:', {
        url: error.config?.url,
        isRefreshCall,
        isProfileCall,
        timestamp: new Date().toISOString()
      });
      
      // Solo hacer logout automático si no es una llamada de refresh o profile inicial
      if (!isRefreshCall && !isProfileCall) {
        console.warn('Realizando logout automático por token inválido');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
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
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
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
  getStats: () => api.get('/products/stats'),
};

// Funciones de clientes
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post('/clients', clientData),
  update: (id, clientData) => api.put(`/clients/${id}`, clientData),
  delete: (id) => api.delete(`/clients/${id}`),
  getStats: () => api.get('/clients/stats'),
};

// Funciones de proveedores
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getStats: () => api.get('/suppliers/stats'),
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

// Funciones de lotes
export const batchesAPI = {
  getAll: (params) => api.get('/batches', { params }),
  getById: (id) => api.get(`/batches/${id}`),
  create: (batchData) => api.post('/batches', batchData),
  update: (id, batchData) => api.put(`/batches/${id}`, batchData),
  delete: (id) => api.delete(`/batches/${id}`),
  consumeStock: (id, quantity) => api.put(`/batches/${id}/consume`, { quantity }),
  restoreStock: (id, quantity) => api.put(`/batches/${id}/restore`, { quantity }),
  getActiveByProduct: (productId) => api.get(`/batches/product/${productId}/active`),
  getStats: () => api.get('/batches/stats/overview'),
  getExpiringSoon: (days = 30) => api.get(`/batches/expiring-soon?days=${days}`),
};

// Funciones de ventas
export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => api.post('/sales', saleData),
  updatePaymentStatus: (id, status) => api.put(`/sales/${id}/payment-status`, { paymentStatus: status }),
  getStats: (params) => api.get('/sales/stats/summary', { params }),
  getTopProducts: (params) => api.get('/sales/stats/top-products', { params }),
  getMonthlyData: (params) => api.get('/sales/stats/monthly', { params }),
};

// Funciones de compras
export const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (purchaseData) => api.post('/purchases', purchaseData),
  update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
  delete: (id) => api.delete(`/purchases/${id}`),
  changeStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),
  receive: (id) => api.post(`/purchases/${id}/receive`),
  getStats: () => api.get('/purchases/stats/summary'),
};

// Funciones de inventario
export const inventoryAPI = {
  getSummary: () => api.get('/inventory/summary'),
  getLowStock: () => api.get('/inventory/low-stock'),
  adjustStock: (id, stockData) => api.put(`/inventory/${id}/adjust`, stockData),
  getMovements: (id) => api.get(`/inventory/${id}/movements`),
  getStats: () => api.get('/inventory/stats/summary'),
};

// Funciones de usuarios (solo admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Funciones del dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getMonthlyData: (year) => api.get(`/dashboard/monthly-sales?year=${year}`),
};

// Funciones del perfil de usuario
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
  getLoginHistory: () => api.get('/profile/login-history'),
  updateNotifications: (data) => api.put('/profile/notifications', data),
  updateTheme: (data) => api.put('/profile/theme', data),
};

// Funciones de paquetes
export const packagesAPI = {
  getAll: (params) => api.get('/packages', { params }),
  getById: (id) => api.get(`/packages/${id}`),
  create: (packageData) => api.post('/packages', packageData),
  update: (id, packageData) => api.put(`/packages/${id}`, packageData),
  delete: (id) => api.delete(`/packages/${id}`),
  getStats: () => api.get('/packages/stats/overview'),
  checkStock: (id) => api.get(`/packages/${id}/stock-check`),
};

// Exportar tanto la instancia api como las APIs específicas
export { api };
export default api;
