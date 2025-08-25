import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, productsAPI } from '@/config/api';
import { toast } from 'react-hot-toast';

// Función auxiliar para extraer datos de la respuesta de la API
const extractDataFromResponse = (response) => {
  console.log('Extrayendo datos de respuesta:', response);
  
  // Si response.data es un array, usarlo directamente
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  // Si response.data tiene una propiedad 'data' que es un array
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // Si response.data tiene una propiedad 'products' que es un array
  if (response.data && Array.isArray(response.data.products)) {
    return response.data.products;
  }
  
  // Si response.data tiene una propiedad 'items' que es un array
  if (response.data && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  
  // Si response.data es un objeto con propiedades que son arrays
  if (response.data && typeof response.data === 'object') {
    const keys = Object.keys(response.data);
    for (const key of keys) {
      if (Array.isArray(response.data[key])) {
        console.log(`Encontrado array en propiedad '${key}':`, response.data[key]);
        return response.data[key];
      }
    }
  }
  
  // Si no se encuentra ningún array, devolver array vacío
  console.warn('No se encontró ningún array en la respuesta:', response);
  return [];
};

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });

  // Cargar todos los productos del inventario
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando carga de inventario...');
      const response = await productsAPI.getAll({ isActive: true });
      console.log('Respuesta completa de la API:', response);
      
      // Usar la función auxiliar para extraer datos
      const productsData = extractDataFromResponse(response);
      
      if (!Array.isArray(productsData) || productsData.length === 0) {
        console.log('No se encontraron productos o la respuesta está vacía');
        setInventory([]);
        setError(null); // No es un error, solo no hay productos
        return;
      }
      
      console.log('Procesando', productsData.length, 'productos...');
      const products = productsData.map(product => {
        const processedProduct = {
          id: product._id || product.id,
          productName: product.name || 'Sin nombre',
          category: product.category || 'Sin categoría',
          currentStock: product.stock || 0,
          minStock: product.minStock || 0,
          unit: product.unit || 'unidad',
          cost: product.cost || 0,
          supplier: product.supplier?.name || product.supplier || 'Sin proveedor',
          sku: product.sku || 'N/A',
          description: product.description || ''
        };
        console.log('Producto procesado:', processedProduct);
        return processedProduct;
      });
      
      console.log('Productos procesados:', products);
      setInventory(products);
      setError(null); // Limpiar errores previos
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      console.error('Detalles del error:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(`Error al cargar el inventario: ${err.message}`);
      toast.error('Error al cargar el inventario');
      setInventory([]); // Establecer inventario vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar resumen del inventario
  const loadSummary = useCallback(async () => {
    try {
      const response = await inventoryAPI.getSummary();
      console.log('Resumen de inventario:', response.data);
      setSummary(response.data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
      // Si falla el resumen, calculamos uno básico
      const basicSummary = {
        totalProducts: inventory.length,
        lowStockProducts: inventory.filter(item => (item.currentStock || 0) <= (item.minStock || 0)).length,
        outOfStockProducts: inventory.filter(item => (item.currentStock || 0) <= 0).length,
        totalValue: inventory.reduce((sum, item) => sum + ((item.currentStock || 0) * (item.cost || 0)), 0)
      };
      console.log('Usando resumen básico calculado:', basicSummary);
      setSummary(basicSummary);
    }
  }, [inventory]);

  // Crear nuevo producto
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      
      // Mapear los datos del formulario al modelo del backend
      const backendData = {
        name: productData.productName,
        description: productData.description || '',
        sku: generateSKU(productData.productName),
        category: mapCategoryToBackend(productData.category),
        unit: productData.unit,
        price: productData.cost || 0,
        cost: productData.cost || 0,
        stock: productData.currentStock || 0,
        minStock: productData.minStock || 0,
        supplier: productData.supplier || ''
      };

      const response = await productsAPI.create(backendData);
      
      // Agregar el nuevo producto al inventario local
      const newProduct = {
        id: response.data._id,
        productName: response.data.name,
        category: response.data.category,
        currentStock: response.data.stock,
        minStock: response.data.minStock,
        unit: response.data.unit,
        cost: response.data.cost || 0,
        supplier: response.data.supplier?.name || response.data.supplier || 'Sin proveedor',
        sku: response.data.sku,
        description: response.data.description
      };

      setInventory(prev => [...prev, newProduct]);
      await loadSummary(); // Recargar resumen
      
      return response.data;
    } catch (err) {
      console.error('Error al crear producto:', err);
      const errorMsg = err.response?.data?.message || 'Error al crear el producto';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto existente
  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      
      const backendData = {
        name: productData.productName,
        description: productData.description || '',
        category: mapCategoryToBackend(productData.category),
        unit: productData.unit,
        price: productData.cost || 0,
        cost: productData.cost || 0,
        stock: productData.currentStock || 0,
        minStock: productData.minStock || 0,
        supplier: productData.supplier || ''
      };

      const response = await productsAPI.update(id, backendData);
      
      // Actualizar el producto en el inventario local
      setInventory(prev => prev.map(item => 
        item.id === id ? {
          ...item,
          productName: productData.productName,
          category: productData.category,
          currentStock: productData.currentStock,
          minStock: productData.minStock,
          unit: productData.unit,
          cost: productData.cost,
          supplier: productData.supplier,
          description: productData.description
        } : item
      ));

      await loadSummary(); // Recargar resumen
      
      return response.data;
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      const errorMsg = err.response?.data?.message || 'Error al actualizar el producto';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      
      // En lugar de eliminar físicamente, marcamos como inactivo
      await productsAPI.update(id, { isActive: false });
      
      // Remover del inventario local
      setInventory(prev => prev.filter(item => item.id !== id));
      await loadSummary(); // Recargar resumen
      
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      const errorMsg = err.response?.data?.message || 'Error al eliminar el producto';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ajustar stock
  const adjustStock = async (id, quantity, reason, notes) => {
    try {
      setLoading(true);
      
      const response = await inventoryAPI.adjustStock(id, { quantity, reason, notes });
      
      // Actualizar el stock en el inventario local
      setInventory(prev => prev.map(item => 
        item.id === id ? {
          ...item,
          currentStock: response.data.product.stock
        } : item
      ));

      await loadSummary(); // Recargar resumen
      
      return response.data;
    } catch (err) {
      console.error('Error al ajustar stock:', err);
      const errorMsg = err.response?.data?.message || 'Error al ajustar el stock';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Cargar resumen cuando cambie el inventario
  useEffect(() => {
    if (inventory.length > 0) {
      loadSummary();
    }
  }, [inventory, loadSummary]);

  return {
    inventory,
    loading,
    error,
    summary,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    loadInventory,
    loadSummary
  };
};

// Función auxiliar para generar SKU
const generateSKU = (productName) => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
};

// Función auxiliar para mapear categorías del frontend al backend
const mapCategoryToBackend = (frontendCategory) => {
  const categoryMap = {
    'Materia Prima': 'materia_prima',
    'Producto Terminado': 'producto_terminado',
    'Envases': 'empaque',
    'Material de Empaque': 'empaque',
    'Herramientas': 'servicio'
  };
  
  return categoryMap[frontendCategory] || 'materia_prima';
};
