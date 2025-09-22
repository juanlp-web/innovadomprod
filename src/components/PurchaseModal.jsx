import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, Save, Loader2, Package2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'
import { useMobile } from '@/hooks/useMobile'
import { useAccountConfigs } from '@/hooks/useAccountConfigs'
import { useAccounts } from '@/hooks/useAccounts'

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
    items: [{ product: '', quantity: 1, unit: 'unidad', price: 0, itemType: 'product' }],
    paymentMethod: 'Transferencia Bancaria',
    expectedDelivery: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para el selector de items (productos y cuentas)
  const [showItemDropdown, setShowItemDropdown] = useState({})
  const [itemSearchTerm, setItemSearchTerm] = useState({})
  const [selectedItem, setSelectedItem] = useState({})
  const itemSearchRef = useRef(null)

  const { suppliers } = useSuppliers()
  const { products, loading: productsLoading } = useProducts()
  const { accountConfigs, loading: configsLoading } = useAccountConfigs()
  const { flatAccounts, loading: accountsLoading } = useAccounts()
  
  // Obtener cuentas de gastos para imputación contable
  const expenseAccounts = React.useMemo(() => {
    const expenseAccountsFromConfigs = accountConfigs?.compras ? Object.values(accountConfigs.compras) : []
    const expenseAccountsFromList = flatAccounts?.filter(account => account.type === 'gasto') || []
    
    // Usar configuraciones si están disponibles, sino usar la lista de cuentas
    const result = expenseAccountsFromConfigs.length > 0 ? expenseAccountsFromConfigs : expenseAccountsFromList
    return result
  }, [accountConfigs, flatAccounts, configsLoading, accountsLoading])

  // Combinar productos y cuentas contables en una sola lista
  const combinedItems = React.useMemo(() => {
    const productItems = products.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      type: 'product',
      category: product.category,
      unit: product.unit,
      price: product.price || 0
    }))
    
    const accountItems = expenseAccounts.map(account => ({
      id: account.accountId || account._id || account.id,
      name: account.accountName || account.name,
      sku: account.accountCode || account.code,
      type: 'account',
      category: account.accountType || account.type,
      unit: 'unidad',
      price: 0
    }))
    
    return [...productItems, ...accountItems]
  }, [products, expenseAccounts])
  
  // Filtrar items basado en el término de búsqueda
  const getFilteredItems = (searchTerm) => {
    if (combinedItems.length > 0 && searchTerm) {
      return combinedItems.filter(item => {
        const itemName = item.name || ''
        const itemSku = item.sku || ''
        const search = searchTerm.toLowerCase()
        
        return itemName.toLowerCase().includes(search) || 
               itemSku.toLowerCase().includes(search)
      })
    }
    return combinedItems || []
  }
  
  
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
          supplier: purchase.supplier?._id || purchase.supplier || '',
          items: purchase.items.map(item => ({
            product: item.product?._id || item.product || '',
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            itemType: item.itemType || 'product'
          })),
          paymentMethod: purchase.paymentMethod,
          expectedDelivery: purchase.expectedDelivery ? new Date(purchase.expectedDelivery).toISOString().split('T')[0] : '',
          notes: purchase.notes || ''
        })
        
        // Los estados de búsqueda y selección se inicializarán en un useEffect separado
        // cuando combinedItems esté disponible
      } else {
        // Modo creación - establecer fecha de entrega como fecha actual
        const today = new Date().toISOString().split('T')[0]
        setFormData({
          supplier: '',
          items: [{ product: '', quantity: 1, unit: 'unidad', price: 0, itemType: 'product' }],
          paymentMethod: 'Transferencia Bancaria',
          expectedDelivery: today,
          notes: ''
        })
        
        // Limpiar estados de búsqueda y selección
        setItemSearchTerm({})
        setSelectedItem({})
      }
      setErrors({})
    }
  }, [isOpen, purchase])

  // Inicializar estados de búsqueda y selección cuando combinedItems esté disponible
  useEffect(() => {
    if (isOpen && purchase && combinedItems.length > 0) {
      const newItemSearchTerm = {}
      const newSelectedItem = {}
      
      purchase.items.forEach((item, index) => {
        const itemType = item.itemType || 'product'
        let productId = null
        
        if (itemType === 'account') {
          // Para cuentas contables, usar accountId
          productId = item.accountId
        } else if (item.product) {
          // Para productos, extraer el ID del producto
          productId = typeof item.product === 'object' ? item.product._id || item.product.id : item.product
        }
        
        if (productId) {
          // Buscar el item en combinedItems - puede ser _id o id
          const foundItem = combinedItems.find(i => i.id === productId || i._id === productId)
          
          if (foundItem) {
            newItemSearchTerm[index] = `${foundItem.sku} - ${foundItem.name}`
            newSelectedItem[index] = foundItem
          }
        }
      })
      
      setItemSearchTerm(newItemSearchTerm)
      setSelectedItem(newSelectedItem)
    }
  }, [isOpen, purchase, combinedItems])

  // Cerrar dropdown de items cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showItemDropdown).forEach(index => {
        if (showItemDropdown[index] && !event.target.closest(`.item-dropdown-container-${index}`)) {
          setShowItemDropdown(prev => ({
            ...prev,
            [index]: false
          }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showItemDropdown])

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.supplier) {
      newErrors.supplier = 'El proveedor es requerido'
    }

    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'La fecha de entrega es requerida'
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
  const handleItemSelection = async (index, itemId) => {
    if (!itemId) {
      return
    }
    
    try {
      // Buscar el item seleccionado (producto o cuenta contable)
      const selectedItem = combinedItems.find(item => item.id === itemId)
      
      if (selectedItem) {
        // Actualizar el item con la información correspondiente
        const newItems = [...formData.items]
        newItems[index] = {
          ...newItems[index],
          product: itemId,
          itemType: selectedItem.type,
          unit: selectedItem.unit || 'unidad',
          price: selectedItem.price || 0
        }
        
        setFormData(prev => ({
          ...prev,
          items: newItems
        }))
      }
      
      // Si es un producto que maneja lotes, configurar lotes
      if (selectedItem?.type === 'product') {
        const product = products.find(p => p._id === itemId)
        if (product?.managesBatches) {
          setAvailableBatches(prev => ({
            ...prev,
            [itemId]: []
          }))
          
          // Limpiar selección previa y datos de lotes
          setSelectedBatches(prev => {
            const newBatches = { ...prev }
            delete newBatches[itemId]
            return newBatches
          })
          setNewBatchData(prev => {
            const newData = { ...prev }
            delete newData[itemId]
            return newData
          })
        }
      }
    } catch (err) {
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
      handleItemSelection(index, value)
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
      items: [...prev.items, { product: '', quantity: 1, unit: 'unidad', price: 0, itemType: 'product' }]
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

  // Obtener nombre del producto o cuenta contable
  const getItemName = (itemId) => {
    const item = combinedItems.find(i => i.id === itemId)
    return item ? item.name : ''
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

  // Manejar búsqueda de items
  const handleItemSearch = (index, value) => {
    setItemSearchTerm(prev => ({
      ...prev,
      [index]: value
    }))
    setShowItemDropdown(prev => ({
      ...prev,
      [index]: true
    }))
    
    // Si se limpia la búsqueda, limpiar la selección
    if (!value.trim()) {
      setSelectedItem(prev => ({
        ...prev,
        [index]: null
      }))
      handleItemChange(index, 'product', '')
    }
  }

  // Manejar selección de item
  const handleItemSelect = (index, item) => {
    const newSearchTerm = `${item.sku} - ${item.name}`
    
    setSelectedItem(prev => ({
      ...prev,
      [index]: item
    }))
    setItemSearchTerm(prev => ({
      ...prev,
      [index]: newSearchTerm
    }))
    setShowItemDropdown(prev => ({
      ...prev,
      [index]: false
    }))
    
    handleItemChange(index, 'product', item.id)
  }

  // Limpiar selección de cuenta contable
  const handleClearItem = (index) => {
    setSelectedItem(prev => ({
      ...prev,
      [index]: null
    }))
    setItemSearchTerm(prev => ({
      ...prev,
      [index]: ''
    }))
    setShowItemDropdown(prev => ({
      ...prev,
      [index]: false
    }))
    handleItemChange(index, 'product', '')
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
          if (item.itemType === 'product' && item.product && products.find(p => p._id === item.product)?.managesBatches) {
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
                <div key={index} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                  {/* Header del item */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <h3 className="text-sm font-medium text-gray-700">
                        {selectedItem[index] ? selectedItem[index].name : 'Item sin seleccionar'}
                      </h3>
                      {selectedItem[index] && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedItem[index].type === 'product' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedItem[index].type === 'product' ? 'Producto' : 'Cuenta'}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contenido del item */}
                  <div className="p-4">
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                      {/* Producto/Cuenta Contable - Ocupa toda la fila */}
                      <div className={isMobile ? 'w-full' : 'col-span-12'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Producto/Cuenta Contable *
                        </label>
                        <div className={`relative item-dropdown-container-${index}`}>
                          <div className="relative">
                            <input
                              type="text"
                              value={itemSearchTerm[index] || ''}
                              onChange={(e) => handleItemSearch(index, e.target.value)}
                              onFocus={() => setShowItemDropdown(prev => ({ ...prev, [index]: true }))}
                              placeholder="Buscar producto o cuenta contable..."
                              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors[`items.${index}.product`] ? 'border-red-300' : 'border-gray-300'
                              } ${isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2'}`}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                              {selectedItem[index] && (
                                <button
                                  type="button"
                                  onClick={() => handleClearItem(index)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {showItemDropdown[index] && getFilteredItems(itemSearchTerm[index]).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {/* Productos */}
                              {getFilteredItems(itemSearchTerm[index]).filter(item => item.type === 'product').length > 0 && (
                                <div className="px-3 py-2 bg-gray-50 border-b">
                                  <span className="text-xs font-medium text-gray-600">Productos</span>
                                </div>
                              )}
                              {getFilteredItems(itemSearchTerm[index]).filter(item => item.type === 'product').map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleItemSelect(index, item)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        SKU: {item.sku} | Precio: ${item.price}
                                      </div>
                                    </div>
                                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Producto
                                    </div>
                                  </div>
                                </button>
                              ))}
                              
                              {/* Cuentas Contables */}
                              {getFilteredItems(itemSearchTerm[index]).filter(item => item.type === 'account').length > 0 && (
                                <div className="px-3 py-2 bg-gray-50 border-b">
                                  <span className="text-xs font-medium text-gray-600">Cuentas Contables</span>
                                </div>
                              )}
                              {getFilteredItems(itemSearchTerm[index]).filter(item => item.type === 'account').map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleItemSelect(index, item)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Código: {item.sku} | Tipo: {item.category}
                                      </div>
                                    </div>
                                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Cuenta
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {showItemDropdown[index] && getFilteredItems(itemSearchTerm[index]).length === 0 && itemSearchTerm[index] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                              <p className="text-sm text-gray-500 text-center">
                                No se encontraron items que coincidan con "{itemSearchTerm[index]}"
                              </p>
                            </div>
                          )}
                        </div>
                        {errors[`items.${index}.product`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.product`]}</p>
                        )}
                      </div>

                      {/* Información del item seleccionado */}
                      {selectedItem[index] && (
                        <div className={isMobile ? 'w-full' : 'col-span-12'}>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {selectedItem[index].name}
                                </p>
                                <p className="text-xs text-blue-700">
                                  {selectedItem[index].type === 'product' 
                                    ? `SKU: ${selectedItem[index].sku} | Precio: $${selectedItem[index].price}`
                                    : `Código: ${selectedItem[index].sku} | Tipo: ${selectedItem[index].category}`
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-blue-600 font-medium">
                                  {selectedItem[index].type === 'product' ? 'Producto' : 'Cuenta Contable'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cantidad y Unidad en la misma fila */}
                      <div className={isMobile ? 'w-full' : 'col-span-6'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad *
                        </label>
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

                      <div className={isMobile ? 'w-full' : 'col-span-6'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unidad *
                        </label>
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

                      {/* Precio y Total en la misma fila */}
                      <div className={isMobile ? 'w-full' : 'col-span-6'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Unitario *
                        </label>
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

                      <div className={isMobile ? 'w-full' : 'col-span-6'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                          </span>
                        </div>
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