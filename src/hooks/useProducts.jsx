import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '@/config/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  // Obtener todos los productos
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getAll(params);
      const { products: fetchedProducts, currentPage, totalPages, total, limit } = response.data;
      
      setProducts(fetchedProducts);
      setPagination({
        currentPage,
        totalPages,
        total,
        limit
      });
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError(err.response?.data?.message || 'Error al obtener productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo producto
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar SKU único basado en el nombre
      const sku = generateSKU(productData.name);
      const productWithSKU = { ...productData, sku };
      
      const response = await productsAPI.create(productWithSKU);
      const newProduct = response.data;
      
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, product: newProduct };
    } catch (err) {
      console.error('Error al crear producto:', err);
      const errorMessage = err.response?.data?.message || 'Error al crear producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un producto existente
  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.update(id, productData);
      const updatedProduct = response.data;
      
      setProducts(prev => prev.map(p => 
        p._id === id ? updatedProduct : p
      ));
      
      return { success: true, product: updatedProduct };
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un producto (soft delete)
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await productsAPI.delete(id);
      
      setProducts(prev => prev.filter(p => p._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      const errorMessage = err.response?.data?.message || 'Error al eliminar producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar stock de un producto
  const updateStock = async (id, quantity, operation) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.updateStock(id, { quantity, operation });
      const updatedProduct = response.data;
      
      setProducts(prev => prev.map(p => 
        p._id === id ? updatedProduct : p
      ));
      
      return { success: true, product: updatedProduct };
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar stock';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos con stock bajo
  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getLowStock();
      return response.data;
    } catch (err) {
      console.error('Error al obtener productos con stock bajo:', err);
      setError(err.response?.data?.message || 'Error al obtener productos con stock bajo');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generar SKU único
  const generateSKU = (name) => {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
    return `${namePrefix}-${timestamp}`;
  };

  // Limpiar errores
  const clearError = () => setError(null);

  // Cargar productos al inicializar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    fetchLowStockProducts,
    clearError
  };
};
