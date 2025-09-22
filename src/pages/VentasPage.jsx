import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  DollarSign,
  ShoppingCart,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  AlertCircle,
  Package2,
  Eye,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSales } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useProducts } from '@/hooks/useProducts'
import { useBatches } from '@/hooks/useBatches'
import { usePackages } from '@/hooks/usePackages'
import { useConfig } from '@/hooks/useConfig'
import { useBanks } from '@/hooks/useBanks'
import { PaymentModal } from '@/components/PaymentModal'
import { PaymentHistoryModal } from '@/components/PaymentHistoryModal'
import { PaymentPromptModal } from '@/components/PaymentPromptModal'
import { useImport } from '@/hooks/useImport'
import { ImportModal } from '@/components/ImportModal'

export function VentasPage() {
  const { 
    sales, 
    loading, 
    error, 
    createSale, 
    updatePaymentStatus, 
    deleteSale, 
    addPayment,
    getPayments,
    deletePayment,
    clearError 
  } = useSales()
  
  const { clients, loading: clientsLoading } = useClients()
  const { products, loading: productsLoading } = useProducts()
  const { getActiveBatchesByProduct, loading: batchesLoading } = useBatches()
  const { availablePackages, fetchAvailablePackages, loading: packagesLoading } = useSales()
  const { getConfig } = useConfig()
  const { banks, loading: banksLoading, fetchBanks } = useBanks()
  
  // Hook para importación
  const {
    loading: importLoading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  } = useImport('sales');

  // Configuración para importación
  const importConfig = {
    title: "Importar Ventas",
    description: "Importa ventas desde un archivo CSV o Excel",
    sampleData: [
      {
        clientId: "64a1b2c3d4e5f6789012345",
        productId: "64a1b2c3d4e5f6789012346",
        quantity: "10",
        price: "25.50",
        total: "255.00",
        date: "2024-01-15",
        paymentStatus: "pagado"
      },
      {
        clientId: "64a1b2c3d4e5f6789012347",
        productId: "64a1b2c3d4e5f6789012348",
        quantity: "5",
        price: "15.75",
        total: "78.75",
        date: "2024-01-16",
        paymentStatus: "pendiente"
      }
    ],
    columns: [
      { key: 'clientId', header: 'ID del Cliente', required: true },
      { key: 'productId', header: 'ID del Producto', required: true },
      { key: 'quantity', header: 'Cantidad', required: true },
      { key: 'price', header: 'Precio Unitario', required: true },
      { key: 'total', header: 'Total', required: true },
      { key: 'date', header: 'Fecha (YYYY-MM-DD)', required: true },
      { key: 'paymentStatus', header: 'Estado de Pago (pagado/pendiente/parcial)', required: false }
    ]
  };
  
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [availableBatches, setAvailableBatches] = useState({}) // { productId: [batches] }
  const [selectedBatches, setSelectedBatches] = useState({}) // { productId: [{ batchId, quantity }] }
  const [saleMode, setSaleMode] = useState('products') // 'products' o 'packages'
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState(null)
  const [salePayments, setSalePayments] = useState({}) // { saleId: { payments, paidAmount, remainingAmount } }
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)
  const [selectedSaleForHistory, setSelectedSaleForHistory] = useState(null)
  const [showPaymentPromptModal, setShowPaymentPromptModal] = useState(false)
  const [newlyCreatedSale, setNewlyCreatedSale] = useState(null)

  // Debug useEffect para lotes
  useEffect(() => {
  }, [selectedBatches, availableBatches, selectedProducts, editingSale])

  // Debug useEffect para ventas (temporal)
  useEffect(() => {
   
  }, [sales])

  const [formData, setFormData] = useState({
    client: '',
    items: [],
    notes: '',
    dueDate: ''
  })

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'pagado', label: 'Pagado', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'parcial', label: 'Parcial', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'cancelado', label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  // Los métodos de pago se manejan en el modal de pagos parciales

  // Limpiar error cuando se desmonte el componente
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  // Cargar paquetes disponibles cuando se cambie al modo de paquetes
  useEffect(() => {
    if (saleMode === 'packages' && (!availablePackages || availablePackages.length === 0)) {
      fetchAvailablePackages()
    }
  }, [saleMode, availablePackages, fetchAvailablePackages])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClientChange = (e) => {
    const clientId = e.target.value
    setSelectedClient(clientId)
    
    // Calcular fecha de vencimiento basada en los días de término de pago del cliente
    const selectedClient = clients.find(c => c._id === clientId)
    let dueDate = ''
    
    if (selectedClient && selectedClient.paymentTerms) {
      // Usar solo la fecha actual (sin hora) para evitar problemas de zona horaria
      const today = new Date()
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const dueDateObj = new Date(todayDateOnly)
      dueDateObj.setDate(todayDateOnly.getDate() + selectedClient.paymentTerms)
      dueDate = dueDateObj.toISOString().split('T')[0]
    }
    
    setFormData(prev => ({
      ...prev,
      client: clientId,
      dueDate: dueDate
    }))
  }

  const loadBatchesForProduct = async (productId) => {
    // Validar que el productId sea válido antes de hacer la llamada
    if (!productId || productId === 'undefined' || productId === '[object Object]' || typeof productId !== 'string') {
      return
    }

    try {
      
      const batches = await getActiveBatchesByProduct(productId)
      
      const activeBatches = batches.filter(batch => batch.currentStock > 0 && batch.status === 'activo')
      
      setAvailableBatches(prev => {
        const newBatches = {
          ...prev,
          [productId]: activeBatches
        }
        return newBatches
      })
    } catch (err) {
      setAvailableBatches(prev => ({
        ...prev,
        [productId]: []
      }))
    }
  }

  const handleProductSelect = async (productId) => {
    const product = products.find(p => p._id === productId)
    if (!product) return

    // Cargar lotes disponibles del producto
    await loadBatchesForProduct(productId)

    const existingItem = selectedProducts.find(item => item.product === productId)
    
    if (existingItem) {
      setSelectedProducts(prev => prev.map(item => 
        item.product === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      setSelectedProducts(prev => [...prev, {
        product: productId,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        discount: 0
      }])
    }
  }

  // Función para agregar un lote a un producto
  const handleBatchAdd = (productId, batchId, quantity = 1) => {
    setSelectedBatches(prev => {
      const currentBatches = prev[productId] || []
      const existingBatch = currentBatches.find(batch => batch.batchId === batchId)
      
      if (existingBatch) {
        // Si el lote ya existe, actualizar la cantidad
        return {
          ...prev,
          [productId]: currentBatches.map(batch => 
            batch.batchId === batchId 
              ? { ...batch, quantity: batch.quantity + quantity }
              : batch
          )
        }
      } else {
        // Si es un lote nuevo, agregarlo
        return {
          ...prev,
          [productId]: [...currentBatches, { batchId, quantity }]
        }
      }
    })
  }

  // Función para actualizar la cantidad de un lote específico
  const handleBatchQuantityChange = (productId, batchId, newQuantity) => {
    if (newQuantity <= 0) {
      handleBatchRemove(productId, batchId)
      return
    }

    setSelectedBatches(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).map(batch => 
        batch.batchId === batchId 
          ? { ...batch, quantity: newQuantity }
          : batch
      )
    }))
  }

  // Función para remover un lote de un producto
  const handleBatchRemove = (productId, batchId) => {
    setSelectedBatches(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).filter(batch => batch.batchId !== batchId)
    }))
  }

  // Función para obtener la cantidad total de lotes seleccionados para un producto
  const getTotalBatchQuantity = (productId) => {
    const batches = selectedBatches[productId] || []
    return batches.reduce((total, batch) => total + batch.quantity, 0)
  }

  // Función para verificar si un producto tiene lotes suficientes
  const hasEnoughBatchStock = (productId, requiredQuantity) => {
    return getTotalBatchQuantity(productId) >= requiredQuantity
  }

  // Función legacy para compatibilidad (mantener por ahora)
  const handleBatchSelect = (productId, batchId) => {
    if (!batchId) {
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[productId]
        return newBatches
      })
      return
    }

    // Si ya hay lotes seleccionados, agregar este como uno más
    if (selectedBatches[productId] && selectedBatches[productId].length > 0) {
      handleBatchAdd(productId, batchId, 1)
    } else {
      // Si no hay lotes, crear el primer lote
      setSelectedBatches(prev => ({
        ...prev,
        [productId]: [{ batchId, quantity: 1 }]
      }))
    }
  }

  const handleProductQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.product !== productId))
      // Limpiar el lote seleccionado cuando se elimina el producto
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[productId]
        return newBatches
      })
      return
    }

    // Validar que la cantidad no exceda el stock del lote seleccionado
    const selectedBatchId = selectedBatches[productId]
    if (selectedBatchId) {
      const availableBatch = availableBatches[productId]?.find(batch => batch._id === selectedBatchId)
      if (availableBatch && newQuantity > availableBatch.currentStock) {
        alert(`La cantidad solicitada (${newQuantity}) excede el stock disponible del lote #${availableBatch.batchNumber} (${availableBatch.currentStock} ${availableBatch.unit})`)
        return
      }
    }

    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ))
  }

  const handleProductPriceChange = (productId, newPrice) => {
    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, unitPrice: newPrice, total: newPrice * item.quantity }
        : item
    ))
  }

  const handleProductDiscountChange = (productId, newDiscount) => {
    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, discount: newDiscount, total: (item.unitPrice - newDiscount) * item.quantity }
        : item
    ))
  }

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.total, 0)
    const ivaPercentage = getConfig('iva_percentage', 0) / 100 // Obtener IVA de configuración, default 16%
    const tax = subtotal * ivaPercentage
    const total = subtotal + tax
    return { subtotal, tax, total, ivaPercentage: ivaPercentage * 100 }
  }

  // Función para manejar la selección de paquetes
  const handlePackageSelect = (packageId) => {
    const packageItem = availablePackages.find(pkg => pkg._id === packageId)
    if (!packageItem) return

    // Agregar los productos del paquete a la lista de productos seleccionados
    // para que el usuario pueda seleccionar lotes
    
    const packageProducts = packageItem.items
      .filter(item => {
        return item.product && item.product._id
      })
      .map(item => {
        const productId = typeof item.product === 'object' ? item.product._id : item.product
        
        // Validar que el productId sea válido
        if (!productId || productId === 'undefined' || productId === '[object Object]') {
          return null
        }
        
        const packageProduct = {
          product: productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
          discount: 0,
          isFromPackage: true,
          packageId: packageId,
          packageName: packageItem.name
        }
        
        return packageProduct
      })
      .filter(item => item !== null) // Filtrar items nulos
    

    // Agregar cada producto del paquete a la lista
    setSelectedProducts(prev => {
      const newProducts = [...prev]
      packageProducts.forEach(packageProduct => {
        // Verificar si el producto ya existe
        const existingIndex = newProducts.findIndex(item => 
          item.product === packageProduct.product && item.isFromPackage
        )
        
        if (existingIndex >= 0) {
          // Si existe, aumentar la cantidad
          newProducts[existingIndex] = {
            ...newProducts[existingIndex],
            quantity: newProducts[existingIndex].quantity + packageProduct.quantity,
            total: (newProducts[existingIndex].quantity + packageProduct.quantity) * packageProduct.unitPrice
          }
        } else {
          // Si no existe, agregarlo
          newProducts.push(packageProduct)
        }
      })
      return newProducts
    })

    // Cargar lotes para los productos del paquete
    packageProducts.forEach(packageProduct => {
      
      // Validación adicional antes de cargar lotes
      if (packageProduct.product && 
          typeof packageProduct.product === 'string' && 
          packageProduct.product !== 'undefined' && 
          packageProduct.product !== '[object Object]' &&
          packageProduct.product.length === 24) {
        loadBatchesForProduct(packageProduct.product)
      } else {
      }
    })
  }

  // Función para manejar cambios en la cantidad de paquetes
  const handlePackageQuantityChange = (packageId, newQuantity) => {
    setSelectedProducts(prev => prev.map(item => 
      item.package === packageId 
        ? { ...item, quantity: newQuantity, total: (item.unitPrice - item.discount) * newQuantity }
        : item
    ))
  }

  // Función para manejar descuentos en paquetes
  const handlePackageDiscountChange = (packageId, newDiscount) => {
    setSelectedProducts(prev => prev.map(item => 
      item.package === packageId 
        ? { ...item, discount: newDiscount, total: (item.unitPrice - newDiscount) * item.quantity }
        : item
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client) {
      alert('Debe seleccionar un cliente')
      return
    }
    
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto')
      return
    }

    // Validar que todos los productos tengan lotes suficientes (solo si manejan lotes)
    const productsWithoutEnoughBatches = selectedProducts.filter(item => {
      const product = products.find(p => p._id === item.product);
      
      // Si el producto no maneja lotes, no requiere validación
      if (!product?.managesBatches) return false;
      
      const hasAvailableBatches = availableBatches[item.product] && availableBatches[item.product].length > 0;
      
      // Si maneja lotes pero no hay lotes disponibles, es un error
      if (!hasAvailableBatches) return true;
      
      // Si hay lotes disponibles, verificar que la cantidad total sea suficiente
      const totalBatchQuantity = getTotalBatchQuantity(item.product);
      return totalBatchQuantity < item.quantity;
    });
    
    if (productsWithoutEnoughBatches.length > 0) {
      const productNames = productsWithoutEnoughBatches.map(item => {
        const totalBatchQuantity = getTotalBatchQuantity(item.product);
        return `${getProductName(item.product)} (necesita: ${item.quantity}, tiene: ${totalBatchQuantity})`;
      }).join(', ');
      alert(`Los siguientes productos no tienen lotes suficientes: ${productNames}`)
      return
    }

    try {
      const saleData = {
        ...formData,
        items: selectedProducts.flatMap(item => {
          const productBatches = selectedBatches[item.product] || [];
          
          // Si no hay lotes seleccionados, enviar el producto tal como está
          if (productBatches.length === 0) {
            return [{
              product: item.product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              discount: item.discount,
              batch: null,
              isPackage: item.isPackage || false,
              package: item.package || null,
              isFromPackage: item.isFromPackage || false,
              packageId: item.packageId || null,
              packageName: item.packageName || null
            }];
          }
          
          // Si hay lotes seleccionados, crear un item por cada lote
          return productBatches.map(batchItem => ({
            product: item.product,
            quantity: batchItem.quantity,
            unitPrice: item.unitPrice,
            total: (item.unitPrice - (item.discount || 0)) * batchItem.quantity,
            discount: item.discount || 0,
            batch: batchItem.batchId,
            isPackage: item.isPackage || false,
            package: item.package || null,
            isFromPackage: item.isFromPackage || false,
            packageId: item.packageId || null,
            packageName: item.packageName || null
          }));
        }),
        dueDate: formData.dueDate || null
      }

      const createdSale = await createSale(saleData)
      
      // Limpiar formulario
      setFormData({
        client: '',
        items: [],
        notes: '',
        dueDate: ''
      })
      setSelectedClient('')
      setSelectedProducts([])
      setSelectedBatches({})
      setAvailableBatches({})
      setShowForm(false)
      
      // Mostrar modal de confirmación de pago
      setNewlyCreatedSale(createdSale)
      setShowPaymentPromptModal(true)
    } catch (err) {
    }
  }

  const handleEdit = async (sale) => {
    setEditingSale(sale)
    setFormData({
      client: sale.client._id || sale.client,
      items: sale.items || [],
      notes: sale.notes || '',
      dueDate: sale.dueDate ? new Date(sale.dueDate).toISOString().split('T')[0] : ''
    })
    setSelectedClient(sale.client._id || sale.client)
    
    // Determinar si es una venta de paquetes o productos individuales
    const hasPackageItems = sale.items?.some(item => item.isPackage || item.isFromPackage)
    setSaleMode(hasPackageItems ? 'packages' : 'products')
    
    // Procesar items para la nueva estructura
    const processedItems = []
    const batchesData = {}
    const selectedBatchesData = {}
    
    // Agrupar items por producto para manejar múltiples lotes
    const itemsByProduct = {}
    
    for (const item of sale.items || []) {
      if (!itemsByProduct[item.product]) {
        itemsByProduct[item.product] = {
          product: item.product,
          quantity: 0,
          unitPrice: item.unitPrice,
          total: 0,
          discount: item.discount || 0,
          isPackage: item.isPackage || false,
          package: item.package || null,
          isFromPackage: item.isFromPackage || false,
          packageId: item.packageId || null,
          packageName: item.packageName || null,
          batches: []
        }
      }
      
      // Acumular cantidad y total
      itemsByProduct[item.product].quantity += item.quantity
      itemsByProduct[item.product].total += item.total
      
      // Agregar lote si existe
      if (item.batch) {
        itemsByProduct[item.product].batches.push({
          batchId: item.batch,
          quantity: item.quantity
        })
      }
    }
    
    // Convertir a array y cargar lotes
    for (const [productId, itemData] of Object.entries(itemsByProduct)) {
      processedItems.push(itemData)
      
      try {
        const batches = await getActiveBatchesByProduct(productId)
        batchesData[productId] = batches.filter(batch => batch.currentStock > 0 && batch.status === 'activo')
        
        // Configurar lotes seleccionados
        if (itemData.batches.length > 0) {
          selectedBatchesData[productId] = itemData.batches
        }
      } catch (err) {
        batchesData[productId] = []
      }
    }
    
    setSelectedProducts(processedItems)
    setAvailableBatches(batchesData)
    setSelectedBatches(selectedBatchesData)
    setShowForm(true)
    // Debug adicional para lotes
  }

  const removeProduct = (itemId, index) => {
    const item = selectedProducts[index]
    setSelectedProducts(prev => prev.filter((_, i) => i !== index))
    
    // Limpiar el lote seleccionado cuando se elimina el producto (solo para productos, no paquetes)
    if (item && !item.isPackage && item.product) {
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[item.product]
        return newBatches
      })
      // Limpiar los lotes disponibles del producto eliminado
      setAvailableBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[item.product]
        return newBatches
      })
    }
  }

  const handleDelete = async (saleId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
      try {
        await deleteSale(saleId)
      } catch (err) {
      }
    }
  }

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus)
    } catch (err) {
    }
  }

  // Funciones para pagos parciales
  const handleAddPayment = async (saleId, paymentData) => {
    try {
      await addPayment(saleId, paymentData)
      // No necesitamos recargar pagos ya que addPayment actualiza el estado
      // Recargar cuentas bancarias para obtener balances actualizados
      await fetchBanks()
    } catch (err) {
      throw err
    }
  }

  const loadSalePayments = async (saleId) => {
    try {
      const paymentData = await getPayments(saleId)
      if (paymentData) {
        setSalePayments(prev => ({
          ...prev,
          [saleId]: paymentData
        }))
      }
    } catch (err) {
    }
  }

  const handleOpenPaymentModal = async (sale) => {
    setSelectedSaleForPayment(sale)
    setShowPaymentModal(true)
    // Cargar pagos existentes
    await loadSalePayments(sale._id)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedSaleForPayment(null)
  }

  // Funciones para historial de pagos
  const handleOpenPaymentHistory = (sale) => {
    setSelectedSaleForHistory(sale)
    setShowPaymentHistoryModal(true)
  }

  const handleClosePaymentHistory = () => {
    setShowPaymentHistoryModal(false)
    setSelectedSaleForHistory(null)
  }

  const handleDeletePaymentFromHistory = async (saleId, paymentId) => {
    try {
      await deletePayment(saleId, paymentId)
      // Recargar cuentas bancarias para obtener balances actualizados
      await fetchBanks()
    } catch (err) {
      throw err
    }
  }

  // Funciones para el modal de confirmación de pago
  const handlePayNow = () => {
    setShowPaymentPromptModal(false)
    setSelectedSaleForPayment(newlyCreatedSale)
    setShowPaymentModal(true)
    setNewlyCreatedSale(null)
  }

  const handleSkipPayment = () => {
    setShowPaymentPromptModal(false)
    setNewlyCreatedSale(null)
  }

  const handleClosePaymentPrompt = () => {
    setShowPaymentPromptModal(false)
    setNewlyCreatedSale(null)
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      (sale.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todos' || sale.paymentStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  // Debug para verificar filtrado (temporal)

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pagado': return CheckCircle
      case 'parcial': return Clock
      case 'pendiente': return Clock
      case 'cancelado': return XCircle
      default: return Clock
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const getClientName = (clientId) => {
    if (typeof clientId === 'string') {
      const client = clients.find(c => c._id === clientId)
      return client ? client.name : 'Cliente no encontrado'
    }
    return clientId?.name || 'Cliente no encontrado'
  }

  const getProductName = (productId) => {
    if (typeof productId === 'string') {
      const product = products.find(p => p._id === productId)
      return product ? product.name : 'Producto no encontrado'
    }
    return productId?.name || 'Producto no encontrado'
  }

  const getPackageName = (packageId) => {
    if (typeof packageId === 'string') {
      const packageItem = availablePackages.find(p => p._id === packageId)
      return packageItem ? packageItem.name : 'Paquete no encontrado'
    }
    return packageId?.name || 'Paquete no encontrado'
  }

  const getBankAccountName = (bankAccountId) => {
    if (!bankAccountId) return ''
    if (typeof bankAccountId === 'string') {
      const bank = banks.find(b => b._id === bankAccountId)
      return bank ? `${bank.name} - ${bank.accountNumber}` : 'Cuenta no encontrada'
    }
    return bankAccountId?.name || 'Cuenta no encontrada'
  }

  const getItemName = (item) => {
    if (item.isPackage && item.package) {
      return getPackageName(item.package)
    }
    if (item.isFromPackage) {
      return `${getProductName(item.product)} (de ${item.packageName})`
    }
    return getProductName(item.product)
  }

  const validateBatchesSelected = () => {
    return selectedProducts.every(item => {
      const product = products.find(p => p._id === item.product);
      
      // Si el producto no maneja lotes, siempre es válido
      if (!product?.managesBatches) return true;
      
      const hasAvailableBatches = availableBatches[item.product] && availableBatches[item.product].length > 0;
      
      // Si el producto maneja lotes pero no hay lotes disponibles, es inválido
      if (!hasAvailableBatches) return false;
      
      // Si hay lotes disponibles, verificar que la cantidad total sea suficiente
      const totalBatchQuantity = getTotalBatchQuantity(item.product);
      return totalBatchQuantity >= item.quantity;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Gestión de Ventas</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra las ventas y pedidos de clientes</p>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={openImportModal}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full lg:w-auto btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nueva Venta</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ventas por cliente o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="todos">Todos los estados</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingSale ? 'Editar Venta' : 'Crear Nueva Venta'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingSale(null)
                setFormData({
                  client: '',
                  items: [],
                  notes: '',
                  dueDate: ''
                })
                setSelectedClient('')
                setSelectedProducts([])
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <select
                  name="client"
                  value={selectedClient}
                  onChange={handleClientChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.email} - Términos: {client.paymentTerms || 30} días
                    </option>
                  ))}
                </select>
              </div>


              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                  {selectedClient && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Calculada automáticamente)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  title={selectedClient ? "Puedes editar esta fecha si necesitas un vencimiento diferente" : "Selecciona un cliente para calcular automáticamente la fecha de vencimiento"}
                />
                {selectedClient && formData.dueDate && (
                  <p className="text-xs text-gray-600 mt-1">
                    💡 Esta fecha se calculó automáticamente basada en los términos de pago del cliente. Puedes editarla si necesitas una fecha diferente.
                  </p>
                )}
              </div>
            </div>

            {/* Selección de Productos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
                
                {/* Selector de modo de venta */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setSaleMode('products')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      saleMode === 'products'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package2 className="w-4 h-4 inline mr-1" />
                    Productos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleMode('packages')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      saleMode === 'packages'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package2 className="w-4 h-4 inline mr-1" />
                    Paquetes
                  </button>
                </div>
              </div>
              
              {/* Mensaje de ayuda */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {saleMode === 'products' ? (
                    <>
                      <strong>💡 Sistema de Lotes:</strong> 
                      {selectedProducts.some(item => availableBatches[item.product] && availableBatches[item.product].length > 0) ? (
                        ' Después de seleccionar un producto, debe elegir el lote específico del cual se venderá. Esto permite un control preciso del inventario y trazabilidad de los productos vendidos.'
                      ) : (
                        ' Los productos seleccionados no manejan lotes, por lo que se pueden vender directamente desde el inventario general.'
                      )}
                    </>
                  ) : (
                    <>
                      <strong>📦 Sistema de Paquetes:</strong> 
                      ' Selecciona paquetes predefinidos que contienen múltiples productos. El sistema verificará automáticamente la disponibilidad de stock de todos los productos incluidos en el paquete.'
                    </>
                  )}
                </p>
              </div>
              
              {/* Selector de productos o paquetes - Solo en modo creación */}
              {!editingSale && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {saleMode === 'products' ? 'Agregar Producto' : 'Agregar Paquete'}
                  </label>
                  <select
                    onChange={(e) => {
                      if (saleMode === 'products') {
                        handleProductSelect(e.target.value)
                      } else {
                        handlePackageSelect(e.target.value)
                      }
                    }}
                    className="w-full input-field"
                    defaultValue=""
                  >
                    <option value="">
                      {saleMode === 'products' ? 'Seleccionar producto' : 'Seleccionar paquete'}
                    </option>
                    {saleMode === 'products' ? (
                      products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - Precio: {formatCurrency(product.price)} - Stock: {product.stock || 0}
                        </option>
                      ))
                    ) : (
                      (() => {
                        return availablePackages.map(packageItem => (
                          <option 
                            key={packageItem._id} 
                            value={packageItem._id}
                            disabled={!packageItem.stockAvailable}
                          >
                            {packageItem.name} - Precio: {formatCurrency(packageItem.finalPrice)} - 
                            {packageItem.stockAvailable ? 'Disponible' : 'Sin stock'}
                          </option>
                        ));
                      })()
                    )}
                  </select>
                </div>
              )}

              {/* Información de modo edición */}
              {editingSale && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Modo Edición:</strong> Los productos ya están seleccionados. Puedes editar cantidades, lotes y descuentos, pero no agregar nuevos productos.
                  </p>
                </div>
              )}

              {/* Lista de productos seleccionados */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Productos Seleccionados:</h4>
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {getItemName(item)}
                          {item.isPackage && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              Paquete
                            </span>
                          )}
                          {item.isFromPackage && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                              De Paquete
                            </span>
                          )}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(item.isPackage ? item.package : item.product, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Selector de Múltiples Lotes */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <label className="block text-xs font-medium text-blue-700 mb-2 flex items-center">
                          <Package2 className="w-4 h-4 mr-1" />
                          Seleccionar Lotes {(() => {
                            const product = products.find(p => p._id === item.product);
                            const hasBatches = availableBatches[item.product] && availableBatches[item.product].length > 0;
                            if (product?.managesBatches && hasBatches) return '*';
                            if (product?.managesBatches && !hasBatches) return '(Sin lotes disponibles)';
                            return '(Opcional)';
                          })()}
                        </label>
                        {(() => {
                          const product = products.find(p => p._id === item.product);
                          if (!product?.managesBatches) {
                            return (
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                Este producto no maneja lotes - se puede vender directamente
                              </div>
                            );
                          }
                          
                          if (availableBatches[item.product] && availableBatches[item.product].length > 0) {
                            return (
                          <div className="space-y-3">
                            {/* Lotes Seleccionados */}
                            {(() => {
                              return null
                            })()}
                            {selectedBatches[item.product] && selectedBatches[item.product].length > 0 && (
                              <div className="space-y-2">
                                {selectedBatches[item.product].map((selectedBatch, index) => {
                                  const batch = availableBatches[item.product].find(b => b._id === selectedBatch.batchId);
                                  return batch ? (
                                    <div key={selectedBatch.batchId} className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                                      <div className="flex-1">
                                        <p className="text-xs text-green-700 font-medium">
                                          Lote #{batch.batchNumber} - Vence: {new Date(batch.expirationDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-green-600">
                                          Stock disponible: {batch.currentStock} {batch.unit}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="number"
                                          min="1"
                                          max={batch.currentStock}
                                          value={selectedBatch.quantity}
                                          onChange={(e) => handleBatchQuantityChange(item.product, selectedBatch.batchId, parseInt(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 text-xs border border-green-300 rounded focus:border-green-500 focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleBatchRemove(item.product, selectedBatch.batchId)}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                                
                                {/* Resumen de cantidad total */}
                                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                  <strong>Total seleccionado:</strong> {getTotalBatchQuantity(item.product)} / {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
                                  {getTotalBatchQuantity(item.product) < item.quantity && (
                                    <span className="text-orange-600 ml-2">
                                      ⚠️ Faltan {item.quantity - getTotalBatchQuantity(item.product)} unidades
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Selector para agregar más lotes */}
                            <div className="flex space-x-2">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleBatchAdd(item.product, e.target.value, 1);
                                    e.target.value = '';
                                  }
                                }}
                                className="flex-1 input-field text-sm border-blue-200 focus:border-blue-500"
                              >
                                <option value="">Agregar lote...</option>
                                {availableBatches[item.product]
                                  .filter(batch => {
                                    const selectedBatch = selectedBatches[item.product]?.find(sb => sb.batchId === batch._id);
                                    return !selectedBatch || selectedBatch.quantity < batch.currentStock;
                                  })
                                  .map(batch => (
                                    <option key={batch._id} value={batch._id}>
                                      Lote #{batch.batchNumber} - Stock: {batch.currentStock} {batch.unit} - Vence: {new Date(batch.expirationDate).toLocaleDateString()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                            );
                          }
                          
                          return (
                            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                              ⚠️ Este producto maneja lotes pero no hay lotes disponibles. Verifica que existan lotes activos para este producto.
                            </div>
                          );
                        })()}
                      </div>

                      {/* Información del producto de paquete */}
                      {item.isFromPackage && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <label className="block text-xs font-medium text-blue-700 mb-2 flex items-center">
                            <Package2 className="w-4 h-4 mr-1" />
                            Producto de Paquete
                          </label>
                          <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded">
                            Este producto forma parte del paquete "{item.packageName}". Selecciona el lote específico para este producto.
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              if (item.isPackage) {
                                handlePackageQuantityChange(item.package, parseInt(e.target.value))
                              } else {
                                handleProductQuantityChange(item.product, parseInt(e.target.value))
                              }
                            }}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Precio Unitario</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleProductPriceChange(item.product, parseFloat(e.target.value))}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Descuento</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => {
                              if (item.isPackage) {
                                handlePackageDiscountChange(item.package, parseFloat(e.target.value))
                              } else {
                                handleProductDiscountChange(item.product, parseFloat(e.target.value))
                              }
                            }}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Total</label>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales */}
              {selectedProducts.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Resumen de Totales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA ({calculateTotals().ivaPercentage}%):</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-900">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotals().total)}</span>
                    </div>
                  </div>
                </div>
              )}
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
                rows="3"
                className="w-full input-field"
                placeholder="Observaciones, instrucciones de entrega, etc..."
              />
            </div>

            {/* Indicador de Progreso de Lotes */}
            {selectedProducts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package2 className="w-4 h-4 mr-2" />
                  Estado de Selección de Lotes
                </h4>
                <div className="space-y-2">
                  {selectedProducts.map((item, index) => {
                    const product = products.find(p => p._id === item.product);
                    const hasBatch = selectedBatches[item.product]
                    const availableBatchesForProduct = availableBatches[item.product] || []
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {getProductName(item.product)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!product?.managesBatches ? (
                            <span className="text-blue-600 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Sin lotes - Listo para vender
                            </span>
                          ) : hasBatch ? (
                            <span className="text-green-600 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Lote seleccionado
                            </span>
                          ) : availableBatchesForProduct.length > 0 ? (
                            <span className="text-orange-600 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Pendiente
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Sin lotes disponibles
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingSale(null)
                  setFormData({
                    client: '',
                    items: [],
                    notes: '',
                    dueDate: ''
                  })
                  setSelectedClient('')
                  setSelectedProducts([])
                  setSelectedBatches({})
                  setAvailableBatches({})
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
                disabled={!selectedClient || selectedProducts.length === 0 || !validateBatchesSelected()}
              >
                {editingSale ? 'Actualizar Venta' : 'Crear Venta'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Ventas */}
      <div className="card card-hover">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Ventas ({filteredSales.length})
          </h3>
        </div>
        
        <>
          {/* Vista de tarjetas para móviles */}
          <div className="lg:hidden p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSales.map((sale) => {
                const statusInfo = getStatusInfo(sale.paymentStatus)
                const StatusIcon = getStatusIcon(sale.paymentStatus)
                
                return (
                  <div key={sale._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{sale.invoiceNumber}</h4>
                        <p className="text-xs text-gray-600">
                          {sale.paymentMethod ? (
                            <>
                              {sale.paymentMethod === 'efectivo' && 'Efectivo'}
                              {sale.paymentMethod === 'tarjeta' && 'Tarjeta'}
                              {sale.paymentMethod === 'transferencia' && 'Transferencia'}
                              {sale.paymentMethod === 'cheque' && 'Cheque'}
                              {sale.bankAccount && ` • Cuenta: ${getBankAccountName(sale.bankAccount)}`}
                            </>
                          ) : (
                            'Pago pendiente'
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
                        <span className={`text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* Cliente */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">{getClientName(sale.client)}</p>
                      <p className="text-xs text-gray-600">
                        {sale.client?.email || 'Email no disponible'}
                      </p>
                    </div>
                    
                    {/* Productos */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Productos ({sale.items?.length || 0}):
                      </p>
                      <div className="space-y-1">
                        {sale.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {item.quantity}x {getProductName(item.product)}
                            {item.batch && (
                              <span className="text-blue-600 ml-1">
                                (Lote #{item.batch.batchNumber || item.batch})
                              </span>
                            )}
                          </div>
                        ))}
                        {sale.items?.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{sale.items.length - 3} productos más...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Totales */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900">
                        Total: {formatCurrency(sale.total)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Subtotal: {formatCurrency(sale.subtotal)} • IVA: {formatCurrency(sale.tax)}
                      </p>
                      {sale.paidAmount > 0 && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-700">
                            <span className="font-medium">Pagado:</span> {formatCurrency(sale.paidAmount || 0)}
                          </p>
                          {sale.paymentStatus !== 'pagado' && (
                            <p className="text-xs text-orange-600">
                              <span className="font-medium">Restante:</span> {formatCurrency(sale.remainingAmount || sale.total)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sale)}
                        className="flex-1 text-xs p-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      {sale.paymentStatus !== 'pagado' && sale.paymentStatus !== 'cancelado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPaymentModal(sale)}
                          className="flex-1 text-xs p-2 text-green-600 hover:text-green-800"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Pagar
                        </Button>
                      )}
                      {sale.paidAmount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPaymentHistory(sale)}
                          className="flex-1 text-xs p-2 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Historial
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(sale._id)}
                        className="flex-1 text-xs p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => {
                  const statusInfo = getStatusInfo(sale.paymentStatus)
                  const StatusIcon = getStatusIcon(sale.paymentStatus)
                  
                  return (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                         
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getClientName(sale.client)}</div>
                          <div className="text-xs text-gray-500">
                            {sale.client?.email || 'Email no disponible'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {sale.items?.map((item, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {item.quantity}x {getProductName(item.product)}
                              {item.batch && (
                                <span className="text-blue-600 ml-1">
                                  (Lote #{item.batch.batchNumber || item.batch})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(sale.total)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Subtotal: {formatCurrency(sale.subtotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            IVA: {formatCurrency(sale.tax)}
                          </div>
                          {sale.paidAmount > 0 && (
                            <div className="mt-1 text-xs">
                              <div className="text-green-600">
                                Pagado: {formatCurrency(sale.paidAmount || 0)}
                              </div>
                              {sale.paymentStatus !== 'pagado' && (
                                <div className="text-orange-600">
                                  Restante: {formatCurrency(sale.remainingAmount || sale.total)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
                          <span className={`text-sm font-medium ${statusInfo?.color}`}>
                            {statusInfo?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          <div>Venta: {new Date(sale.saleDate).toLocaleDateString('es-DO')}</div>
                          <div>Vencimiento: {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString('es-DO') : 'No definida'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={sale.paymentStatus}
                            onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {statuses.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          {sale.paymentStatus !== 'pagado' && sale.paymentStatus !== 'cancelado' && (
                            <button
                              onClick={() => handleOpenPaymentModal(sale)}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200"
                              title="Agregar Pago"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          {sale.paidAmount > 0 && (
                            <button
                              onClick={() => handleOpenPaymentHistory(sale)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                              title="Ver Historial de Pagos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(sale)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'todos' 
                ? 'No se encontraron ventas con los filtros aplicados'
                : 'Comienza creando tu primera venta'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Pagos Parciales */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        sale={selectedSaleForPayment}
        onSave={handleAddPayment}
        banks={banks}
      />

      {/* Modal de Historial de Pagos */}
      <PaymentHistoryModal
        isOpen={showPaymentHistoryModal}
        onClose={handleClosePaymentHistory}
        sale={selectedSaleForHistory}
        onDeletePayment={handleDeletePaymentFromHistory}
        banks={banks}
      />

      {/* Modal de Confirmación de Pago */}
      <PaymentPromptModal
        isOpen={showPaymentPromptModal}
        onClose={handleClosePaymentPrompt}
        onPayNow={handlePayNow}
        onSkipPayment={handleSkipPayment}
        sale={newlyCreatedSale}
      />

      {/* Modal de Importación */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={closeImportModal}
        onImport={importData}
        title={importConfig.title}
        description={importConfig.description}
        sampleData={importConfig.sampleData}
        columns={importConfig.columns}
        loading={importLoading}
      />
    </div>
  )
}
