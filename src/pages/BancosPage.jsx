import { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  X,
  Save,
  RefreshCw,
  History,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { useBanks } from '@/hooks/useBanks';
import { BankTransactionHistoryModal } from '@/components/BankTransactionHistoryModal';
import { useImport } from '@/hooks/useImport';
import { ImportModal } from '@/components/ImportModal';

export function BancosPage() {
  const { success: showSuccess, error: showError } = useToast();
  const { 
    banks, 
    loading, 
    summary, 
    createBank, 
    updateBank, 
    deleteBank 
  } = useBanks();

  // Hook para importación
  const {
    loading: importLoading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  } = useImport('banks');

  // Configuración para importación
  const importConfig = {
    title: "Importar Cuentas Bancarias",
    description: "Importa cuentas bancarias desde un archivo CSV o Excel",
    sampleData: [
      {
        name: "Banco Nacional",
        accountType: "banco",
        accountNumber: "1234567890",
        initialBalance: "1000.00",
        currentBalance: "1000.00",
        currency: "DOP"
      },
      {
        name: "Banco Comercial",
        accountType: "banco",
        accountNumber: "0987654321",
        initialBalance: "5000.00",
        currentBalance: "4500.00",
        currency: "USD"
      },
      {
        name: "Caja Chica",
        accountType: "efectivo",
        accountNumber: "",
        initialBalance: "100.00",
        currentBalance: "100.00",
        currency: "DOP"
      }
    ],
    columns: [
      { key: 'name', header: 'Nombre del Banco', required: true },
      { key: 'accountType', header: 'Tipo (banco/efectivo/tarjeta)', required: true },
      { key: 'accountNumber', header: 'Número de Cuenta', required: false },
      { key: 'initialBalance', header: 'Saldo Inicial', required: true },
      { key: 'currentBalance', header: 'Saldo Actual', required: true },
      { key: 'currency', header: 'Moneda (DOP/USD/EUR)', required: true }
    ]
  };
  
  // Estados para el modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBankForHistory, setSelectedBankForHistory] = useState(null);
  const [bankFormData, setBankFormData] = useState({
    name: '',
    type: 'banco',
    accountNumber: '',
    initialBalance: '',
    currency: 'DOP',
    initialBalanceDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Funciones para cuentas bancarias
  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBankAccount = () => {
    setEditingBankAccount(null);
    setBankFormData({
      name: '',
      type: 'banco',
      accountNumber: '',
      initialBalance: '',
      currency: 'DOP',
      initialBalanceDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowBankModal(true);
  };

  const handleEditBankAccount = (account) => {
    setEditingBankAccount(account);
    setBankFormData({
      name: account.name,
      type: account.type,
      accountNumber: account.accountNumber || '',
      initialBalance: account.initialBalance || '',
      currency: account.currency || 'DOP',
      initialBalanceDate: account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: account.description || ''
    });
    setShowBankModal(true);
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault(); // Prevenir recarga de página
    
    if (!bankFormData.name.trim()) {
      showError('El nombre de la cuenta es requerido');
      return;
    }

    if (!bankFormData.initialBalance || bankFormData.initialBalance === '') {
      showError('El saldo inicial es requerido');
      return;
    }

    try {
      const accountData = {
        ...bankFormData,
        initialBalance: parseFloat(bankFormData.initialBalance)
      };

      if (editingBankAccount) {
        await updateBank(editingBankAccount._id, accountData);
      } else {
        await createBank(accountData);
      }

      // Limpiar formulario y cerrar modal
      setBankFormData({
        name: '',
        type: 'banco',
        accountNumber: '',
        initialBalance: '',
        currency: 'DOP',
        initialBalanceDate: new Date().toISOString().split('T')[0],
        description: ''
      });
      setEditingBankAccount(null);
      setShowBankModal(false);
    } catch (error) {
      showError('Error al guardar la cuenta bancaria: ' + error.message);
    }
  };

  const handleDeleteBankAccount = async (accountId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta bancaria?')) {
      try {
        await deleteBank(accountId);
      } catch (error) {
      }
    }
  };

  // Funciones para historial de transacciones
  const handleOpenHistory = (bank) => {
    setSelectedBankForHistory(bank);
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    setSelectedBankForHistory(null);
  };

  const getAccountTypeLabel = (type) => {
    const types = {
      'banco': 'Banco',
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta de Crédito'
    };
    return types[type] || type;
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'banco':
        return <Building className="w-4 h-4" />;
      case 'efectivo':
        return <Banknote className="w-4 h-4" />;
      case 'tarjeta':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando cuentas bancarias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            Bancos y Cuentas
          </h1>
          <p className="text-gray-600 mt-1">
            Controla tus movimientos de dinero con tus cuentas de banco, efectivo y tarjetas de crédito.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openImportModal}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button
            onClick={handleAddBankAccount}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Resumen de Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Saldo Total</p>
              <p className="text-2xl font-bold text-green-900">
                ${banks.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Cuentas Activas</p>
              <p className="text-2xl font-bold text-blue-900">{banks.filter(bank => bank.isActive).length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Tipos de Cuenta</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(banks.map(bank => bank.type)).size}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>


      {/* Lista de Cuentas Bancarias */}
      {banks.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas bancarias</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primera cuenta bancaria, de efectivo o tarjeta de crédito.</p>
          <Button onClick={handleAddBankAccount} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Agregar Primera Cuenta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {banks.map((account) => (
            <div key={account._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getAccountTypeIcon(account.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-600">
                      {getAccountTypeLabel(account.type)}
                      {account.accountNumber && ` • ${account.accountNumber}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${account.currentBalance?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">{account.currency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenHistory(account)}
                      className="text-green-600 hover:text-green-700"
                      title="Ver historial de transacciones"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBankAccount(account)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBankAccount(account._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {account.description && (
                <p className="text-sm text-gray-600 mt-2">{account.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Cuentas Bancarias */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBankAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingBankAccount ? 'Modifica los datos de la cuenta' : 'Crea tus cuentas de banco, efectivo o tarjetas de crédito.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBankModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveBankAccount} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Nombre de la cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la cuenta *
                </label>
                <input
                  type="text"
                  name="name"
                  value={bankFormData.name}
                  onChange={handleBankInputChange}
                  placeholder="Nombre de la cuenta"
                  required
                  className="w-full input-field"
                />
              </div>

              {/* Tipo de cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cuenta *
                </label>
                <select
                  name="type"
                  value={bankFormData.type}
                  onChange={handleBankInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="banco">Banco</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de Crédito</option>
                </select>
              </div>

              {/* Número de cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de cuenta
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankFormData.accountNumber}
                  onChange={handleBankInputChange}
                  placeholder="Número de cuenta"
                  className="w-full input-field"
                />
              </div>

              {/* Saldo inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo inicial *
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg">
                    <span className="text-gray-700 font-medium">RD$</span>
                  </div>
                  <input
                    type="number"
                    name="initialBalance"
                    value={bankFormData.initialBalance}
                    onChange={handleBankInputChange}
                    placeholder="Saldo inicial"
                    required
                    step="0.01"
                    className="flex-1 input-field rounded-l-none"
                  />
                  <select
                    name="currency"
                    value={bankFormData.currency}
                    onChange={handleBankInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-r-lg bg-white"
                  >
                    <option value="DOP">DOP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Fecha de saldo inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de saldo inicial *
                </label>
                <input
                  type="date"
                  name="initialBalanceDate"
                  value={bankFormData.initialBalanceDate}
                  onChange={handleBankInputChange}
                  required
                  className="w-full input-field"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={bankFormData.description}
                  onChange={handleBankInputChange}
                  placeholder="Descripción"
                  rows="3"
                  className="w-full input-field"
                />
              </div>

              {/* Footer del Modal dentro del formulario */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 -mx-6 -mb-6 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBankModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingBankAccount ? 'Actualizar Cuenta' : 'Crear Cuenta'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Historial de Transacciones */}
      <BankTransactionHistoryModal
        isOpen={showHistoryModal}
        onClose={handleCloseHistory}
        bank={selectedBankForHistory}
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

      <ToastContainer />
    </div>
  );
}
