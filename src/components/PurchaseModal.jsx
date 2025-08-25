import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'

export function PurchaseModal({ 
  isOpen, 
  onClose, 
  purchase = null, 
  onSave, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ product: '', quantity: 1, unit: 'unidad', price: 0 }],
    paymentMethod: 'Transferencia Bancaria',
    expectedDelivery: '',
    category: 'Materia Prima',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { suppliers } = useSuppliers()
  const { products } = useProducts()

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (purchase) {
        // Modo edición
        setFormData({
          supplier: purchase.supplier._id || purchase.supplier,
          items: purchase.items.map(item => ({
            product: item.product._id || item.product,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price
          })),
          paymentMethod: purchase.paymentMethod,
          expectedDelivery: purchase.expectedDelivery ? new Date(purchase.expectedDelivery).toISOString().split('T')[0] : '',
          category: purchase.category,
          notes: purchase.notes || ''
        })
      } else {
        // Modo creación
        setFormData({
          supplier: '',
          items: [{ product: '', quantity: 1, unit: 'unidad', price: 0 }],
          paymentMethod: 'Transferencia Bancaria',
          expectedDelivery: '',
          category: 'Materia Prima',
          notes: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, purchase])

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.supplier) {
      newErrors.supplier = 'El proveedor es requerido'
    }

    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'La fecha de entrega es requerida'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto'
    } else {
      formData.items.forEach((item, index) => {
        if (!item.product) {
          newErrors[`items.${index}.product`] = 'El producto es requerido'
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`items.${index}.quantity`] = 'La cantidad debe ser mayor a 0'
        }
        if (!item.unit) {
          newErrors[`items.${index}.unit`] = 'La unidad es requerida'
        }
        if (!item.price || item.price <= 0) {
          newErrors[`items.${index}.price`] = 'El precio debe ser mayor a 0'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Manejar cambios en items
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    // Calcular total del item
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const price = field === 'price' ? value : newItems[index].price
      newItems[index].total = quantity * price
    }
    
    setFormData(prev => ({ ...prev, items: newItems }))
    
    // Limpiar error del campo
    if (errors[`items.${index}.${field}`]) {
      setErrors(prev => ({ ...prev, [`items.${index}.${field}`]: '' }))
    }
  }

  // Agregar item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, unit: 'unidad', price: 0 }]
    }))
  }

  // Remover item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  // Obtener nombre del producto
  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId)
    return product ? product.name : ''
  }

  // Obtener nombre del proveedor
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId)
    return supplier ? supplier.name : ''
  }

  // Calcular total
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const total = (item.quantity || 0) * (item.price || 0)
      return sum + total
    }, 0)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const purchaseData = {
        ...formData,
        total: calculateTotal()
      }
      
      await onSave(purchaseData)
      onClose()
    } catch (error) {
      console.error('Error saving purchase:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {purchase ? 'Editar Compra' : 'Nueva Compra'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplier ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplier && (
                <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {['Materia Prima', 'Envases', 'Químicos', 'Equipos', 'Herramientas', 'Otros'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Cheque'].map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Fecha de entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expectedDelivery ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.expectedDelivery && (
                <p className="text-red-500 text-sm mt-1">{errors.expectedDelivery}</p>
              )}
            </div>
          </div>

          {/* Productos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Productos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </Button>
            </div>

            {errors.items && (
              <p className="text-red-500 text-sm mb-3">{errors.items}</p>
            )}

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg">
                  {/* Producto */}
                  <div className="col-span-4">
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.product`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                    {errors[`items.${index}.product`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.product`]}</p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      min="1"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.quantity`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`items.${index}.quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.quantity`]}</p>
                    )}
                  </div>

                  {/* Unidad */}
                  <div className="col-span-2">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.unit`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {['kg', 'g', 'l', 'ml', 'unidad', 'docena', 'caja', 'metro', 'cm'].map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {errors[`items.${index}.unit`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.unit`]}</p>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Precio"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.price`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`items.${index}.price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.price`]}</p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">
                      {((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre la compra..."
            />
          </div>

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Total de la Compra:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {purchase ? 'Actualizar' : 'Crear'} Compra
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
