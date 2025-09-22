import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, DollarSign, Building, Calendar, FileText, AlertCircle, CreditCard, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccountConfigs } from '@/hooks/useAccountConfigs'
import { useAccounts } from '@/hooks/useAccounts'
import { useBanks } from '@/hooks/useBanks'
import { useSuppliers } from '@/hooks/useSuppliers'

function AccountPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  banks = [], 
  banksLoading = false,
  getBankAccountName 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Efectivo',
    bankAccount: '',
    accountId: '',
    category: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    supplierId: '',
    supplierName: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  // Estados para el selector de búsqueda de cuentas
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [accountSearchTerm, setAccountSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const accountSearchRef = useRef(null)
  
  // Estados para el selector de proveedores
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const supplierSearchRef = useRef(null)

  const { accountConfigs, loading: configsLoading, error: configsError } = useAccountConfigs()
  const { flatAccounts, loading: accountsLoading, error: accountsError } = useAccounts()
  const { suppliers, loading: suppliersLoading } = useSuppliers()

  // Obtener cuentas de gastos desde configuraciones o directamente de cuentas (memoizado)
  const expenseAccounts = useMemo(() => {
    const expenseAccountsFromConfigs = accountConfigs?.compras ? Object.values(accountConfigs.compras) : []
    const expenseAccountsFromList = flatAccounts?.filter(account => account.type === 'gasto') || []
    
    // Usar configuraciones si están disponibles, sino usar la lista de cuentas
    return expenseAccountsFromConfigs.length > 0 ? expenseAccountsFromConfigs : expenseAccountsFromList
  }, [accountConfigs, flatAccounts])
  
  // Si no hay configuraciones de cuentas, mostrar mensaje informativo
  const hasAccountConfigs = Object.keys(accountConfigs || {}).length > 0
  const hasAccounts = flatAccounts && flatAccounts.length > 0
  
  // Filtrar proveedores basado en búsqueda
  const filteredSuppliers = useMemo(() => {
    if (!suppliers || !supplierSearchTerm) return suppliers || []
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    )
  }, [suppliers, supplierSearchTerm])

  // Filtrar cuentas basado en el término de búsqueda (memoizado)
  const filteredAccounts = useMemo(() => {
    if (expenseAccounts.length > 0) {
      return expenseAccounts.filter(account => {
        const accountCode = account.accountCode || account.code || ''
        const accountName = account.accountName || account.name || ''
        const searchTerm = accountSearchTerm.toLowerCase()
        
        return accountCode.toLowerCase().includes(searchTerm) || 
               accountName.toLowerCase().includes(searchTerm)
      })
    }
    return []
  }, [expenseAccounts, accountSearchTerm])

  // Actualizar cuenta seleccionada cuando cambie formData.accountId
  useEffect(() => {
    if (formData.accountId && expenseAccounts.length > 0) {
      const account = expenseAccounts.find(acc => {
        const accountId = acc.accountId || acc._id || acc.id
        return accountId === formData.accountId
      })
      if (account && (!selectedAccount || selectedAccount.accountId !== account.accountId)) {
        setSelectedAccount(account)
        setAccountSearchTerm(`${account.accountCode || account.code} - ${account.accountName || account.name}`)
      }
    } else if (!formData.accountId && selectedAccount) {
      setSelectedAccount(null)
      setAccountSearchTerm('')
    }
  }, [formData.accountId, expenseAccounts, selectedAccount])

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountSearchRef.current && !accountSearchRef.current.contains(event.target)) {
        setShowAccountDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Categorías de gastos comunes
  const expenseCategories = [
    { value: 'renta', label: 'Renta/Alquiler', icon: Building },
    { value: 'servicios', label: 'Servicios Públicos', icon: CreditCard },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: FileText },
    { value: 'marketing', label: 'Marketing/Publicidad', icon: FileText },
    { value: 'consultoria', label: 'Consultoría', icon: FileText },
    { value: 'seguros', label: 'Seguros', icon: FileText },
    { value: 'otros', label: 'Otros Gastos', icon: FileText }
  ]

  // Limpiar formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: '',
        paymentMethod: 'Efectivo',
        bankAccount: '',
        accountId: '',
        category: '',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        supplierId: '',
        supplierName: ''
      })
      setErrors({})
      setSelectedAccount(null)
      setAccountSearchTerm('')
      setSelectedSupplier(null)
      setSupplierSearchTerm('')
    }
  }, [isOpen])

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountSearchRef.current && !accountSearchRef.current.contains(event.target)) {
        setShowAccountDropdown(false)
      }
      if (supplierSearchRef.current && !supplierSearchRef.current.contains(event.target)) {
        setShowSupplierDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto es requerido y debe ser mayor a 0'
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Debe seleccionar una cuenta contable'
    }

    if (!formData.category) {
      newErrors.category = 'Debe seleccionar una categoría de gasto'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.bankAccount) {
      newErrors.bankAccount = 'Debe seleccionar una cuenta bancaria'
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de pago es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccount: formData.bankAccount || null,
        accountId: formData.accountId,
        category: formData.category,
        description: formData.description.trim(),
        paymentDate: formData.paymentDate,
        reference: formData.reference.trim() || null,
        supplierId: formData.supplierId || null,
        supplierName: formData.supplierName || null,
        type: 'account_payment'
      }


      await onSave(paymentData)
      onClose()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Manejar búsqueda de cuentas
  const handleAccountSearch = useCallback((value) => {
    if (accountSearchTerm !== value) {
      setAccountSearchTerm(value)
      setShowAccountDropdown(true)
      
      // Si se limpia la búsqueda, limpiar la selección
      if (!value.trim()) {
        setSelectedAccount(null)
        handleChange('accountId', '')
      }
    }
  }, [accountSearchTerm])

  // Manejar selección de cuenta
  const handleAccountSelect = useCallback((account) => {
    const accountId = account.accountId || account._id || account.id
    const accountCode = account.accountCode || account.code
    const accountName = account.accountName || account.name
    const newSearchTerm = `${accountCode} - ${accountName}`
    
    // Solo actualizar si es diferente
    if (selectedAccount?.accountId !== accountId) {
      setSelectedAccount(account)
      setAccountSearchTerm(newSearchTerm)
      setShowAccountDropdown(false)
      handleChange('accountId', accountId)
    }
  }, [selectedAccount])

  // Limpiar selección de cuenta
  const handleClearAccount = useCallback(() => {
    setSelectedAccount(null)
    setAccountSearchTerm('')
    setShowAccountDropdown(false)
    handleChange('accountId', '')
  }, [])

  // Manejar búsqueda de proveedores
  const handleSupplierSearch = useCallback((value) => {
    if (supplierSearchTerm !== value) {
      setSupplierSearchTerm(value)
      setShowSupplierDropdown(true)
      
      // Si se limpia la búsqueda, limpiar la selección
      if (!value.trim()) {
        setSelectedSupplier(null)
        handleChange('supplierId', '')
        handleChange('supplierName', '')
      }
    }
  }, [supplierSearchTerm])

  // Manejar selección de proveedor
  const handleSupplierSelect = useCallback((supplier) => {
    // Solo actualizar si es diferente
    if (selectedSupplier?._id !== supplier._id) {
      setSelectedSupplier(supplier)
      setSupplierSearchTerm(supplier.name)
      setShowSupplierDropdown(false)
      handleChange('supplierId', supplier._id)
      handleChange('supplierName', supplier.name)
    }
  }, [selectedSupplier])

  // Limpiar selección de proveedor
  const handleClearSupplier = useCallback(() => {
    setSelectedSupplier(null)
    setSupplierSearchTerm('')
    setShowSupplierDropdown(false)
    handleChange('supplierId', '')
    handleChange('supplierName', '')
  }, [])


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pago con Cuenta Contable</h2>
              <p className="text-sm text-gray-500">Registrar gasto con imputación contable</p>
            </div>
          </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Categoría de Gasto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría de Gasto *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar categoría</option>
              {expenseCategories.map((category) => {
                const IconComponent = category.icon
                return (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                )
              })}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Proveedor (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor (Opcional)
            </label>
            <div className="relative" ref={supplierSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={supplierSearchTerm}
                  onChange={(e) => handleSupplierSearch(e.target.value)}
                  onFocus={() => setShowSupplierDropdown(true)}
                  placeholder="Buscar proveedor..."
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.supplierId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={suppliersLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {selectedSupplier && (
                    <button
                      type="button"
                      onClick={handleClearSupplier}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    showSupplierDropdown ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>
              {showSupplierDropdown && filteredSuppliers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier._id}
                      type="button"
                      onClick={() => handleSupplierSelect(supplier)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          {supplier.contactName && (
                            <div className="text-sm text-gray-500">
                              Contacto: {supplier.contactName}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {supplier.category || 'Sin categoría'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSupplierDropdown && filteredSuppliers.length === 0 && supplierSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">
                    No se encontraron proveedores que coincidan con "{supplierSearchTerm}"
                  </p>
                </div>
              )}
            </div>
            {errors.supplierId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.supplierId}
              </p>
            )}
          </div>

          {/* Cuenta Contable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta Contable *
            </label>
            {!hasAccountConfigs && !hasAccounts && !configsLoading && !accountsLoading ? (
              <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No hay cuentas contables disponibles. 
                  Por favor, configure las cuentas contables en la sección de configuración.
                </p>
              </div>
            ) : (
              <div className="relative" ref={accountSearchRef}>
                {/* Input de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={accountSearchTerm}
                    onChange={(e) => handleAccountSearch(e.target.value)}
                    onFocus={() => setShowAccountDropdown(true)}
                    placeholder="Buscar cuenta contable..."
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.accountId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={configsLoading || accountsLoading || (!hasAccountConfigs && !hasAccounts)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    {selectedAccount && (
                      <button
                        type="button"
                        onClick={handleClearAccount}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      showAccountDropdown ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                {/* Dropdown de resultados */}
                {showAccountDropdown && filteredAccounts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredAccounts.map((account) => {
                      const accountId = account.accountId || account._id || account.id
                      const accountCode = account.accountCode || account.code
                      const accountName = account.accountName || account.name
                      const accountType = account.accountType || account.type
                      
                      return (
                        <button
                          key={accountId}
                          type="button"
                          onClick={() => handleAccountSelect(account)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {accountCode} - {accountName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {accountType}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {account.level && `Nivel ${account.level}`}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {showAccountDropdown && filteredAccounts.length === 0 && accountSearchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-500 text-center">
                      No se encontraron cuentas que coincidan con "{accountSearchTerm}"
                    </p>
                  </div>
                )}
              </div>
            )}
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.accountId}
              </p>
            )}
            {(configsLoading || accountsLoading) && (
              <p className="mt-1 text-sm text-gray-500">Cargando cuentas contables...</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Ej: Pago de renta oficina principal, Servicios de luz, Mantenimiento equipo..."
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.paymentDate}
              </p>
            )}
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia (Opcional)
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de factura, contrato, etc."
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>

          {/* Cuenta Bancaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta Bancaria *
            </label>
            <select
              value={formData.bankAccount}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.bankAccount ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={banksLoading}
            >
              <option value="">Seleccionar cuenta bancaria</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {getBankAccountName ? getBankAccountName(bank._id) : `${bank.name} - ${bank.accountNumber}`}
                </option>
              ))}
            </select>
            {errors.bankAccount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.bankAccount}
              </p>
            )}
            {banksLoading && (
              <p className="mt-1 text-sm text-gray-500">Cargando cuentas bancarias...</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountPaymentModal
