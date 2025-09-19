import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, Loader2, Package2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'
import { useMobile } from '@/hooks/useMobile'

export function PurchaseModal({ 
  isOpen, 
  onClose, 
  purchase = null, 
  onSave, 
  loading = false 
}) {
  const { isMobile } = useMobile()
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
  const { products, loading: productsLoading } = useProducts()
  
  // Debug: verificar que los productos se cargan
  useEffect(() => {
    console.log('Productos cargados en PurchaseModal:', { 
      count: products.length, 
      loading: productsLoading,
      products: products.slice(0, 3) // Primeros 3 productos para debug
    })
  }, [products, productsLoading])
  const [availableBatches, setAvailableBatches] = useState({})
  const [selectedBatches, setSelectedBatches] = useState({})
  const [newBatchData, setNewBatchData] = useState({})
  const [batchSearchTerm, setBatchSearchTerm] = useState({})

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
        // Modo creación - establecer fecha de entrega como fecha actual
        const today = new Date().toISOString().split('T')[0]
        setFormData({
          supplier: '',
          items: [{ product: '', quantity: 1, unit: 'unidad', price: 0 }],
          paymentMethod: 'Transferencia Bancaria',
          expectedDelivery: today,
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
        
        // Validar lotes para productos que los manejan
        if (item.product && products.find(p => p._id === item.product)?.managesBatches) {
          if (!selectedBatches[item.product] && !newBatchData[item.product]) {
            newErrors[`items.${index}.batch`] = 'Debe seleccionar un lote existente o crear uno nuevo'
          } else if (newBatchData[item.product]) {
            // Validar que se complete el número de lote y fecha de vencimiento
            if (!newBatchData[item.product].batchNumber || !newBatchData[item.product].batchNumber.trim()) {
              newErrors[`items.${index}.batchNumber`] = 'El número de lote es requerido'
            }
            if (!newBatchData[item.product].expirationDate) {
              newErrors[`items.${index}.expirationDate`] = 'La fecha de vencimiento es requerida'
            }
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Cargar lotes disponibles cuando se selecciona un producto
  const handleProductSelection = async (index, productId) => {
    console.log('handleProductSelection llamado:', { index, productId, productsLength: products.length })
    
    if (!productId) {
      console.log('No hay productId, saliendo')
      return
    }
    
    try {
      // Buscar el producto seleccionado para obtener su unidad y costo
      const selectedProduct = products.find(p => p._id === productId)
      console.log('Producto encontrado:', selectedProduct)
      
      if (selectedProduct) {
        // Actualizar el item con la unidad y costo del producto
        const newItems = [...formData.items]
        newItems[index] = {
          ...newItems[index],
          product: productId,
          unit: selectedProduct.unit || 'unidad',
          price: selectedProduct.cost || 0
        }
        
        console.log('Actualizando item:', {
          index,
          oldItem: formData.items[index],
          newItem: newItems[index]
        })
        
        setFormData(prev => ({
          ...prev,
          items: newItems
        }))
        
        console.log('Producto seleccionado y actualizado:', {
          name: selectedProduct.name,
          unit: selectedProduct.unit,
          cost: selectedProduct.cost
        })
      } else {
        console.log('Producto no encontrado en la lista')
      }
      
      // Por ahora, no cargamos lotes existentes automáticamente
      // Los lotes se crearán cuando se complete la compra
      setAvailableBatches(prev => ({
        ...prev,
        [productId]: []
      }))
      
      // Limpiar selección previa y datos de lotes
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[productId]
        return newBatches
      })
      setNewBatchData(prev => {
        const newData = { ...prev }
        delete newData[productId]
        return newData
      })
    } catch (err) {
      console.error('Error al cargar lotes:', err)
      setAvailableBatches(prev => ({
        ...prev,
        [productId]: []
      }))
    }
  }

  // Manejar selección de lote existente
  const handleBatchSelection = (productId, batchId) => {
    if (!batchId) return
    
    // Buscar el lote seleccionado para obtener sus datos
    const selectedBatch = availableBatches[productId]?.find(batch => batch._id === batchId)
    
    setSelectedBatches(prev => ({
      ...prev,
      [productId]: batchId
    }))
    
    // Cargar automáticamente la fecha de vencimiento del lote seleccionado
    if (selectedBatch) {
      setNewBatchData(prev => ({
        ...prev,
        [productId]: {
          batchNumber: selectedBatch.batchNumber,
          expirationDate: selectedBatch.expirationDate ? new Date(selectedBatch.expirationDate).toISOString().split('T')[0] : '',
          notes: selectedBatch.notes || ''
        }
      }))
    }
  }

  // Manejar datos de nuevo lote
  const handleNewBatchData = (productId, field, value) => {
    setNewBatchData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
    // Limpiar selección de lote existente
    setSelectedBatches(prev => {
      const newBatches = { ...prev }
      delete newBatches[productId]
      return newBatches
    })
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en los items
  const handleItemChange = (index, field, value) => {
    // Si se cambió el producto, cargar lotes disponibles y actualizar unidad/costo
    if (field === 'product') {
      handleProductSelection(index, value)
    } else {
      // Para otros campos, actualizar normalmente
      const newItems = [...formData.items]
      newItems[index][field] = value
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
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
      // Preparar datos de la compra con información de lotes
      const purchaseData = {
        ...formData,
        total: calculateTotal(),
        items: formData.items.map((item, index) => {
          const itemData = { ...item }
          
          // Agregar información de lotes si el producto los maneja
          if (item.product && products.find(p => p._id === item.product)?.managesBatches) {
            if (selectedBatches[item.product]) {
              // Lote existente seleccionado
              itemData.batch = selectedBatches[item.product]
              itemData.batchType = 'existing'
            } else if (newBatchData[item.product]) {
              // Nuevo lote a crear
              itemData.batchData = newBatchData[item.product]
              itemData.batchType = 'new'
            }
          }
          
          return itemData
        })
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobile ? 'p-2' : 'p-4'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full overflow-hidden ${isMobile ? 'max-w-full max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {purchase ? 'Editar Compra' : 'Nueva Compra'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 ${isMobile ? 'p-2' : ''}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={`space-y-6 overflow-y-auto ${isMobile ? 'p-4 max-h-[calc(95vh-120px)]' : 'p-6 max-h-[calc(90vh-140px)]'}`}>
          {/* Información básica */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplier ? 'border-red-300' : 'border-gray-300'
                } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
                className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
                className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
                className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expectedDelivery ? 'border-red-300' : 'border-gray-300'
                } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
              />
              {errors.expectedDelivery && (
                <p className="text-red-500 text-sm mt-1">{errors.expectedDelivery}</p>
              )}
            </div>
          </div>

          {/* Mensaje informativo sobre lotes */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Package2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Sistema de Lotes</span>
            </div>
            <p className="text-xs text-blue-700">
              Los productos que manejan lotes permiten: <strong>1)</strong> Seleccionar un lote existente (la fecha de vencimiento se carga automáticamente) 
              o <strong>2)</strong> Crear un nuevo lote ingresando el número de lote y fecha de vencimiento. 
              Esto mantiene la trazabilidad completa del inventario.
            </p>
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
                <div key={index} className={`border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                  {/* Producto */}
                  <div className={isMobile ? 'w-full' : 'col-span-3'}>
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.product`] ? 'border-red-300' : 'border-gray-300'
                      } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
                  <div className={isMobile ? 'w-full' : 'col-span-2'}>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      min="1"
                      step="0.01"
                      className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.quantity`] ? 'border-red-300' : 'border-gray-300'
                      } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
                    />
                    {errors[`items.${index}.quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.quantity`]}</p>
                    )}
                  </div>

                  {/* Unidad */}
                  <div className={isMobile ? 'w-full' : 'col-span-2'}>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.unit`] ? 'border-red-300' : 'border-gray-300'
                      } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
                  <div className={isMobile ? 'w-full' : 'col-span-2'}>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`items.${index}.price`] ? 'border-red-300' : 'border-gray-300'
                      } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
                    />
                    {errors[`items.${index}.price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.price`]}</p>
                    )}
                  </div>

                  {/* Total y Acciones */}
                  <div className={`flex items-center justify-between ${isMobile ? 'w-full' : 'col-span-2'}`}>
                    <span className={`font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
                      Total: ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                    </span>
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

                  {/* Gestión de Lotes */}
                  {item.product && products.find(p => p._id === item.product)?.managesBatches && (
                    <div className={`mt-3 p-3 bg-blue-50 rounded border border-blue-200 ${isMobile ? 'w-full' : 'col-span-12'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Package2 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">Gestión de Lotes</span>
                      </div>
                      
                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {/* Seleccionar Lote Existente */}
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Seleccionar Lote Existente
                          </label>
                          <select
                            value={selectedBatches[item.product] || ''}
                            onChange={(e) => handleBatchSelection(item.product, e.target.value)}
                            className={`w-full border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-sm'}`}
                          >
                            <option value="">Seleccionar lote...</option>
                            {availableBatches[item.product]?.map(batch => (
                              <option key={batch._id} value={batch._id}>
                                Lote #{batch.batchNumber} - Stock: {batch.currentStock} {batch.unit} - Vence: {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Crear/Editar Lote */}
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            {selectedBatches[item.product] ? 'Editar Lote Seleccionado' : 'Crear Nuevo Lote'}
                          </label>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Número de lote"
                              value={newBatchData[item.product]?.batchNumber || ''}
                              onChange={(e) => handleNewBatchData(item.product, 'batchNumber', e.target.value)}
                              className={`w-full border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-sm'}`}
                            />
                            <input
                              type="date"
                              placeholder="Fecha de vencimiento"
                              value={newBatchData[item.product]?.expirationDate || ''}
                              onChange={(e) => handleNewBatchData(item.product, 'expirationDate', e.target.value)}
                              className={`w-full border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-sm'}`}
                            />
                            <input
                              type="text"
                              placeholder="Notas del lote (opcional)"
                              value={newBatchData[item.product]?.notes || ''}
                              onChange={(e) => handleNewBatchData(item.product, 'notes', e.target.value)}
                              className={`w-full border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-sm'}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mensaje informativo */}
                      <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                        {selectedBatches[item.product] ? (
                          <span>✅ Lote seleccionado. Los datos se han cargado automáticamente.</span>
                        ) : (
                          <span>📝 Complete el número de lote y fecha de vencimiento para crear un nuevo lote.</span>
                        )}
                      </div>

                      {errors[`items.${index}.batch`] && (
                        <p className="text-red-500 text-xs mt-2">{errors[`items.${index}.batch`]}</p>
                      )}
                      {errors[`items.${index}.batchNumber`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.batchNumber`]}</p>
                      )}
                      {errors[`items.${index}.expirationDate`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.expirationDate`]}</p>
                      )}
                    </div>
                  )}
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
              className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
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
        <div className={`flex border-t border-gray-200 bg-gray-50 ${isMobile ? 'flex-col space-y-3 p-4 sticky bottom-0' : 'items-center justify-end space-x-3 p-6'}`}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className={`${isMobile ? 'w-full py-3 text-base' : ''}`}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`btn-primary ${isMobile ? 'w-full py-3 text-base font-semibold' : ''}`}
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
