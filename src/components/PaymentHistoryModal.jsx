import { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Calendar,
  User,
  FileText,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function PaymentHistoryModal({ 
  isOpen, 
  onClose, 
  sale, 
  purchase,
  payments = [],
  paidAmount = 0,
  remainingAmount = 0,
  onDeletePayment,
  getBankAccountName = () => 'N/A'
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { success: showSuccess, error: showError } = useToast();

  // Determinar si es venta o compra
  const isSale = !!sale;
  const isPurchase = !!purchase;
  const transaction = sale || purchase;
  const transactionType = isSale ? 'venta' : 'compra';
  const transactionNumber = isSale ? sale?.invoiceNumber : purchase?.purchaseNumber;

  // Los pagos se pasan como props, no necesitamos cargarlos

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este pago?')) {
      return;
    }

    try {
      await onDeletePayment(transaction._id, paymentId);
      showSuccess(`Pago eliminado correctamente de la ${transactionType}`);
      // Los pagos se actualizan automáticamente desde el componente padre
    } catch (err) {
      showError(`Error al eliminar el pago de la ${transactionType}`);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque'
    };
    return methods[method] || method;
  };


  const getTotalPaid = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos</h2>
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

        {/* Información de la venta */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de la {transactionType}:</span>
              <p className="font-semibold text-gray-900">{formatCurrency(transaction?.total || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total pagado:</span>
              <p className="font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <span className="text-gray-600">Monto restante:</span>
              <p className="font-semibold text-orange-600">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600">Estado:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              transaction?.paymentStatus === 'pagado' ? 'bg-green-100 text-green-800' :
              transaction?.paymentStatus === 'parcial' ? 'bg-blue-100 text-blue-800' :
              transaction?.paymentStatus === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {transaction?.paymentStatus?.charAt(0).toUpperCase() + transaction?.paymentStatus?.slice(1) || 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando historial de pagos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Error</p>
                <p className="text-gray-600">{error}</p>
                <Button
                  onClick={loadPayments}
                  className="mt-4"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No hay pagos registrados</p>
                <p className="text-gray-500 text-sm">Esta venta no tiene pagos parciales registrados.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lista de pagos */}
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={payment._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Pago #{index + 1}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(payment.paymentDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Monto:</span>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Método:</span>
                            <p className="font-medium">
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Cuenta bancaria:</span>
                            <p className="text-gray-900">
                              {getBankAccountName(payment.bankAccount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Registrado por:</span>
                            <p className="text-gray-900">
                              {payment.createdBy?.name || 'Usuario no disponible'}
                            </p>
                          </div>
                        </div>
                        
                        {payment.notes && (
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Notas:</span>
                            <p className="text-gray-900 text-sm mt-1 bg-gray-50 p-2 rounded">
                              {payment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePayment(payment._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar pago"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumen */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Resumen de Pagos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total de pagos:</span>
                    <p className="font-semibold text-blue-900">{payments.length}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Total pagado:</span>
                    <p className="font-semibold text-blue-900">{formatCurrency(getTotalPaid())}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Monto restante:</span>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency((transaction?.total || 0) - getTotalPaid())}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
