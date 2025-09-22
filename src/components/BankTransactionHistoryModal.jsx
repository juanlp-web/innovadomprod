import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  Banknote,
  RotateCcw,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBankTransactions } from '@/hooks/useBankTransactions';
import { useToast } from '@/components/ui/toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export function BankTransactionHistoryModal({ 
  isOpen, 
  onClose, 
  bank 
}) {
  
  const { 
    transactions, 
    stats, 
    loading, 
    error, 
    fetchTransactions,
    createTransaction 
  } = useBankTransactions(bank?._id);
  
  const { success: showSuccess, error: showError } = useToast();
  
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'deposit',
    amount: '',
    description: ''
  });

  // Cargar transacciones cuando se abra el modal
  useEffect(() => {
    if (isOpen && bank?._id) {
      fetchTransactions(filters);
    }
  }, [isOpen, bank?._id, filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'payment':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
      case 'refund':
        return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <Settings className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'payment':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'withdrawal':
      case 'refund':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTransactionLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      payment: 'Pago',
      refund: 'Reversión',
      adjustment: 'Ajuste'
    };
    return labels[type] || type;
  };

  // Procesar datos para el gráfico de ingresos y gastos
  const chartData = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    // Agrupar transacciones por fecha
    const groupedByDate = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          ingresos: 0,
          gastos: 0
        };
      }

      // Clasificar como ingreso o gasto
      if (transaction.type === 'deposit' || transaction.type === 'payment') {
        acc[date].ingresos += transaction.amount;
      } else if (transaction.type === 'withdrawal' || transaction.type === 'refund') {
        acc[date].gastos += transaction.amount;
      }

      return acc;
    }, {});

    // Convertir a array y ordenar por fecha
    const chartDataArray = Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Si no hay suficientes datos, crear datos de ejemplo para mostrar el gráfico
    if (chartDataArray.length === 0) {
      const today = new Date();
      const last30Days = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push({
          date: date.toISOString().split('T')[0],
          ingresos: 0,
          gastos: 0
        });
      }
      return last30Days;
    }

    return chartDataArray;
  }, [transactions]);

  // Calcular totales para el gráfico
  const chartTotals = useMemo(() => {
    return chartData.reduce((acc, item) => {
      acc.totalIngresos += item.ingresos;
      acc.totalGastos += item.gastos;
      return acc;
    }, { totalIngresos: 0, totalGastos: 0 });
  }, [chartData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || !transactionForm.description) {
      showError('Todos los campos son requeridos');
      return;
    }

    try {
      await createTransaction({
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description
      });
      
      showSuccess('Transacción registrada correctamente');
      setTransactionForm({ type: 'deposit', amount: '', description: '' });
      setShowAddTransaction(false);
    } catch (err) {
      showError('Error al registrar transacción');
    }
  };

  
  if (!isOpen) {
    return null;
  }
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Historial de Transacciones</h2>
              <p className="text-sm text-gray-600">{bank?.name} - {bank?.accountNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTransaction(true)}
              className="text-green-600 hover:text-green-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nueva Transacción
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Transacciones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Depósitos</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalDeposits)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Retiros</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cambio Neto</p>
                    <p className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.netChange)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Ingresos y Gastos */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                Ingresos vs Gastos
              </h3>
              <div className="flex items-center space-x-3 text-xs text-gray-600">
                <div className="flex items-center bg-white px-2 py-1 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-1.5"></div>
                  <span className="font-medium">{formatCurrency(chartTotals.totalIngresos)}</span>
                </div>
                <div className="flex items-center bg-white px-2 py-1 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1.5"></div>
                  <span className="font-medium">{formatCurrency(chartTotals.totalGastos)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-48 w-full bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-DO', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(value), 
                    name === 'ingresos' ? 'Ingresos' : 'Gastos'
                  ]}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-DO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  formatter={(value) => value === 'ingresos' ? 'Ingresos' : 'Gastos'}
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="deposit">Depósitos</option>
                <option value="withdrawal">Retiros</option>
                <option value="payment">Pagos</option>
                <option value="refund">Reversiones</option>
                <option value="adjustment">Ajustes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ type: 'all', startDate: '', endDate: '', page: 1, limit: 20 })}
                className="text-gray-600"
              >
                <Filter className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando transacciones...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600 font-medium">Error</p>
                <p className="text-gray-600">{error}</p>
                <Button
                  onClick={() => fetchTransactions(filters)}
                  className="mt-4"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !Array.isArray(transactions) || transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No hay transacciones</p>
                <p className="text-gray-500 text-sm">No se encontraron transacciones con los filtros aplicados</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(transactions) && transactions.map((transaction) => (
                <div key={transaction._id} className={`p-4 rounded-lg border ${getTransactionColor(transaction.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{getTransactionLabel(transaction.type)}</h4>
                        <p className="text-sm opacity-75">{transaction.description}</p>
                        <p className="text-xs opacity-60">
                          {formatDate(transaction.createdAt)} • {transaction.createdBy?.name || 'Usuario'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'deposit' || transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' || transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs opacity-60">
                        Saldo: {formatCurrency(transaction.newBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para nueva transacción */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nueva Transacción</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddTransaction(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full input-field"
                    required
                  >
                    <option value="deposit">Depósito</option>
                    <option value="withdrawal">Retiro</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full input-field"
                    rows="3"
                    placeholder="Descripción de la transacción..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTransaction(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="btn-primary">
                    Registrar Transacción
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
