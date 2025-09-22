import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentPromptModal({ 
  isOpen, 
  onClose, 
  onPayNow, 
  onSkipPayment,
  sale,
  purchase,
  getBankAccountName = () => 'N/A'
}) {
  if (!isOpen) return null;

  // Determinar si es venta o compra
  const isSale = !!sale;
  const isPurchase = !!purchase;
  const transaction = sale || purchase;
  const transactionType = isSale ? 'venta' : 'compra';
  const transactionNumber = isSale ? sale?.invoiceNumber : purchase?.purchaseNumber;

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">¡{isSale ? 'Venta' : 'Compra'} Creada!</h2>
              <p className="text-sm text-gray-600">{isSale ? 'Venta' : 'Compra'} #{transactionNumber} registrada exitosamente</p>
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

        {/* Content */}
        <div className="p-6">
          {/* Sale Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Resumen de la {isSale ? 'Venta' : 'Compra'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(transaction?.total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Productos:</span>
                <span className="text-gray-900">{transaction?.items?.length || 0} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isSale ? 'Cliente:' : 'Proveedor:'}</span>
                <span className="text-gray-900">{isSale ? (sale?.client?.name || 'N/A') : (purchase?.supplierName || 'N/A')}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4 text-center">
              ¿Desea registrar un pago ahora?
            </h3>
            
            <div className="space-y-3">
              {/* Pay Now Option */}
              <button
                onClick={onPayNow}
                className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-green-900">Sí, pagar ahora</h4>
                    <p className="text-sm text-green-700">
                      Registrar pago completo o parcial para esta venta
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Skip Payment Option */}
              <button
                onClick={onSkipPayment}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-900">No, pagar después</h4>
                    <p className="text-sm text-gray-700">
                      La venta quedará como pendiente de pago
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 text-center">
              💡 <strong>Tip:</strong> Puede registrar pagos parciales o completos en cualquier momento desde la lista de ventas
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-gray-600"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
