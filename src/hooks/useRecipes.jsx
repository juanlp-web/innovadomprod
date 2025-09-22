import { useState, useEffect, useCallback } from 'react';
import { recipesAPI } from '@/config/api';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Obtener todas las recetas
  const fetchRecipes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipesAPI.getAll({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        category: params.category || '',
        difficulty: params.difficulty || '',
        ...params
      });
      
      setRecipes(response.data.recipes);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener recetas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener receta por ID
  const fetchRecipeById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipesAPI.getById(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva receta
  const createRecipe = useCallback(async (recipeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipesAPI.create(recipeData);
      setRecipes(prev => [response.data, ...prev]);
      setTotal(prev => prev + 1);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar receta
  const updateRecipe = useCallback(async (id, recipeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipesAPI.update(id, recipeData);
      setRecipes(prev => prev.map(recipe => 
        recipe._id === id ? response.data : recipe
      ));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de receta
  const updateRecipeStatus = useCallback(async (id, status, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipesAPI.updateStatus(id, { status, quantity });
      setRecipes(prev => prev.map(recipe => 
        recipe._id === id ? response.data.recipe : recipe
      ));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado de receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicar receta
  const duplicateRecipe = useCallback(async (recipeData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Crear una nueva receta basada en la existente
      const duplicatedRecipe = {
        name: `${recipeData.name} (Copia)`,
        description: recipeData.description,
        category: recipeData.category,
        difficulty: recipeData.difficulty,
        status: 'en_preparacion', // Siempre en preparación al duplicar
        preparationTime: recipeData.preparationTime,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        productToProduce: recipeData.productToProduce,
        ingredients: recipeData.ingredients?.map(ing => ({
          product: ing.product,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        })) || [],
        instructions: recipeData.instructions?.map(inst => ({
          step: inst.step,
          description: inst.description,
          time: inst.time
        })) || [],
        cost: recipeData.cost,
        sellingPrice: recipeData.sellingPrice,
        tags: recipeData.tags || [],
        createdBy: recipeData.createdBy
      };
      
      const response = await recipesAPI.create(duplicatedRecipe);
      setRecipes(prev => [response.data, ...prev]);
      setTotal(prev => prev + 1);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al duplicar receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar receta
  const deleteRecipe = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await recipesAPI.delete(id);
      setRecipes(prev => prev.filter(recipe => recipe._id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar receta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular costo de receta
  const calculateRecipeCost = useCallback(async (id) => {
    try {
      setError(null);
      
      const response = await recipesAPI.getCost(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al calcular costo');
      throw err;
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar recetas al montar el componente
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    updateRecipeStatus,
    duplicateRecipe,
    deleteRecipe,
    calculateRecipeCost,
    clearError
  };
};
