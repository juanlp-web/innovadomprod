import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText,
  Clock,
  Target,
  XCircle,
  DollarSign,
  FlaskConical,
  AlertCircle,
  Loader2,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRecipes } from '@/hooks/useRecipes'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { useConfirmationModal, ConfirmationModal } from '@/components/ui/confirmation-modal'
import { ToastContainer } from '@/components/ui/toast'

export function RecetasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterDifficulty, setFilterDifficulty] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [duplicatingRecipeId, setDuplicatingRecipeId] = useState(null)

  
  // Hook para manejar recetas del backend
  const {
    recipes,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    updateRecipeStatus,
    duplicateRecipe,
    deleteRecipe,
    clearError
  } = useRecipes()

  // Hook para manejar productos
  const {
    products,
    loading: productsLoading,
    fetchProducts
  } = useProducts()

  // Hook para autenticación
  const { user } = useAuth()

  // Hook para toast
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()

  // Hook para modal de confirmación
  const { modalState, openModal, closeModal, confirm } = useConfirmationModal()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'medio',
    status: 'en_preparacion',
    preparationTime: '',
    cookingTime: '',
    servings: '',
    productToProduce: null, // Producto que se produce con esta receta
    batchInfo: {
      batchNumber: '',
      productionDate: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      quantity: '',
      unit: 'unidad'
    },
    ingredients: [],
    instructions: [],
    cost: 0,
    sellingPrice: 0,
    tags: []
  })

  const categories = [
    'bebida',
    'alimento',
    'postre',
    'otro'
  ]

  const difficulties = [
    { value: 'facil', label: 'Fácil', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'medio', label: 'Medio', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'dificil', label: 'Difícil', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]



  const units = ['g', 'kg', 'ml', 'l', 'unidad', 'docena', 'caja', 'gotas']

  const batchUnits = ['unidad', 'docena', 'caja', 'kg', 'g', 'l', 'ml']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBatchInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      batchInfo: {
        ...prev.batchInfo,
        [field]: value
      }
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        name: '', 
        product: null, 
        quantity: '', 
        unit: 'g', 
        cost: 0,
        notes: '',
        isGeneric: false
      }]
    }))
  }

  const addGenericIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        name: '', 
        product: null, 
        quantity: '', 
        unit: 'g', 
        cost: 0,
        notes: '',
        isGeneric: true
      }]
    }))
  }

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => {
        if (i === index) {
          const updatedIngredient = { ...ing, [field]: value }
          
          // Si se actualiza la cantidad o unidad y hay un producto seleccionado, recalcular el costo
          if ((field === 'quantity' || field === 'unit') && ing.product) {
            const product = products.find(p => p._id === ing.product)
            if (product && product.cost) {
              const quantity = parseFloat(updatedIngredient.quantity) || 0
              updatedIngredient.cost = quantity * product.cost
            }
          }
          
          return updatedIngredient
        }
        return ing
      })
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }))
  }

  const calculateTotalCost = (ingredients) => {
    return ingredients.reduce((total, ing) => total + (ing.cost || 0), 0)
  }

  // Función para recalcular costos de ingredientes con productos
  const recalculateIngredientCosts = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.product) {
          const product = products.find(p => p._id === ing.product)
          if (product && product.cost) {
            const quantity = parseFloat(ing.quantity) || 0
            return { ...ing, cost: quantity * product.cost }
          }
        }
        return ing
      })
    }))
  }

  // Función para abrir modal de selección de productos
  const openProductModal = (index) => {
    setSelectedIngredientIndex(index)
    setShowProductModal(true)
    setProductSearchTerm('')
    
    // Si es para seleccionar producto a producir, cargar todos los productos
    if (index === 'productToProduce') {
      fetchProducts({ limit: 100 })
    }
  }

  // Función para seleccionar un producto
  const selectProduct = (product) => {
    if (selectedIngredientIndex === 'productToProduce') {
      // Seleccionar producto a producir
      setFormData(prev => ({
        ...prev,
        productToProduce: product
      }))
      setShowProductModal(false)
      setSelectedIngredientIndex(null)
    } else if (selectedIngredientIndex !== null) {
      // Seleccionar ingrediente
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ing, i) => {
          if (i === selectedIngredientIndex) {
            const quantity = parseFloat(ing.quantity) || 0
            const productCost = product.cost || 0
            
            return {
              ...ing,
              product: product._id,
              name: product.name,
              cost: quantity * productCost, // Calcular costo basado en cantidad y costo unitario
              unit: product.unit || 'g'
            }
          }
          return ing
        })
      }))
      setShowProductModal(false)
      setSelectedIngredientIndex(null)
    }
  }

  // Función para buscar productos
  const handleProductSearch = (searchTerm) => {
    setProductSearchTerm(searchTerm)
    fetchProducts({ search: searchTerm, limit: 20 })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que el usuario esté autenticado
    if (!user) {
      showError('Debe estar autenticado para crear una receta.')
      return
    }
    
    try {
      // Validar que se haya seleccionado un producto a producir
      if (!formData.productToProduce) {
        showError('Debe seleccionar el producto que se produce con esta receta.')
        return
      }

      // Validar información del lote
      if (!formData.batchInfo.expirationDate || !formData.batchInfo.quantity || !formData.batchInfo.unit) {
        showError('Debe completar la información del lote: fecha de vencimiento, cantidad y unidad.')
        return
      }

      // Validar que al menos un ingrediente tenga un producto seleccionado o sea genérico
      const validIngredients = formData.ingredients.filter(ing => ing.product || (ing.name && ing.quantity))
      if (validIngredients.length === 0) {
        showError('Debe agregar al menos un ingrediente con producto del inventario o ingrediente genérico.')
        return
      }

      // Preparar datos para el backend
      const recipeData = {
        ...formData,
        productToProduce: formData.productToProduce._id, // ID del producto a producir
        batchInfo: {
          ...formData.batchInfo,
          productionDate: formData.batchInfo.productionDate,
          expirationDate: formData.batchInfo.expirationDate
        },
        cost: calculateTotalCost(validIngredients), // Usar el costo total calculado automáticamente
        createdBy: user._id, // ID del usuario autenticado
        ingredients: validIngredients.map(ing => {
          if (ing.product) {
            // Ingrediente con producto del inventario
            return {
              product: ing.product,
              quantity: parseFloat(ing.quantity),
              unit: ing.unit,
              notes: ing.notes || ''
            }
          } else {
            // Ingrediente sin producto del inventario
            return {
              name: ing.name,
              quantity: parseFloat(ing.quantity),
              unit: ing.unit,
              notes: ing.notes || ''
            }
          }
        }),
        instructions: formData.instructions.map((inst, index) => ({
          step: index + 1,
          description: inst,
          time: null
        }))
      }
    
      if (editingRecipe) {
        await updateRecipe(editingRecipe._id, recipeData)
        setEditingRecipe(null)
        success('Receta actualizada exitosamente')
      } else {
        await createRecipe(recipeData)
        success('Receta creada exitosamente')
      }
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        category: '',
        difficulty: 'medio',
        status: 'en_preparacion',
        preparationTime: '',
        cookingTime: '',
        servings: '',
        productToProduce: null,
        batchInfo: {
          batchNumber: '',
          productionDate: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          quantity: '',
          unit: 'unidad'
        },
        ingredients: [],
        instructions: [],
        cost: 0,
        sellingPrice: 0,
        tags: []
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error al guardar receta:', error)
      showError('Error al guardar la receta')
    }
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
    info(`Editando receta: ${recipe.name}`)
    
    // Función para mapear los datos cuando los productos estén disponibles
    const mapRecipeData = () => {
      // Buscar el producto completo en la lista de productos
      let productToProduce = null
      if (recipe.productToProduce) {
        if (typeof recipe.productToProduce === 'object' && recipe.productToProduce._id) {
          // Producto populado
          productToProduce = products.find(p => p._id === recipe.productToProduce._id) || 
                            { _id: recipe.productToProduce._id, name: recipe.productToProduce.name || 'Producto no encontrado' }
        } else {
          // Solo ID del producto
          productToProduce = products.find(p => p._id === recipe.productToProduce) || 
                            { _id: recipe.productToProduce, name: 'Producto no encontrado' }
        }
      }
      
      // Adaptar datos del backend al formato del formulario
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        category: recipe.category || '',
        difficulty: recipe.difficulty || 'medio',
        status: recipe.status || 'en_preparacion',
        preparationTime: recipe.preparationTime || '',
        cookingTime: recipe.cookingTime || '',
        servings: recipe.servings || '',
        productToProduce: productToProduce, // Producto completo
        batchInfo: recipe.batchInfo || {
          batchNumber: '',
          productionDate: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          quantity: '',
          unit: 'unidad'
        },
        ingredients: recipe.ingredients?.map(ing => {
          if (ing.product) {
            // Ingrediente con producto del inventario
            let product = null
            if (typeof ing.product === 'object' && ing.product._id) {
              // Producto populado
              product = products.find(p => p._id === ing.product._id) || 
                       { _id: ing.product._id, name: ing.product.name || 'Producto no encontrado' }
            } else {
              // Solo ID del producto
              product = products.find(p => p._id === ing.product) || 
                       { _id: ing.product, name: 'Producto no encontrado' }
            }
            
            return {
              name: product.name,
              quantity: ing.quantity || '',
              unit: ing.unit || '',
              notes: ing.notes || '',
              cost: 0, // Se recalculará
              product: product._id,
              isGeneric: false
            }
          } else {
            // Ingrediente genérico
            return {
              name: ing.name || '',
              quantity: ing.quantity || '',
              unit: ing.unit || '',
              notes: ing.notes || '',
              cost: 0,
              product: null,
              isGeneric: true
            }
          }
        }) || [],
        instructions: recipe.instructions?.map(inst => inst.description) || [],
        cost: recipe.cost || 0,
        sellingPrice: recipe.sellingPrice || 0,
        tags: recipe.tags || []
      })
      
      // Recalcular costos de ingredientes
      recalculateIngredientCosts()
    }
    
    // Si ya tenemos productos, mapear inmediatamente
    if (products.length > 0) {
      mapRecipeData()
    } else {
      // Si no tenemos productos, esperar a que se carguen
      const checkProducts = setInterval(() => {
        if (products.length > 0) {
          clearInterval(checkProducts)
          mapRecipeData()
        }
      }, 100)
      
      // Timeout de seguridad
      setTimeout(() => {
        clearInterval(checkProducts)
        if (products.length === 0) {
          // Mapear con datos básicos si no se cargaron productos
          mapRecipeData()
        }
      }, 5000)
    }
    
    setShowForm(true)
  }

  const handleDelete = async (recipeId) => {
    const confirmed = await confirm({
      title: 'Eliminar Receta',
      message: '¿Está seguro de que desea eliminar esta receta?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning',
      confirmButtonVariant: 'destructive'
    })

    if (confirmed) {
      try {
        await deleteRecipe(recipeId)
        success('Receta eliminada exitosamente')
      } catch (error) {
        console.error('Error al eliminar receta:', error)
        showError('Error al eliminar la receta')
      }
    }
  }

  // Función para cambiar el estado de una receta
  const handleStatusChange = async (recipeId, newStatus, quantity = 1) => {
    try {
      const recipe = recipes.find(r => r._id === recipeId);
      const productName = recipe?.productToProduce?.name || 'el producto';
      const currentStatus = recipe?.status || 'en_preparacion';
      const actualQuantity = recipe?.servings || 1; // Usar la cantidad real de la receta
      
      let confirmed = false;
      
      // Si se está cambiando a completada
      if (newStatus === 'completada') {
        // Contar ingredientes con productos asignados
        const ingredientsWithProducts = recipe.ingredients?.filter(ing => ing.product) || [];
        const ingredientsInfo = ingredientsWithProducts.length > 0 
          ? `\n\nTambién se consumirán los siguientes ingredientes del inventario:\n${ingredientsWithProducts.map(ing => `• ${ing.name || 'Producto'}: ${ing.quantity} ${ing.unit}`).join('\n')}`
          : '\n\nNo hay ingredientes del inventario para consumir.';
        
        confirmed = await confirm({
          title: 'Completar Receta',
          message: `¿Está seguro de que desea marcar esta receta como completada?\n\nEsto aumentará el stock de "${productName}" en ${actualQuantity} unidad(es).${ingredientsInfo}`,
          confirmText: 'Completar',
          cancelText: 'Cancelar',
          type: 'info'
        });
      }
      
      // Si se está cambiando desde completada a otro estado
      if (currentStatus === 'completada' && newStatus !== 'completada') {
        const actionText = newStatus === 'en_preparacion' ? 'volver a En Preparación' : 'descartar';
        
        // Contar ingredientes con productos asignados
        const ingredientsWithProducts = recipe.ingredients?.filter(ing => ing.product) || [];
        const ingredientsInfo = ingredientsWithProducts.length > 0 
          ? `\n\nTambién se restaurarán los siguientes ingredientes al inventario:\n${ingredientsWithProducts.map(ing => `• ${ing.name || 'Producto'}: ${ing.quantity} ${ing.unit}`).join('\n')}`
          : '\n\nNo hay ingredientes del inventario para restaurar.';
        
        confirmed = await confirm({
          title: `Cambiar Estado de Receta`,
          message: `¿Está seguro de que desea ${actionText} esta receta?\n\nEsto disminuirá el stock de "${productName}" en ${actualQuantity} unidad(es).${ingredientsInfo}`,
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          type: 'warning'
        });
      }
      
      // Para otros cambios de estado (sin confirmación especial)
      if (newStatus !== 'completada' && currentStatus !== 'completada') {
        confirmed = true;
      }
      
      if (!confirmed) return;
      
      const result = await updateRecipeStatus(recipeId, newStatus, actualQuantity);
      
      // Mostrar mensaje de éxito con información del cambio de stock y ingredientes
      if (result && result.stockChange) {
        const { productName: changedProductName, change, newStock } = result.stockChange;
        const action = change > 0 ? 'aumentado' : 'disminuido';
        const changeText = Math.abs(change);
        
        let message = `Estado de receta actualizado exitosamente!\n\nNuevo estado: ${newStatus}\nStock de "${changedProductName}" ${action} en ${changeText} unidad(es)\nStock actual: ${newStock} unidades`;
        
        // Agregar información sobre ingredientes consumidos
        if (result.ingredientsConsumed && result.ingredientsConsumed.length > 0) {
          message += '\n\nIngredientes consumidos:';
          result.ingredientsConsumed.forEach(ing => {
            message += `\n• ${ing.productName}: -${ing.quantityConsumed} unidades (Stock: ${ing.newStock})`;
          });
        }
        
        // Agregar información sobre ingredientes restaurados
        if (result.ingredientsRestored && result.ingredientsRestored.length > 0) {
          message += '\n\nIngredientes restaurados:';
          result.ingredientsRestored.forEach(ing => {
            message += `\n• ${ing.productName}: +${ing.quantityRestored} unidades (Stock: ${ing.newStock})`;
          });
        }
        
        success(message);
      } else {
        success(`Estado de receta cambiado a ${newStatus}`);
      }
      
      // Mostrar toast adicional de confirmación
      if (newStatus === 'completada') {
        info(`Stock del producto aumentado e ingredientes consumidos exitosamente`);
      } else if (currentStatus === 'completada') {
        warning(`Stock del producto disminuido e ingredientes restaurados exitosamente`);
      }
    } catch (error) {
      console.error('Error al cambiar estado de receta:', error);
      showError('Error al cambiar el estado de la receta');
    }
  }

  // Función para duplicar una receta
  const handleDuplicate = async (recipe) => {
    const confirmed = await confirm({
      title: 'Duplicar Receta',
      message: `¿Está seguro de que desea duplicar la receta "${recipe.name}"?\n\nSe creará una copia con el nombre "${recipe.name} (Copia)" y estado "En Preparación".`,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      type: 'info'
    });

    if (confirmed) {
      try {
        setDuplicatingRecipeId(recipe._id);
        const duplicatedRecipe = await duplicateRecipe(recipe);
        
        // Mostrar mensaje de éxito
        success(`Receta duplicada exitosamente!\n\nNueva receta: "${duplicatedRecipe.name}"\nEstado: En Preparación\n\nLa receta duplicada aparece al inicio de la lista.`);
      } catch (error) {
        console.error('Error al duplicar receta:', error);
        showError('Error al duplicar la receta');
      } finally {
        setDuplicatingRecipeId(null);
      }
    }
  }

  // Función para obtener el color y texto del estado
  const getStatusInfo = (status) => {
    switch (status) {
      case 'en_preparacion':
        return {
          label: 'En Preparación',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'completada':
        return {
          label: 'Completada',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'descartada':
        return {
          label: 'Descartada',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: 'Desconocido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'todos' || recipe.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'todos' || recipe.difficulty === filterDifficulty
    const matchesStatus = filterStatus === 'todos' || recipe.status === filterStatus
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })

  const getDifficultyInfo = (difficulty) => {
    return difficulties.find(d => d.value === difficulty)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  // Aplicar filtros cuando cambien los parámetros
  useEffect(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (filterCategory !== 'todos') params.category = filterCategory
    if (filterDifficulty !== 'todos') params.difficulty = filterDifficulty
    if (filterStatus !== 'todos') params.status = filterStatus
    
    fetchRecipes(params)
  }, [searchTerm, filterCategory, filterDifficulty, filterStatus, fetchRecipes])

  // Cargar productos cuando se abra el modal
  useEffect(() => {
    if (showProductModal) {
      fetchProducts({ limit: 50 })
    }
  }, [showProductModal, fetchProducts])

  // Recalcular costos cuando cambien los productos disponibles
  useEffect(() => {
    if (products.length > 0 && formData.ingredients.length > 0) {
      recalculateIngredientCosts()
    }
  }, [products, formData.ingredients.length])

  // Cargar productos cuando se edite una receta para tener datos completos
  useEffect(() => {
    if (editingRecipe) {
      // Cargar todos los productos para asegurar que estén disponibles
      fetchProducts({ limit: 1000 })
    }
  }, [editingRecipe, fetchProducts])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Gestión de Recetas</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra formulaciones y recetas de productos</p>
          
          {/* Contadores por Estado */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">
                En Preparación: {recipes.filter(r => r.status === 'en_preparacion').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">
                Completadas: {recipes.filter(r => r.status === 'completada').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-600">
                Descartadas: {recipes.filter(r => r.status === 'descartada').length}
              </span>
            </div>
          </div>
          
          {/* Información sobre Stock */}
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs leading-relaxed">
                <strong>Gestión de Stock:</strong> Las recetas "Completadas" aumentan el stock del producto producido y consumen ingredientes del inventario. Cambiar su estado desde "Completada" lo revierte automáticamente.
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => {
              setShowForm(true)
              info('Formulario de nueva receta abierto')
            }}
            disabled={loading}
            className="w-full sm:w-auto btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">{loading ? 'Cargando...' : 'Nueva Receta'}</span>
            <span className="sm:hidden">{loading ? '...' : 'Nueva'}</span>
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card card-hover p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recetas por nombre o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todas las dificultades</option>
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="completada">Completada</option>
              <option value="descartada">Descartada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingRecipe ? 'Editar Receta' : 'Crear Nueva Receta'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingRecipe(null)
                setFormData({
                  name: '',
                  description: '',
                  category: '',
                  difficulty: 'medio',
                  status: 'en_preparacion',
                  preparationTime: '',
                  cookingTime: '',
                  servings: '',
                  productToProduce: null,
                  ingredients: [],
                  instructions: [],
                  cost: 0,
                  sellingPrice: 0,
                  tags: []
                })
                info('Formulario cerrado')
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
                         {/* Información sobre Estados */}
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <div className="flex items-start space-x-3">
                 <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                 <div className="text-sm text-blue-800">
                   <p className="font-medium mb-1">Información sobre Estados de Recetas:</p>
                   <ul className="space-y-1 text-xs">
                     <li>• <strong>En Preparación:</strong> Estado por defecto al crear una receta</li>
                     <li>• <strong>Completada:</strong> Aumenta el stock del producto producido y consume ingredientes del inventario</li>
                     <li>• <strong>Descartada:</strong> Marca la receta como no utilizada</li>
                     <li>• <strong>Duplicar:</strong> Crea una copia de la receta con estado "En Preparación"</li>
                     <li>• <strong>⚠️ Importante:</strong> Cambiar desde "Completada" a otro estado disminuye el stock del producto y restaura los ingredientes</li>
                   </ul>
                 </div>
               </div>
             </div>

            {/* Información Básica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Receta *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Ej: Crema Hidratante Intensiva"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full input-field"
                  placeholder="Descripción breve de la receta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status || 'en_preparacion'}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="en_preparacion">En Preparación</option>
                  <option value="completada">Completada</option>
                  <option value="descartada">Descartada</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Por defecto: En Preparación
                </p>
              </div>
            </div>

             {/* Producto a Producir */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Producto que se Produce *
                 </label>
                 <div className="flex items-center space-x-3">
                   <Button
                     type="button"
                     onClick={() => {
                       setSelectedIngredientIndex('productToProduce')
                       setShowProductModal(true)
                       setProductSearchTerm('')
                     }}
                     variant="outline"
                     className="flex-1 justify-start text-left h-10"
                   >
                     {formData.productToProduce ? (
                       <div className="flex items-center space-x-2">
                         <span className="text-green-600">✓</span>
                         <span className="text-gray-900">{formData.productToProduce.name}</span>
                         <span className="text-gray-500 text-sm">({formData.productToProduce.sku})</span>
                       </div>
                     ) : (
                       <span className="text-gray-500">Seleccionar producto del inventario...</span>
                     )}
                   </Button>
                   {formData.productToProduce && (
                     <Button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, productToProduce: null }))}
                       variant="ghost"
                       size="sm"
                       className="text-red-600 hover:text-red-700"
                     >
                       <XCircle className="w-4 h-4" />
                     </Button>
                     )}
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     Selecciona el producto final que se produce con esta receta
                   </p>
                 </div>
               </div>

             {/* Información del Lote */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Cantidad a Producir *
                 </label>
                 <input
                   type="number"
                   value={formData.batchInfo.quantity}
                   onChange={(e) => handleBatchInfoChange('quantity', e.target.value)}
                   required
                   min="1"
                   className="w-full input-field"
                   placeholder="100"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Unidad del Lote *
                 </label>
                 <select
                   value={formData.batchInfo.unit}
                   onChange={(e) => handleBatchInfoChange('unit', e.target.value)}
                   className="w-full input-field"
                   required
                 >
                   {batchUnits.map(unit => (
                     <option key={unit} value={unit}>{unit}</option>
                   ))}
                 </select>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Fecha de Producción
                 </label>
                 <input
                   type="date"
                   value={formData.batchInfo.productionDate ? new Date(formData.batchInfo.productionDate).toISOString().split('T')[0] : ''}
                   onChange={(e) => handleBatchInfoChange('productionDate', new Date(e.target.value))}
                   className="w-full input-field"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   Por defecto: Hoy
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Fecha de Vencimiento *
                 </label>
                 <input
                   type="date"
                   value={formData.batchInfo.expirationDate ? new Date(formData.batchInfo.expirationDate).toISOString().split('T')[0] : ''}
                   onChange={(e) => handleBatchInfoChange('expirationDate', new Date(e.target.value))}
                   required
                   min={new Date().toISOString().split('T')[0]}
                   className="w-full input-field"
                 />
               </div>
             </div>

             {/* Tiempo y Porciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Preparación (min) *
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full input-field"
                  placeholder="45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Cocción (min)
                </label>
                <input
                  type="number"
                  name="cookingTime"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full input-field"
                  placeholder="30"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porciones *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full input-field"
                  placeholder="4"
                />
              </div>
            </div>



                        {/* Ingredientes */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ingredientes</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    onClick={addIngredient}
                    variant="outline"
                    size="sm"
                    className="btn-secondary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Agregar Ingrediente</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                  <Button
                     type="button"
                     onClick={addGenericIngredient}
                     variant="outline"
                     size="sm"
                     className="btn-secondary text-sm"
                   >
                     <Plus className="w-4 h-4 mr-2" />
                     <span className="hidden sm:inline">Ingrediente Genérico</span>
                     <span className="sm:hidden">Genérico</span>
                   </Button>
                  <Button
                    type="button"
                    onClick={recalculateIngredientCosts}
                    variant="outline"
                    size="sm"
                    className="btn-secondary text-sm"
                    title="Recalcular costos basados en productos del inventario"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Recalcular Costos</span>
                    <span className="sm:hidden">Costos</span>
                  </Button>
                </div>
              </div>
              
                             <div className="space-y-3">
                                   {formData.ingredients.map((ingredient, index) => (
                                         <div key={index} className="p-4 rounded-lg space-y-3 bg-gray-50">
                                             {/* Indicador de tipo de ingrediente */}
                       {ingredient.isGeneric && (
                         <div className="flex items-center space-x-2 mb-2">
                           <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                             Ingrediente Genérico
                           </span>
                         </div>
                       )}
                       {ingredient.product && (
                         <div className="flex items-center space-x-2 mb-2">
                           <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                             Producto del Inventario
                           </span>
                         </div>
                       )}
                                                                                       {/* Primera fila: Producto y Nombre */}
                       <div className="flex flex-col sm:flex-row gap-3">
                         {!ingredient.isGeneric && (
                           <div className="flex-1">
                             <label className="block text-xs font-medium text-gray-600 mb-1">
                               Producto del Inventario
                             </label>
                             <div className="flex items-center space-x-2">
                               <Button
                                 type="button"
                                 onClick={() => openProductModal(index)}
                                 variant="outline"
                                 size="sm"
                                 className="flex-1 justify-start text-left text-xs"
                               >
                                 {ingredient.product ? (
                                   <span className="text-green-600">✓ Producto seleccionado</span>
                                 ) : (
                                   <span className="text-gray-500">Seleccionar producto...</span>
                                 )}
                               </Button>
                               {ingredient.product && (
                                 <Button
                                   type="button"
                                   onClick={() => updateIngredient(index, 'product', null)}
                                   variant="ghost"
                                   size="sm"
                                   className="text-red-600 hover:text-red-700 flex-shrink-0"
                                 >
                                   <XCircle className="w-4 h-4" />
                                 </Button>
                               )}
                             </div>
                           </div>
                         )}
                         <div className={ingredient.isGeneric ? "w-full" : "flex-1"}>
                           <label className="block text-xs font-medium text-gray-600 mb-1">
                             {ingredient.isGeneric ? "Nombre del Ingrediente Genérico *" : "Nombre del Ingrediente"}
                           </label>
                           <input
                             type="text"
                             placeholder={ingredient.isGeneric ? "Ej: Sal, Azúcar, Especias..." : "Nombre del ingrediente"}
                             value={ingredient.name}
                             onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                             className="w-full input-field"
                             required={ingredient.isGeneric}
                           />
                         </div>
                       </div>
                     
                     {/* Segunda fila: Cantidad, Unidad y Costo */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Cantidad
                         </label>
                         <input
                           type="number"
                           placeholder="0"
                           value={ingredient.quantity}
                           onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                           className="w-full input-field"
                           min="0"
                           step="0.1"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Unidad
                         </label>
                         <select
                           value={ingredient.unit}
                           onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                           className="w-full input-field"
                         >
                           {units.map(unit => (
                             <option key={unit} value={unit}>{unit}</option>
                           ))}
                         </select>
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Costo
                           {ingredient.product && (
                             <span className="text-green-600 ml-1">(Auto)</span>
                           )}
                           {ingredient.isGeneric && (
                             <span className="text-blue-600 ml-1">(Manual)</span>
                           )}
                         </label>
                         <input
                           type="number"
                           placeholder="0.00"
                           value={ingredient.cost}
                           onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                           className={`w-full input-field ${ingredient.product ? 'bg-green-50 border-green-200' : ingredient.isGeneric ? 'bg-blue-50 border-blue-200' : ''}`}
                           min="0"
                           step="0.01"
                           readOnly={ingredient.product}
                           title={ingredient.product ? 'Costo calculado automáticamente' : ingredient.isGeneric ? 'Costo manual para ingrediente genérico' : 'Costo manual'}
                         />
                       </div>
                       <div className="col-span-2 lg:col-span-1">
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Notas
                         </label>
                         <input
                           type="text"
                           placeholder="Notas adicionales..."
                           value={ingredient.notes || ''}
                           onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                           className="w-full input-field"
                         />
                       </div>
                       <div className="col-span-2 lg:col-span-1">
                         <div className="flex items-center justify-end gap-1">
                           {!ingredient.product && !ingredient.isGeneric && (
                             <Button
                               type="button"
                               onClick={() => updateIngredient(index, 'isGeneric', true)}
                               variant="ghost"
                               size="sm"
                               className="text-blue-600 hover:text-blue-700 p-1"
                               title="Convertir a ingrediente genérico"
                             >
                               <FlaskConical className="w-4 h-4" />
                             </Button>
                           )}
                           {ingredient.isGeneric && (
                             <Button
                               type="button"
                               onClick={() => updateIngredient(index, 'isGeneric', false)}
                               variant="ghost"
                               size="sm"
                               className="text-gray-600 hover:text-gray-700 p-1"
                               title="Convertir a ingrediente del inventario"
                             >
                               <Target className="w-4 h-4" />
                             </Button>
                           )}
                           <Button
                             type="button"
                             onClick={() => removeIngredient(index)}
                             variant="ghost"
                             size="sm"
                             className="text-red-600 hover:text-red-700 p-1"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
              
                             {formData.ingredients.length > 0 && (
                 <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                   <div className="flex items-center justify-between">
                     <p className="text-sm text-blue-800">
                       <strong>Costo Total:</strong> {formatCurrency(calculateTotalCost(formData.ingredients))}
                     </p>
                                           <div className="text-xs text-blue-600">
                                                                                                       <div className="text-center">
                              <div>{formData.ingredients.filter(ing => ing.product).length} de {formData.ingredients.length} ingredientes vinculados al inventario</div>
                              <div className="text-green-600">
                                {formData.ingredients.filter(ing => ing.product).length > 0 && 
                                  `${formData.ingredients.filter(ing => ing.product).length} con costos automáticos`
                                }
                              </div>
                              <div className="text-blue-600">
                                {formData.ingredients.filter(ing => ing.isGeneric).length > 0 && 
                                  `${formData.ingredients.filter(ing => ing.isGeneric).length} ingredientes genéricos`
                                }
                              </div>
                            </div>
                      </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Instrucciones */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Instrucciones de Preparación</h3>
                <Button
                  type="button"
                  onClick={addInstruction}
                  variant="outline"
                  size="sm"
                  className="btn-secondary text-sm w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Paso</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <textarea
                      placeholder={`Paso ${index + 1}...`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 input-field"
                      rows="2"
                    />
                    <Button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 mt-1 self-end flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

                         {/* Costo y Precio */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Costo
                 </label>
                 <input
                   type="number"
                   name="cost"
                   value={calculateTotalCost(formData.ingredients)}
                   readOnly
                   min="0"
                   step="0.01"
                   className="w-full input-field bg-gray-50 cursor-not-allowed"
                   placeholder="0.00"
                 />
               </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full input-field"
                placeholder="Observaciones, consejos, precauciones..."
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingRecipe(null)
                  info('Formulario cancelado')
                }}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                <span className="hidden sm:inline">
                  {loading ? 'Guardando...' : (editingRecipe ? 'Actualizar Receta' : 'Crear Receta')}
                </span>
                <span className="sm:hidden">
                  {loading ? 'Guardando...' : (editingRecipe ? 'Actualizar' : 'Crear')}
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Recetas */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recetas ({filteredRecipes.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Total: {recipes.length}</span>
            </div>
          </div>
        </div>
        
        {/* Vista en Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando recetas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRecipes.map((recipe) => {
              const difficultyInfo = getDifficultyInfo(recipe.difficulty)
              const statusInfo = getStatusInfo(recipe.status || 'en_preparacion')
              
              return (
                <div key={recipe._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-medium transition-all duration-200">
                  {/* Indicador de Estado */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} self-start`}>
                      {statusInfo.label}
                    </div>
                    <div className="text-xs text-gray-500 self-end">
                      {new Date(recipe.createdAt).toLocaleDateString('es-DO')}
                    </div>
                  </div>
                  
                  {/* Header de la receta */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                      <p className="text-sm text-gray-600">{recipe.category}</p>
                    </div>
                    <div className="flex items-center space-x-2 self-start">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                        {recipe.category}
                      </span>
                    </div>
                  </div>

                                     {/* Información rápida */}
                   <div className="space-y-3 mb-4">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-600">Dificultad:</span>
                       <span className={`${difficultyInfo.color} font-medium`}>{difficultyInfo.label}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-600">Tiempo:</span>
                       <span className="font-medium">{recipe.preparationTime} min</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-600">Porciones:</span>
                       <span className="font-medium">{recipe.servings}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-600">Costo:</span>
                       <span className="font-medium">{formatCurrency(recipe.cost || 0)}</span>
                     </div>
                                           <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ingredientes:</span>
                        <span className="font-medium">
                          {recipe.ingredients?.length || 0} 
                          {recipe.ingredients?.some(ing => ing.product) && (
                            <span className="text-green-600 ml-1">(Vinculados)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Produce:</span>
                        <span className="font-medium text-blue-600">
                          {recipe.productToProduce?.name || 'Sin producto'}
                        </span>
                      </div>
                   </div>

                   {/* Controles de Estado */}
                   <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                       <span className="text-sm font-medium text-gray-700">Estado Actual:</span>
                       {(() => {
                         const statusInfo = getStatusInfo(recipe.status || 'en_preparacion');
                         return (
                           <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} self-start`}>
                             {statusInfo.label}
                           </span>
                         );
                       })()}
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-2">
                       {recipe.status !== 'en_preparacion' && (
                         <Button
                           onClick={() => handleStatusChange(recipe._id, 'en_preparacion', recipe.servings || 1)}
                           variant="outline"
                           size="sm"
                           className="text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300 w-full sm:w-auto text-xs"
                           title={recipe.status === 'completada' ? 
                             `Volver a En Preparación - Disminuirá el stock de "${recipe.productToProduce?.name}" en ${recipe.servings || 1} unidad(es)` : 
                             'Volver a En Preparación'
                           }
                         >
                           <Clock className="w-3 h-3 mr-1" />
                           <span className="hidden sm:inline">En Preparación</span>
                           <span className="sm:hidden">Preparación</span>
                           {recipe.status === 'completada' && (
                             <span className="ml-1 text-xs">(-{recipe.servings || 1})</span>
                           )}
                         </Button>
                       )}
                       
                       {recipe.status !== 'completada' && (
                         <Button
                           onClick={() => handleStatusChange(recipe._id, 'completada', recipe.servings || 1)}
                           variant="outline"
                           size="sm"
                           className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 w-full sm:w-auto text-xs"
                           title={`Completar - Aumentará el stock de "${recipe.productToProduce?.name}" en ${recipe.servings || 1} unidad(es)`}
                         >
                           <Target className="w-3 h-3 mr-1" />
                           <span className="hidden sm:inline">Completar (+{recipe.servings || 1})</span>
                           <span className="sm:hidden">Completar</span>
                         </Button>
                       )}
                       
                       {recipe.status !== 'descartada' && (
                         <Button
                           onClick={() => handleStatusChange(recipe._id, 'descartada', recipe.servings || 1)}
                           variant="outline"
                           size="sm"
                           className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto text-xs"
                           title={recipe.status === 'completada' ? 
                             `Descartar - Disminuirá el stock de "${recipe.productToProduce?.name}" en ${recipe.servings || 1} unidad(es)` : 
                             'Descartar receta'
                           }
                         >
                           <XCircle className="w-3 h-3 mr-1" />
                           Descartar
                           {recipe.status === 'completada' && (
                             <span className="ml-1 text-xs">(-{recipe.servings || 1})</span>
                           )}
                         </Button>
                       )}
                     </div>
                     
                                           {/* Información sobre cambios de stock */}
                      {recipe.status === 'completada' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-600" />
                            <span>
                              ✓ Stock del producto <strong>{recipe.productToProduce?.name}</strong> aumentado en <strong>{recipe.servings || 1}</strong> unidad(es)
                            </span>
                          </div>
                          
                          {/* Mostrar ingredientes consumidos si los hay */}
                          {recipe.ingredients && recipe.ingredients.filter(ing => ing.product).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <div className="flex items-center space-x-2">
                                <FlaskConical className="w-3 h-3 text-green-600" />
                                <span className="font-medium">Ingredientes consumidos:</span>
                              </div>
                              <div className="mt-1 space-y-1">
                                                                 {recipe.ingredients
                                   .filter(ing => ing.product)
                                   .map((ing, idx) => (
                                     <div key={idx} className="text-xs text-green-600 ml-4">
                                       • {ing.name || 'Producto'}: {ing.quantity} {ing.unit}
                                     </div>
                                   ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                     
                                           {/* Advertencia sobre cambios de estado */}
                      {recipe.status === 'completada' && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span>
                              ⚠️ Cambiar el estado desde "Completada" disminuirá el stock del producto producido y restaurará los ingredientes consumidos
                            </span>
                          </div>
                        </div>
                      )}
                   </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{recipe.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleEdit(recipe)}
                      variant="outline"
                      size="sm"
                      className="flex-1 btn-secondary text-xs"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    <Button
                      onClick={() => handleDuplicate(recipe)}
                      variant="outline"
                      size="sm"
                      disabled={duplicatingRecipeId === recipe._id}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 text-xs"
                      title={`Duplicar "${recipe.name}" - Crear una copia con estado "En Preparación"`}
                    >
                      {duplicatingRecipeId === recipe._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Duplicar</span>
                          <span className="sm:hidden">Copiar</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDelete(recipe._id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sm:hidden">Eliminar</span>
                    </Button>
                  </div>
                </div>
              )
            })}
            </div>
          )}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recetas</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== 'todos' || filterDifficulty !== 'todos'
                ? 'No se encontraron recetas con los filtros aplicados'
                : 'Comienza creando tu primera receta'
              }
            </p>
          </div>
                 )}
       </div>

       {/* Modal de Selección de Productos */}
       {showProductModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
               <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                 {selectedIngredientIndex === 'productToProduce' 
                   ? 'Seleccionar Producto a Producir' 
                   : 'Seleccionar Producto del Inventario'
                 }
               </h3>
               <Button
                 variant="ghost"
                 onClick={() => {
                   setShowProductModal(false)
                   setSelectedIngredientIndex(null)
                 }}
                 className="self-end sm:self-auto"
               >
                 <XCircle className="w-5 h-5" />
               </Button>
             </div>

             {/* Búsqueda de productos */}
             <div className="mb-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                     type="text"
                     placeholder={selectedIngredientIndex === 'productToProduce' 
                       ? "Buscar productos finales por nombre o SKU..." 
                       : "Buscar productos por nombre o SKU..."
                     }
                     value={productSearchTerm}
                     onChange={(e) => handleProductSearch(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   />
               </div>
             </div>

             {/* Lista de productos */}
             <div className="overflow-y-auto max-h-96">
               {productsLoading ? (
                 <div className="flex items-center justify-center py-8">
                   <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                   <span className="ml-2 text-gray-600">Cargando productos...</span>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {products.map((product) => (
                     <div
                       key={product._id}
                       className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => selectProduct(product)}
                     >
                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                         <div className="flex-1">
                           <h4 className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</h4>
                           <p className="text-xs sm:text-sm text-gray-600">SKU: {product.sku}</p>
                           <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500 mt-1">
                             <span>Stock: {product.stock || 0}</span>
                             <span>Costo: {formatCurrency(product.cost || 0)}</span>
                             <span>Precio: {formatCurrency(product.price || 0)}</span>
                           </div>
                         </div>
                         <div className="text-right self-start">
                           <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                             {product.category || 'Sin categoría'}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               
               {products.length === 0 && !productsLoading && (
                 <div className="text-center py-8">
                   <p className="text-gray-500">
                     {productSearchTerm 
                       ? 'No se encontraron productos con esa búsqueda' 
                       : 'No hay productos disponibles'
                     }
                   </p>
                 </div>
               )}
             </div>

             {/* Botones de acción */}
             <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4 pt-4 border-t border-gray-200">
               <Button
                 variant="outline"
                 onClick={() => {
                   setShowProductModal(false)
                   setSelectedIngredientIndex(null)
                 }}
                 className="w-full sm:w-auto order-2 sm:order-1"
               >
                 Cancelar
               </Button>
               <Button
                 onClick={() => {
                   setShowProductModal(false)
                   setSelectedIngredientIndex(null)
                 }}
                 className="btn-primary w-full sm:w-auto order-1 sm:order-2"
               >
                 Cerrar
               </Button>
             </div>
           </div>
         </div>
       )}
       
       {/* Toast Container */}
       <ToastContainer toasts={toasts} removeToast={removeToast} />
       
       {/* Modal de Confirmación */}
       <ConfirmationModal
         isOpen={modalState.isOpen}
         onClose={closeModal}
         onConfirm={modalState.onConfirm}
         title={modalState.title}
         message={modalState.message}
         confirmText={modalState.confirmText}
         cancelText={modalState.cancelText}
         type={modalState.type}
         showCancel={modalState.showCancel}
         confirmButtonVariant={modalState.confirmButtonVariant}
       />
     </div>
   )
 }
