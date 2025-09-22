import { useState, useEffect } from 'react'
import { X, DollarSign, Building, Calendar, FileText, AlertCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccountConfigs } from '@/hooks/useAccountConfigs'
import { useBanks } from '@/hooks/useBanks'

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
    reference: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { accountConfigs, loading: configsLoading } = useAccountConfigs()

  // Obtener todas las cuentas de gastos disponibles
  const expenseAccounts = accountConfigs?.compras ? Object.values(accountConfigs.compras) : []
  
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
        reference: ''
      })
      setErrors({})
    }
  }, [isOpen])

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

    if (formData.paymentMethod !== 'Efectivo' && !formData.bankAccount) {
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

          {/* Cuenta Contable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta Contable *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => handleChange('accountId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.accountId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={configsLoading}
            >
              <option value="">Seleccionar cuenta contable</option>
              {expenseAccounts.map((account) => (
                <option key={account.accountId} value={account.accountId}>
                  {account.accountCode} - {account.accountName}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.accountId}
              </p>
            )}
            {configsLoading && (
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

          {/* Cuenta Bancaria (si no es efectivo) */}
          {formData.paymentMethod !== 'Efectivo' && (
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
          )}

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
