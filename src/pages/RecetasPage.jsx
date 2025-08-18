import { useState } from 'react'
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
  FlaskConical
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RecetasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterDifficulty, setFilterDifficulty] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      name: 'Crema Hidratante Intensiva',
      category: 'Cuidado Facial',
      difficulty: 'intermedio',
      preparationTime: 45,
      yield: 100,
      yieldUnit: 'ml',
      status: 'activa',
      ingredients: [
        { name: 'Aceite de Coco', quantity: 15, unit: 'ml', cost: 0.25 },
        { name: 'Manteca de Karité', quantity: 10, unit: 'g', cost: 0.18 },
        { name: 'Vitamina E', quantity: 2, unit: 'ml', cost: 0.12 }
      ],
      instructions: [
        'Derretir la manteca de karité en baño maría',
        'Agregar el aceite de coco y mezclar',
        'Incorporar la vitamina E y envasar'
      ],
      notes: 'Ideal para pieles secas y sensibles.',
      cost: 0.55,
      price: 12.99,
      lastUsed: '2024-01-15',
      timesUsed: 24,
      tags: ['hidratante', 'natural', 'piel seca']
    },
    {
      id: 2,
      name: 'Mascarilla de Arcilla Verde',
      category: 'Tratamiento',
      difficulty: 'básico',
      preparationTime: 20,
      yield: 50,
      yieldUnit: 'g',
      status: 'activa',
      ingredients: [
        { name: 'Arcilla Verde', quantity: 25, unit: 'g', cost: 0.15 },
        { name: 'Agua de Rosas', quantity: 20, unit: 'ml', cost: 0.10 },
        { name: 'Miel Orgánica', quantity: 5, unit: 'g', cost: 0.08 }
      ],
      instructions: [
        'Mezclar la arcilla con agua de rosas',
        'Agregar la miel y mezclar hasta obtener pasta',
        'Aplicar sobre rostro limpio'
      ],
      notes: 'Purificante y exfoliante.',
      cost: 0.33,
      price: 8.50,
      lastUsed: '2024-01-10',
      timesUsed: 18,
      tags: ['purificante', 'exfoliante', 'acné']
    }
  ])

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    difficulty: 'básico',
    preparationTime: '',
    yield: '',
    yieldUnit: '',
    status: 'borrador',
    ingredients: [],
    instructions: [],
    notes: '',
    tags: []
  })

  const categories = [
    'Cuidado Facial',
    'Cuidado Corporal',
    'Tratamiento',
    'Maquillaje',
    'Fragancias',
    'Capilar'
  ]

  const difficulties = [
    { value: 'básico', label: 'Básico', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'intermedio', label: 'Intermedio', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'avanzado', label: 'Avanzado', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const statuses = [
    { value: 'activa', label: 'Activa', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'borrador', label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { value: 'archivada', label: 'Archivada', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const units = ['g', 'kg', 'ml', 'l', 'unidad', 'docena', 'caja', 'gotas']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: 'g', cost: 0 }]
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
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const totalCost = calculateTotalCost(formData.ingredients)
    const newRecipe = {
      ...formData,
      id: editingRecipe ? editingRecipe.id : Date.now(),
      cost: totalCost,
      lastUsed: new Date().toISOString().split('T')[0],
      timesUsed: editingRecipe ? editingRecipe.timesUsed : 0
    }
    
    if (editingRecipe) {
      setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? newRecipe : r))
      setEditingRecipe(null)
    } else {
      setRecipes(prev => [...prev, newRecipe])
    }
    
    setFormData({
      name: '',
      category: '',
      difficulty: 'básico',
      preparationTime: '',
      yield: '',
      yieldUnit: '',
      status: 'borrador',
      ingredients: [],
      instructions: [],
      notes: '',
      tags: []
    })
    setShowForm(false)
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
    setFormData(recipe)
    setShowForm(true)
  }

  const handleDelete = (recipeId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta receta?')) {
      setRecipes(prev => prev.filter(r => r.id !== recipeId))
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'todos' || recipe.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'todos' || recipe.difficulty === filterDifficulty
    const matchesStatus = filterStatus === 'todos' || recipe.status === filterStatus
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })

  const getDifficultyInfo = (difficulty) => {
    return difficulties.find(d => d.value === difficulty)
  }

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Recetas</h1>
          <p className="text-gray-600">Administra formulaciones y recetas de productos</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Receta</span>
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card card-hover p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
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
          <div className="flex flex-wrap gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas las dificultades</option>
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
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
                  category: '',
                  difficulty: 'básico',
                  preparationTime: '',
                  yield: '',
                  yieldUnit: '',
                  status: 'borrador',
                  ingredients: [],
                  instructions: [],
                  notes: '',
                  tags: []
                })
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="md:col-span-2">
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
            </div>

            {/* Tiempo y Rendimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Rendimiento *
                </label>
                <input
                  type="number"
                  name="yield"
                  value={formData.yield}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full input-field"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Rendimiento *
                </label>
                <select
                  name="yieldUnit"
                  value={formData.yieldUnit}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar unidad</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full input-field"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ingredientes</h3>
                <Button
                  type="button"
                  onClick={addIngredient}
                  variant="outline"
                  size="sm"
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Ingrediente
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Nombre del ingrediente"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="flex-1 input-field"
                    />
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      className="w-20 input-field"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-24 input-field"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Costo"
                      value={ingredient.cost}
                      onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                      className="w-24 input-field"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {formData.ingredients.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Costo Total:</strong> {formatCurrency(calculateTotalCost(formData.ingredients))}
                  </p>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Instrucciones de Preparación</h3>
                <Button
                  type="button"
                  onClick={addInstruction}
                  variant="outline"
                  size="sm"
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Paso
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
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
                      className="text-red-600 hover:text-red-700 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full input-field"
                placeholder="Observaciones, consejos, precauciones..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingRecipe(null)
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
              >
                {editingRecipe ? 'Actualizar Receta' : 'Crear Receta'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const difficultyInfo = getDifficultyInfo(recipe.difficulty)
              const statusInfo = getStatusInfo(recipe.status)
              
              return (
                <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-medium transition-all duration-200">
                  {/* Header de la receta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                      <p className="text-sm text-gray-600">{recipe.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
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
                      <span className="text-gray-600">Rinde:</span>
                      <span className="font-medium">{recipe.yield} {recipe.yieldUnit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-medium">{formatCurrency(recipe.cost)}</span>
                    </div>
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

                  {/* Estadísticas */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Usada {recipe.timesUsed} veces</span>
                    <span>Último uso: {recipe.lastUsed}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(recipe)}
                      variant="outline"
                      size="sm"
                      className="flex-1 btn-secondary"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(recipe.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recetas</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== 'todos' || filterDifficulty !== 'todos' || filterStatus !== 'todos'
                ? 'No se encontraron recetas con los filtros aplicados'
                : 'Comienza creando tu primera receta'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
