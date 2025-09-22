import { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Calendar,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function PaymentModal({ 
  isOpen, 
  onClose, 
  sale, 
  purchase,
  onSave,
  banks = [],
  banksLoading = false,
  getBankAccountName = () => 'N/A'
}) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    bankAccount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  // Determinar si es venta o compra
  const isSale = !!sale;
  const isPurchase = !!purchase;
  const transaction = sale || purchase;
  const transactionType = isSale ? 'venta' : 'compra';
  const transactionNumber = isSale ? sale?.invoiceNumber : purchase?.purchaseNumber;

  // Determinar métodos de pago según el tipo de transacción
  const paymentMethods = isSale ? [
    // Valores para ventas (Sale model)
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'cheque', label: 'Cheque' }
  ] : [
    // Valores para compras (Purchase model)
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria' },
    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
    { value: 'Cheque', label: 'Cheque' }
  ];

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: '',
        paymentMethod: '',
        bankAccount: '',
        notes: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!transaction) {
      showError(`No se ha seleccionado una ${transactionType}`);
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('El monto del pago debe ser mayor a 0');
      return;
    }

    if (!formData.paymentMethod) {
      showError('Debe seleccionar un método de pago');
      return;
    }

    if (!formData.bankAccount) {
      showError('Debe seleccionar una cuenta bancaria');
      return;
    }

    const remainingAmount = transaction.total - (transaction.paidAmount || 0);
    if (parseFloat(formData.amount) > remainingAmount) {
      showError(`El monto del pago (${formData.amount}) excede el monto restante (${remainingAmount})`);
      return;
    }

    try {
      setLoading(true);
      const paymentData = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccount: formData.bankAccount || null,
        notes: formData.notes || ''
      };

      await onSave(transaction._id, paymentData);
      
      showSuccess(`Pago parcial registrado correctamente en la ${transactionType}`);
      onClose();
    } catch (error) {
      showError(`Error al registrar el pago parcial en la ${transactionType}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const getBankAccountDisplayName = (bankAccountId) => {
    if (!bankAccountId) return 'N/A';
    return getBankAccountName(bankAccountId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Agregar Pago Parcial</h2>
              <p className="text-sm text-gray-600">{isSale ? 'Venta' : 'Compra'} #{transactionNumber}</p>
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

        {/* Información de la transacción */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de la {transactionType}:</span>
              <p className="font-semibold text-gray-900">{formatCurrency(transaction?.total || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Monto pagado:</span>
              <p className="font-semibold text-green-600">{formatCurrency(transaction?.paidAmount || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Monto restante:</span>
              <p className="font-semibold text-orange-600">{formatCurrency(transaction?.remainingAmount || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <p className="font-semibold capitalize">{transaction?.paymentStatus || 'pendiente'}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Monto del pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Pago *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                max={transaction?.remainingAmount || 0}
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {formatCurrency(transaction?.remainingAmount || 0)}
            </p>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar método de pago</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuenta bancaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta Bancaria *
            </label>
            <select
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar cuenta bancaria</option>
              {banks.map(bank => (
                <option key={bank._id} value={bank._id}>
                  {bank.name} - {bank.accountNumber} ({bank.type}) - {formatCurrency(bank.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del Pago
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Observaciones sobre el pago..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Registrar Pago
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

