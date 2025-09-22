import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, productsAPI, batchesAPI } from '@/config/api';
import { toast } from 'react-hot-toast';

// Función auxiliar para extraer datos de la respuesta de la API
const extractDataFromResponse = (response) => {
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
        return response.data[key];
      }
    }
  }
  
  // Si no se encuentra ningún array, devolver array vacío
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
      
      const response = await inventoryAPI.getInventory();
      
      if (response.data.success) {
        const responseData = response.data.data;
        
        // Buscar la propiedad que contiene el array de productos
        let productsData = [];
        for (const key in responseData) {
          if (Array.isArray(responseData[key])) {
            productsData = responseData[key];
            break;
          }
        }
        
        if (productsData.length === 0) {
          setInventory([]);
          setSummary({
            totalProducts: 0,
            totalStock: 0,
            lowStock: 0,
            outOfStock: 0
          });
          return;
        }
        
        // Procesar cada producto
        const processedProducts = await Promise.all(
          productsData.map(async (product) => {
            try {
              // Verificar si el producto maneja lotes
              const hasBatches = product.managesBatches || false;
              
              if (hasBatches) {
                // Cargar lotes del producto
                const batchesResponse = await batchesAPI.getBatchesByProduct(product._id);
                if (batchesResponse.data.success) {
                  product.batches = batchesResponse.data.data;
                } else {
                  product.batches = [];
                }
              }
              
              return {
                ...product,
                hasBatches,
                batches: product.batches || []
              };
            } catch (err) {
              // Si hay error al cargar lotes, continuar sin ellos
              return {
                ...product,
                hasBatches: product.managesBatches || false,
                batches: []
              };
            }
          })
        );
        
        setInventory(processedProducts);
        
        // Calcular resumen
        const totalStock = processedProducts.reduce((sum, product) => sum + (product.stock || 0), 0);
        const lowStock = processedProducts.filter(p => (p.stock || 0) <= (p.minStock || 0)).length;
        const outOfStock = processedProducts.filter(p => (p.stock || 0) === 0).length;
        
        setSummary({
          totalProducts: processedProducts.length,
          totalStock,
          lowStock,
          outOfStock
        });
      } else {
        setError('Error al cargar el inventario');
        setInventory([]);
        setSummary({
          totalProducts: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0
        });
      }
    } catch (error) {
      setError('Error al cargar el inventario');
      setInventory([]);
      setSummary({
        totalProducts: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar resumen del inventario
  const loadSummary = useCallback(async () => {
    try {
      const response = await inventoryAPI.getSummary();
      setSummary(response.data);
    } catch (err) {
      // Si falla la carga del resumen, calcular uno básico
      const basicSummary = {
        totalProducts: inventory.length,
        lowStockProducts: inventory.filter(item => (item.currentStock || 0) <= (item.minStock || 0)).length,
        outOfStockProducts: inventory.filter(item => (item.currentStock || 0) <= 0).length,
        totalValue: inventory.reduce((sum, item) => sum + ((item.currentStock || 0) * (item.cost || 0)), 0)
      };
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
