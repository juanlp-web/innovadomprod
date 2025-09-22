import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  RefreshCw,
  Settings,
  DollarSign,
  ArrowUpDown,
  Receipt,
  Eye,
  EyeOff,
  MoreVertical,
  Copy,
  Archive,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountConfigs } from '@/hooks/useAccountConfigs';

export function CatalogoCuentasPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState('catalogo');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' o 'list'
  const [sortBy, setSortBy] = useState('code'); // 'code', 'name', 'type'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'

  // Hooks del backend
  const { 
    accounts, 
    flatAccounts, 
    loading: accountsLoading, 
    error: accountsError,
    createAccount,
    updateAccount,
    deleteAccount
  } = useAccounts();

  const {
    configs: accountConfigs,
    loading: configsLoading,
    error: configsError,
    updateAllConfigs
  } = useAccountConfigs();

  // Configuraciones contables por defecto (fallback)
  const defaultConfigs = {
    ventas: {
      ingresos: { id: '411', code: '411', name: 'Ventas', type: 'ingreso' },
      devoluciones: { id: '412', code: '412', name: 'Devoluciones en Ventas', type: 'gasto' }
    },
    compras: {
      gastos: { id: '511', code: '511', name: 'Compras', type: 'gasto' },
      devoluciones: { id: '512', code: '512', name: 'Devoluciones en Compras', type: 'ingreso' }
    },
    bancos: {
      efectivo: { id: '1111', code: '1111', name: 'Caja', type: 'activo' },
      bancos: { id: '1112', code: '1112', name: 'Bancos', type: 'activo' }
    },
    clientes: {
      cuentasPorCobrar: { id: '1121', code: '1121', name: 'Clientes', type: 'activo' }
    },
    proveedores: {
      cuentasPorPagar: { id: '2111', code: '2111', name: 'Proveedores', type: 'pasivo' }
    }
  };

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'activo',
    parentId: null
  });

  const accountTypes = [
    { value: 'activo', label: 'Activo', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { value: 'pasivo', label: 'Pasivo', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 'patrimonio', label: 'Patrimonio', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 'ingreso', label: 'Ingreso', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { value: 'gasto', label: 'Gasto', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
  ];

  const getTypeConfig = (type) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  const getTypeColor = (type) => {
    return getTypeConfig(type).color;
  };

  const getTypeLabel = (type) => {
    return getTypeConfig(type).label;
  };

  // Usar las cuentas planas del hook
  const allAccountsFlat = flatAccounts;

  const toggleExpanded = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const expandAll = () => {
    const allAccountIds = new Set();
    const collectIds = (accounts) => {
      accounts.forEach(account => {
        if (account.children && account.children.length > 0) {
          allAccountIds.add(account.id);
          collectIds(account.children);
        }
      });
    };
    collectIds(filteredAccounts);
    setExpandedAccounts(allAccountIds);
  };

  const collapseAll = () => {
    setExpandedAccounts(new Set());
  };

  const renderAccount = (account, level = 0) => {
    const isExpanded = expandedAccounts.has(account.id);
    const hasChildren = account.children && account.children.length > 0;
    const indentPx = level * 32;
    const isRoot = level === 0;
    const typeConfig = getTypeConfig(account.type);

    return (
      <div key={account.id} className="relative group">
        {/* Líneas conectoras */}
        {level > 0 && (
          <>
            <div 
              className="absolute left-0 top-0 w-0.5 bg-gray-300"
              style={{ 
                left: `${indentPx - 16}px`,
                height: '100%'
              }}
            />
            <div 
              className="absolute top-8 w-4 h-0.5 bg-gray-300"
              style={{ left: `${indentPx - 16}px` }}
            />
          </>
        )}

        <div 
          className={`relative border-b border-gray-100 transition-all duration-200 ${
            isRoot 
              ? `${typeConfig.bgColor} ${typeConfig.borderColor} border-l-4` 
              : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${indentPx}px` }}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4 flex-1">
              {/* Botón expandir/colapsar con símbolo + */}
              <div className="flex-shrink-0">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(account.id)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isExpanded 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200 border-2 border-green-200'
                    }`}
                    title={isExpanded ? 'Colapsar subcuentas' : 'Expandir subcuentas'}
                  >
                    {isExpanded ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  </div>
                )}
              </div>

              {/* Contenido principal de la cuenta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-4">
                  {/* Código de la cuenta */}
                  <div className="flex-shrink-0">
                    <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                      isRoot 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {account.code}
                    </span>
                  </div>
                  
                  {/* Nombre de la cuenta */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-gray-900 truncate ${
                      isRoot ? 'text-lg' : 'text-base'
                    }`}>
                      {account.name}
                    </h4>
                    
                    {/* Información adicional para cuentas raíz */}
                    {isRoot && hasChildren && (
                      <p className="text-sm text-gray-500 mt-1">
                        {account.children.length} subcuenta{account.children.length !== 1 ? 's' : ''} • 
                        Nivel {level + 1}
                      </p>
                    )}
                  </div>

                  {/* Badge de tipo */}
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      typeConfig.bgColor.replace('50', '100')
                    } ${typeConfig.color.replace('600', '800')}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        typeConfig.bgColor.replace('50', '200')
                      }`} />
                      {getTypeLabel(account.type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(account)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                title="Editar cuenta"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(account)}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                title="Duplicar cuenta"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(account.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                title="Eliminar cuenta"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Indicador de expansión */}
          {hasChildren && (
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isExpanded 
                ? 'from-blue-400 to-blue-600' 
                : 'from-gray-200 to-gray-300'
            } transition-all duration-300`} />
          )}
        </div>
        
        {/* Contenedor de cuentas hijas */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {account.children.map((child, index) => (
              <div
                key={`child-${child.id}-${level + 1}-${index}`}
                className="transform transition-all duration-200 hover:translate-x-1"
              >
                {renderAccount(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm);
    const matchesFilter = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      parentId: account.parentId
    });
    setShowModal(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
      try {
        await deleteAccount(accountId);
        showSuccess('Cuenta eliminada correctamente');
      } catch (error) {
        showError('Error al eliminar la cuenta');
      }
    }
  };

  const handleDuplicate = (account) => {
    setFormData({
      code: account.code + '_copy',
      name: account.name + ' (Copia)',
      type: account.type,
      parentId: account.parentId
    });
    setEditingAccount(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        // Actualizar cuenta existente
        await updateAccount(editingAccount.id, formData);
        showSuccess('Cuenta actualizada correctamente');
      } else {
        // Crear nueva cuenta
        await createAccount(formData);
        showSuccess('Cuenta creada correctamente');
      }
      
      setShowModal(false);
      setEditingAccount(null);
      setFormData({ code: '', name: '', type: 'activo', parentId: null });
    } catch (error) {
      showError('Error al guardar la cuenta');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ code: '', name: '', type: 'activo', parentId: null });
  };

  const handleConfigChange = (category, field, accountId) => {
    const selectedAccount = allAccountsFlat.find(acc => acc.id === accountId);
    if (selectedAccount) {
      // Actualizar el estado local temporalmente
      const newConfigs = {
        ...accountConfigs,
        [category]: {
          ...accountConfigs[category],
          [field]: selectedAccount
        }
      };
      // Aquí podrías actualizar un estado local si quieres cambios inmediatos
    }
  };

  const saveConfigurations = async () => {
    try {
      await updateAllConfigs(accountConfigs);
      showSuccess('Configuraciones contables guardadas correctamente');
    } catch (error) {
      showError('Error al guardar las configuraciones');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Cuentas</h1>
        </div>
        <p className="text-gray-600">
          Gestión del plan de cuentas contables del sistema
        </p>
      </div>

      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catalogo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Catálogo de Cuentas
            </button>
            <button
              onClick={() => setActiveTab('configuraciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuraciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configuraciones Contables
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido del Catálogo de Cuentas */}
      {activeTab === 'catalogo' && (
        <>
      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar cuentas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="code">Código</option>
                <option value="name">Nombre</option>
                <option value="type">Tipo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
          
          {/* Botón nueva cuenta */}
          <div className="flex items-end">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de cuentas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Plan de Cuentas Contables
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAccounts.length} cuenta{filteredAccounts.length !== 1 ? 's' : ''} encontrada{filteredAccounts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Expandir Todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="text-gray-600 hover:text-gray-700"
              >
                <Minus className="w-4 h-4 mr-1" />
                Colapsar Todo
              </Button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAccounts.map(account => renderAccount(account))}
        </div>
      </div>

      {/* Modal para crear/editar cuenta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuenta Padre (Opcional)
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin cuenta padre (Cuenta raíz)</option>
                    {allAccountsFlat
                      .filter(acc => !editingAccount || acc.id !== editingAccount.id)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona una cuenta padre para crear una subcuenta
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={accountsLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {accountsLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingAccount ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Contenido de Configuraciones Contables */}
      {activeTab === 'configuraciones' && (
        <div className="space-y-6">
          {/* Descripción */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Configuraciones Contables
                </h3>
                <p className="text-sm text-blue-700">
                  Trabaja con las cuentas recomendadas o selecciona las que deseas usar en los registros contables de tus documentos y ajustes.
                </p>
              </div>
            </div>
          </div>

          {/* Configuración de Ventas */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ventas</h3>
                  <p className="text-sm text-gray-600">
                    Configurá la cuenta contable de ingresos por defecto para el registro de documentos de venta y devoluciones de tus clientes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingresos
                  </label>
                  <select
                    value={accountConfigs.ventas?.ingresos?.id || ''}
                    onChange={(e) => handleConfigChange('ventas', 'ingresos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'ingreso')
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar los ingresos por ventas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devoluciones en Ventas
                  </label>
                  <select
                    value={accountConfigs.ventas?.devoluciones?.id || ''}
                    onChange={(e) => handleConfigChange('ventas', 'devoluciones', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'gasto')
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar las devoluciones de ventas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Compras */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Receipt className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Compras</h3>
                  <p className="text-sm text-gray-600">
                    Configurá las cuentas contables por defecto para el registro de documentos de compra y devoluciones a proveedores.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gastos
                  </label>
                  <select
                    value={accountConfigs.compras?.gastos?.id || ''}
                    onChange={(e) => handleConfigChange('compras', 'gastos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'gasto')
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar los gastos por compras
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devoluciones en Compras
                  </label>
                  <select
                    value={accountConfigs.compras?.devoluciones?.id || ''}
                    onChange={(e) => handleConfigChange('compras', 'devoluciones', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'ingreso')
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar las devoluciones de compras
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Bancos */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ArrowUpDown className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bancos y Efectivo</h3>
                  <p className="text-sm text-gray-600">
                    Configurá las cuentas contables para el manejo de efectivo y transacciones bancarias.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Efectivo
                  </label>
                  <select
                    value={accountConfigs.bancos?.efectivo?.id || ''}
                    onChange={(e) => handleConfigChange('bancos', 'efectivo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'activo' && acc.name.toLowerCase().includes('caja'))
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar transacciones en efectivo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bancos
                  </label>
                  <select
                    value={accountConfigs.bancos?.bancos?.id || ''}
                    onChange={(e) => handleConfigChange('bancos', 'bancos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allAccountsFlat
                      .filter(acc => acc.type === 'activo' && acc.name.toLowerCase().includes('banco'))
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuenta para registrar transacciones bancarias
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end">
                <Button
                  onClick={saveConfigurations}
                  disabled={configsLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {configsLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar Configuraciones
                </Button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
