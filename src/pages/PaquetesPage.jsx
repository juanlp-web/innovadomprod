import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  Loader2,
  XCircle,
  CheckCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackages } from '@/hooks/usePackages';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import {
  useConfirmationModal,
  ConfirmationModal,
} from '@/components/ui/confirmation-modal';
import { ToastContainer } from '@/components/ui/toast';

export function PaquetesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Hook para manejar paquetes
  const {
    packages,
    loading,
    error,
    stats,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    fetchStats,
    clearError,
  } = usePackages();

  // Hook para manejar productos
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  // Hook para autenticación
  const { user } = useAuth();

  // Hook para toast
  const {
    toasts,
    removeToast,
    success,
    error: showError,
    warning,
    info,
  } = useToast();

  // Hook para modal de confirmación
  const { modalState, openModal, closeModal, confirm } = useConfirmationModal();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: 'combo',
    items: [],
    sellingPrice: 0,
    discount: 0,
    notes: '',
    tags: [],
  });

  const categories = [
    { value: 'combo', label: 'Combo', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'promocion', label: 'Promoción', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'paquete', label: 'Paquete', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { value: 'kit', label: 'Kit', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'otro', label: 'Otro', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addProductToPackage = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: null,
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    }));
    setSelectedProductIndex(formData.items.length);
    setShowProductModal(true);
    setProductSearchTerm('');
  };

  const removeProductFromPackage = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updatePackageItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const selectProduct = (product) => {
    if (selectedProductIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) => {
          if (i === selectedProductIndex) {
            return {
              ...item,
              product: product._id,
              unitPrice: product.price,
              totalPrice: item.quantity * product.price,
            };
          }
          return item;
        }),
      }));
      setShowProductModal(false);
      setSelectedProductIndex(null);
    }
  };

  const handleProductSearch = (searchTerm) => {
    setProductSearchTerm(searchTerm);
    fetchProducts({ search: searchTerm, limit: 20 });
  };

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce((total, item) => total + (item.totalPrice || 0), 0);
    const totalCost = formData.items.reduce((total, item) => {
      const product = products.find(p => p._id === item.product);
      return total + ((product?.cost || 0) * item.quantity);
    }, 0);
    const finalPrice = formData.sellingPrice - formData.discount;
    const profitMargin = totalCost > 0 ? ((finalPrice - totalCost) / totalCost) * 100 : 0;

    return {
      itemsTotal,
      totalCost,
      finalPrice,
      profitMargin,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('Debe estar autenticado para crear un paquete.');
      return;
    }

    try {
      if (formData.items.length === 0) {
        showError('El paquete debe contener al menos un producto.');
        return;
      }

      const totals = calculateTotals();
      const packageData = {
        ...formData,
        totalCost: totals.totalCost,
        finalPrice: totals.finalPrice,
        profitMargin: totals.profitMargin,
        createdBy: user._id,
      };

      if (editingPackage) {
        await updatePackage(editingPackage._id, packageData);
        setEditingPackage(null);
        success('Paquete actualizado exitosamente');
      } else {
        await createPackage(packageData);
        success('Paquete creado exitosamente');
      }

      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        sku: '',
        category: 'combo',
        items: [],
        sellingPrice: 0,
        discount: 0,
        notes: '',
        tags: [],
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar paquete:', error);
      showError('Error al guardar el paquete');
    }
  };

  const handleEdit = (packageItem) => {
    setEditingPackage(packageItem);
    setFormData({
      name: packageItem.name || '',
      description: packageItem.description || '',
      sku: packageItem.sku || '',
      category: packageItem.category || 'combo',
      items: packageItem.items || [],
      sellingPrice: packageItem.sellingPrice || 0,
      discount: packageItem.discount || 0,
      notes: packageItem.notes || '',
      tags: packageItem.tags || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (packageId) => {
    const confirmed = await confirm({
      title: 'Eliminar Paquete',
      message: '¿Está seguro de que desea eliminar este paquete?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning',
      confirmButtonVariant: 'destructive',
    });

    if (confirmed) {
      try {
        await deletePackage(packageId);
        success('Paquete eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar paquete:', error);
        showError('Error al eliminar el paquete');
      }
    }
  };

  const getCategoryInfo = (category) => {
    return categories.find((c) => c.value === category) || categories[categories.length - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const filteredPackages = packages.filter((packageItem) => {
    const matchesSearch =
      packageItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageItem.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (packageItem.description &&
        packageItem.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === 'todos' || packageItem.category === filterCategory;
    const matchesStatus =
      filterStatus === 'todos' || 
      (filterStatus === 'activo' && packageItem.isActive) ||
      (filterStatus === 'inactivo' && !packageItem.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Aplicar filtros cuando cambien los parámetros
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterCategory !== 'todos') params.category = filterCategory;
    if (filterStatus !== 'todos') params.isActive = filterStatus === 'activo';

    fetchPackages(params);
  }, [searchTerm, filterCategory, filterStatus, fetchPackages]);

  // Cargar productos cuando se abra el modal
  useEffect(() => {
    if (showProductModal) {
      fetchProducts({ limit: 50 });
    }
  }, [showProductModal, fetchProducts]);

  // Cargar estadísticas
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totals = calculateTotals();

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Gestión de Paquetes
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Crea y administra paquetes de productos para ventas
          </p>

          {/* Estadísticas rápidas */}
          {stats && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <Package className="w-3 h-3 text-blue-600" />
                <span className="text-gray-600">
                  Total: {stats.overview?.total || 0} paquetes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-gray-600">
                  Valor: {formatCurrency(stats.overview?.totalValue || 0)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-gray-600">
                  Margen: {stats.overview?.avgProfitMargin?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={() => {
              setShowForm(true);
              info('Formulario de nuevo paquete abierto');
            }}
            disabled={loading}
            className="w-full sm:w-auto btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {loading ? 'Cargando...' : 'Nuevo Paquete'}
            </span>
            <span className="sm:hidden">{loading ? '...' : 'Nuevo'}</span>
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
              placeholder="Buscar paquetes por nombre, SKU o descripción..."
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
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingPackage(null);
                setFormData({
                  name: '',
                  description: '',
                  sku: '',
                  category: 'combo',
                  items: [],
                  sellingPrice: 0,
                  discount: 0,
                  notes: '',
                  tags: [],
                });
                info('Formulario cerrado');
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Paquete *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Ej: Combo Familiar"
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
                  placeholder="Descripción del paquete..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="PKG-001"
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
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Productos del Paquete */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos del Paquete
                </h3>
                <Button
                  type="button"
                  onClick={addProductToPackage}
                  variant="outline"
                  size="sm"
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {item.product ? 
                          products.find(p => p._id === item.product)?.name || 'Producto no encontrado' :
                          'Seleccionar producto'
                        }
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeProductFromPackage(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePackageItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updatePackageItem(index, 'unitPrice', parseFloat(e.target.value))}
                          className="w-full input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Total
                        </label>
                        <div className="text-sm font-medium text-gray-900 p-2 bg-white rounded border">
                          {formatCurrency(item.totalPrice || 0)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedProductIndex(index);
                            setShowProductModal(true);
                            setProductSearchTerm('');
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          {item.product ? 'Cambiar' : 'Seleccionar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.items.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      <strong>Subtotal Items:</strong> {formatCurrency(totals.itemsTotal)}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Costo Total:</strong> {formatCurrency(totals.totalCost)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta *
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Final
                </label>
                <div className="text-lg font-bold text-green-600 p-2 bg-green-50 rounded border">
                  {formatCurrency(totals.finalPrice)}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full input-field"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen de Ganancia
                </label>
                <div className="text-lg font-bold text-purple-600 p-2 bg-purple-50 rounded border">
                  {totals.profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPackage(null);
                  info('Formulario cancelado');
                }}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || formData.items.length === 0}
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                <span className="hidden sm:inline">
                  {loading
                    ? 'Guardando...'
                    : editingPackage
                    ? 'Actualizar Paquete'
                    : 'Crear Paquete'}
                </span>
                <span className="sm:hidden">
                  {loading
                    ? 'Guardando...'
                    : editingPackage
                    ? 'Actualizar'
                    : 'Crear'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Paquetes */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Paquetes ({filteredPackages.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>Total: {packages.length}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando paquetes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPackages.map((packageItem) => {
                const categoryInfo = getCategoryInfo(packageItem.category);

                return (
                  <div
                    key={packageItem._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-medium transition-all duration-200"
                  >
                    {/* Header del paquete */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {packageItem.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          SKU: {packageItem.sku}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 self-start">
                        <span className={`px-2 py-1 text-xs rounded-full ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        {packageItem.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Información del paquete */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Productos:</span>
                        <span className="font-medium">{packageItem.items?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Precio:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(packageItem.finalPrice || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Costo:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(packageItem.totalCost || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Margen:</span>
                        <span className="font-medium text-purple-600">
                          {packageItem.profitMargin?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Lista de productos */}
                    {packageItem.items && packageItem.items.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Productos incluidos:</h5>
                        <div className="space-y-1">
                          {packageItem.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              • {item.product?.name || 'Producto'} x{item.quantity}
                            </div>
                          ))}
                          {packageItem.items.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{packageItem.items.length - 3} más...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {packageItem.tags && packageItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {packageItem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {packageItem.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{packageItem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleEdit(packageItem)}
                        variant="outline"
                        size="sm"
                        className="flex-1 btn-secondary text-xs"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(packageItem._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay paquetes
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterCategory !== 'todos' || filterStatus !== 'todos'
                  ? 'No se encontraron paquetes con los filtros aplicados'
                  : 'Comienza creando tu primer paquete'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Selección de Productos */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Seleccionar Producto
              </h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProductIndex(null);
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
                  placeholder="Buscar productos por nombre o SKU..."
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
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                            {product.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            SKU: {product.sku}
                          </p>
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
                      : 'No hay productos disponibles'}
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProductIndex(null);
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProductIndex(null);
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
  );
}
