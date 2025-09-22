import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  UserPlus,
  UserMinus,
  BarChart3,
  Settings,
  Shield,
  Building,
  Database,
  Zap,
  Palette,
  X,
  User,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { useAdmin } from '@/hooks/useAdmin';
import { adminAPI } from '@/services/api';

export function AdminPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  const {
    tenants,
    usersWithoutTenant,
    stats,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    fetchUsersWithoutTenant,
    assignTenantToUser,
    removeTenantFromUser,
    fetchStats,
    loading,
    error
  } = useAdmin();

  // Formulario de usuario
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });

  // Formulario de tenant
  const [tenantForm, setTenantForm] = useState({
    name: '',
    subdomain: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: {
      street: '',
      city: '',
      state: '',
      country: 'República Dominicana',
      zipCode: ''
    },
    database: {
      connectionString: '',
      databaseName: '',
      isShared: true
    },
    plan: 'free',
    limits: {
      maxUsers: 10,
      maxProducts: 1000,
      maxClients: 500,
      maxSuppliers: 100,
      maxStorageGB: 1,
      maxApiCallsPerMonth: 1000
    },
    features: {
      inventory: true,
      recipes: true,
      sales: true,
      purchases: true,
      reports: false,
      api: false,
      customBranding: false
    },
    status: 'trial',
    customization: {
      primaryColor: '#3B82F6'
    },
    adminUserId: ''
  });

  // Función para obtener todos los usuarios
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Agregar header de tenant si está disponible
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/users/all', {
        method: 'GET',
        headers
      });
      
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAllUsers(data.data);
      } else {
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'tenants') {
      fetchTenants();
    } else if (activeTab === 'users') {
      fetchUsersWithoutTenant();
      // Llamar fetchAllUsers con un pequeño delay para asegurar que se ejecute
      setTimeout(() => {
        fetchAllUsers();
      }, 100);
    }
  }, [activeTab, fetchStats, fetchTenants, fetchUsersWithoutTenant]);

  // Debug: Log allUsers state changes
  useEffect(() => {
  }, [allUsers]);

  // Generar automáticamente el nombre de la base de datos cuando cambie el subdominio
  useEffect(() => {
    if (tenantForm.subdomain && !tenantForm.database?.databaseName) {
      const cleanSubdomain = tenantForm.subdomain.replace(/[^a-zA-Z0-9]/g, '_');
      setTenantForm(prev => ({
        ...prev,
        database: {
          ...prev.database,
          databaseName: `tenant_${cleanSubdomain}_${Date.now()}`
        }
      }));
    }
  }, [tenantForm.subdomain]);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos antes de enviar
      if (!tenantForm.database?.connectionString || tenantForm.database.connectionString.trim() === '') {
        showError('La cadena de conexión de base de datos es requerida');
        return;
      }
      
      if (!tenantForm.database?.databaseName || tenantForm.database.databaseName.trim() === '') {
        showError('El nombre de la base de datos es requerido');
        return;
      }

      // Preparar datos para envío, limpiando campos vacíos y validando requeridos
      const tenantData = {
        ...tenantForm,
        // Asegurar que database tenga valores válidos
        database: {
          connectionString: tenantForm.database.connectionString.trim(),
          databaseName: tenantForm.database.databaseName.trim(),
          isShared: tenantForm.database?.isShared ?? true
        }
      };
      
      // Solo agregar adminUser si tiene un valor válido (no vacío)
      if (tenantForm.adminUserId && tenantForm.adminUserId.trim() !== '') {
        tenantData.adminUser = tenantForm.adminUserId;
      }
      
      // Remover adminUserId del objeto original
      delete tenantData.adminUserId;
      
      
      await createTenant(tenantData);
      setShowTenantModal(false);
      setTenantForm({
        name: '',
        subdomain: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: {
          street: '',
          city: '',
          state: '',
          country: 'República Dominicana',
          zipCode: ''
        },
        database: {
          connectionString: '',
          databaseName: '',
          isShared: true
        },
        plan: 'free',
        limits: {
          maxUsers: 10,
          maxProducts: 1000,
          maxClients: 500,
          maxSuppliers: 100,
          maxStorageGB: 1,
          maxApiCallsPerMonth: 1000
        },
        features: {
          inventory: true,
          recipes: true,
          sales: true,
          purchases: true,
          reports: false,
          api: false,
          customBranding: false
        },
        status: 'trial',
        customization: {
          primaryColor: '#3B82F6'
        },
        adminUserId: ''
      });
      showSuccess('Tenant creado correctamente');
    } catch (err) {
      showError(err.message || 'Error al crear tenant');
    }
  };

  const handleCreateUser = async () => {
    try {
      const userData = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        isActive: userForm.isActive
      };
      
      await adminAPI.createUser(userData);
      showSuccess('Usuario creado exitosamente');
      setUserForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      });
      setShowUserModal(false);
    } catch (error) {
      showError('Error al crear usuario: ' + (error.response?.data?.message || 'Error desconocido'));
    }
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos antes de enviar
      if (!tenantForm.database?.connectionString || tenantForm.database.connectionString.trim() === '') {
        showError('La cadena de conexión de base de datos es requerida');
        return;
      }
      
      if (!tenantForm.database?.databaseName || tenantForm.database.databaseName.trim() === '') {
        showError('El nombre de la base de datos es requerido');
        return;
      }

      // Preparar datos para envío, limpiando campos vacíos y validando requeridos
      const tenantData = {
        ...tenantForm,
        // Asegurar que database tenga valores válidos
        database: {
          connectionString: tenantForm.database.connectionString.trim(),
          databaseName: tenantForm.database.databaseName.trim(),
          isShared: tenantForm.database?.isShared ?? true
        }
      };
      
      // Solo agregar adminUser si tiene un valor válido (no vacío)
      if (tenantForm.adminUserId && tenantForm.adminUserId.trim() !== '') {
        tenantData.adminUser = tenantForm.adminUserId;
      }
      
      // Remover adminUserId del objeto original
      delete tenantData.adminUserId;
      
      
      await updateTenant(editingTenant._id, tenantData);
      setShowTenantModal(false);
      setEditingTenant(null);
      setTenantForm({
        name: '',
        subdomain: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: {
          street: '',
          city: '',
          state: '',
          country: 'República Dominicana',
          zipCode: ''
        },
        database: {
          connectionString: '',
          databaseName: '',
          isShared: true
        },
        plan: 'free',
        limits: {
          maxUsers: 10,
          maxProducts: 1000,
          maxClients: 500,
          maxSuppliers: 100,
          maxStorageGB: 1,
          maxApiCallsPerMonth: 1000
        },
        features: {
          inventory: true,
          recipes: true,
          sales: true,
          purchases: true,
          reports: false,
          api: false,
          customBranding: false
        },
        status: 'trial',
        customization: {
          primaryColor: '#3B82F6'
        },
        adminUserId: ''
      });
      showSuccess('Tenant actualizado correctamente');
    } catch (err) {
      showError(err.message || 'Error al actualizar tenant');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tenant?')) {
      try {
        await deleteTenant(tenantId);
        showSuccess('Tenant eliminado correctamente');
      } catch (err) {
        showError(err.message || 'Error al eliminar tenant');
      }
    }
  };

  const handleAssignTenant = async (userId, tenantId, tenantRole = 'user') => {
    try {
      await assignTenantToUser(userId, tenantId, tenantRole);
      showSuccess('Tenant asignado correctamente');
    } catch (err) {
      showError(err.message || 'Error al asignar tenant');
    }
  };

  const handleRemoveTenant = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres remover el tenant de este usuario?')) {
      try {
        await removeTenantFromUser(userId);
        showSuccess('Tenant removido correctamente');
      } catch (err) {
        showError(err.message || 'Error al remover tenant');
      }
    }
  };

  const openEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setTenantForm({
      name: tenant.name || '',
      subdomain: tenant.subdomain || '',
      companyName: tenant.companyName || '',
      companyEmail: tenant.companyEmail || '',
      companyPhone: tenant.companyPhone || '',
      companyAddress: {
        street: tenant.companyAddress?.street || '',
        city: tenant.companyAddress?.city || '',
        state: tenant.companyAddress?.state || '',
        country: tenant.companyAddress?.country || 'República Dominicana',
        zipCode: tenant.companyAddress?.zipCode || ''
      },
      database: {
        connectionString: tenant.database?.connectionString || '',
        databaseName: tenant.database?.databaseName || '',
        isShared: tenant.database?.isShared ?? true
      },
      plan: tenant.plan || 'free',
      limits: {
        maxUsers: tenant.limits?.maxUsers || 10,
        maxProducts: tenant.limits?.maxProducts || 1000,
        maxClients: tenant.limits?.maxClients || 500,
        maxSuppliers: tenant.limits?.maxSuppliers || 100,
        maxStorageGB: tenant.limits?.maxStorageGB || 1,
        maxApiCallsPerMonth: tenant.limits?.maxApiCallsPerMonth || 1000
      },
      features: {
        inventory: tenant.features?.inventory ?? true,
        recipes: tenant.features?.recipes ?? true,
        sales: tenant.features?.sales ?? true,
        purchases: tenant.features?.purchases ?? true,
        reports: tenant.features?.reports ?? false,
        api: tenant.features?.api ?? false,
        customBranding: tenant.features?.customBranding ?? false
      },
      status: tenant.status || 'trial',
      customization: {
        primaryColor: tenant.customization?.primaryColor || '#3B82F6'
      },
      adminUserId: tenant.adminUser?._id || ''
    });
    setShowTenantModal(true);
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.tenantId && (user.tenantId.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      user.tenantId.companyName?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">Gestiona tenants y asigna usuarios a organizaciones</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tenants.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tenants Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tenants.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Tenant</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.withoutTenant}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tenants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-2" />
              Gestión de Tenants
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Asignación de Usuarios
            </button>
          </nav>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'tenants' ? 'tenants' : 'usuarios'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contenido de Tenants */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Tenants</h2>
            <Button
              onClick={() => {
                setEditingTenant(null);
                setTenantForm({
                  name: '',
                  subdomain: '',
                  companyName: '',
                  companyEmail: '',
                  companyPhone: '',
                  plan: 'basic',
                  status: 'active',
                  adminUserId: ''
                });
                setShowTenantModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Tenant
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subdominio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.subdomain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
                        tenant.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tenant.adminUser ? tenant.adminUser.username : 'Sin asignar'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditTenant(tenant)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido de Usuarios */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios y Tenants</h2>
              <p className="text-sm text-gray-600 mt-1">Administra la asignación de usuarios a tenants</p>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay usuarios disponibles</p>
                        <p className="text-sm">Los usuarios se cargarán automáticamente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` 
                                  : user.username?.charAt(0) || user.email?.charAt(0) || 'U'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.username || 'Sin nombre'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.tenantId ? (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              {user.tenantId.companyName || user.tenantId.name || 'Tenant Asignado'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <X className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700 font-medium">Sin Tenant</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.tenantId ? (
                            <button
                              onClick={() => handleRemoveTenantFromUser(user._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Remover Tenant"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openAssignModal(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Asignar Tenant"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Tenant */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {editingTenant ? 'Editar Tenant' : 'Crear Nuevo Tenant'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {editingTenant ? 'Modifica la información del tenant' : 'Configura un nuevo tenant para tu sistema'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
              <form onSubmit={editingTenant ? handleUpdateTenant : handleCreateTenant}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información Básica */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-500 text-white rounded-lg">
                        <Building className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Información Básica</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Tenant</label>
                        <input
                          type="text"
                          value={tenantForm.name}
                          onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="Ingresa el nombre del tenant"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subdominio</label>
                        <input
                          type="text"
                          value={tenantForm.subdomain}
                          onChange={(e) => setTenantForm({...tenantForm, subdomain: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="ejemplo.innovadomprod.com"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                          <select
                            value={tenantForm.plan}
                            onChange={(e) => setTenantForm({...tenantForm, plan: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                        <option value="free">🆓 Gratuito</option>
                        <option value="basic">⭐ Básico</option>
                        <option value="premium">💎 Premium</option>
                        <option value="enterprise">🏢 Enterprise</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                          <select
                            value={tenantForm.status}
                            onChange={(e) => setTenantForm({...tenantForm, status: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="trial">🔄 Trial</option>
                            <option value="active">✅ Activo</option>
                            <option value="inactive">⏸️ Inactivo</option>
                            <option value="suspended">🚫 Suspendido</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Empresa */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-green-500 text-white rounded-lg">
                        <Building className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Información de Empresa</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Nombre de Empresa</label>
                        <input
                          type="text"
                          value={tenantForm.companyName}
                          onChange={(e) => setTenantForm({...tenantForm, companyName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="Nombre de la empresa"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                          <input
                            type="email"
                            value={tenantForm.companyEmail}
                            onChange={(e) => setTenantForm({...tenantForm, companyEmail: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="empresa@ejemplo.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">📞 Teléfono</label>
                          <input
                            type="text"
                            value={tenantForm.companyPhone}
                            onChange={(e) => setTenantForm({...tenantForm, companyPhone: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="+1 (809) 000-0000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Dirección</label>
                        <input
                          type="text"
                          value={tenantForm.companyAddress?.street || ''}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            companyAddress: {...(tenantForm.companyAddress || {}), street: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="Calle, número, sector"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">🏙️ Ciudad</label>
                          <input
                            type="text"
                            value={tenantForm.companyAddress?.city || ''}
                            onChange={(e) => setTenantForm({
                              ...tenantForm, 
                              companyAddress: {...(tenantForm.companyAddress || {}), city: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Santo Domingo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">🗺️ Estado</label>
                          <input
                            type="text"
                            value={tenantForm.companyAddress?.state || ''}
                            onChange={(e) => setTenantForm({
                              ...tenantForm, 
                              companyAddress: {...(tenantForm.companyAddress || {}), state: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Distrito Nacional"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">📮 Código Postal</label>
                          <input
                            type="text"
                            value={tenantForm.companyAddress?.zipCode || ''}
                            onChange={(e) => setTenantForm({
                              ...tenantForm, 
                              companyAddress: {...(tenantForm.companyAddress || {}), zipCode: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="10000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 País</label>
                        <input
                          type="text"
                          value={tenantForm.companyAddress?.country || ''}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            companyAddress: {...(tenantForm.companyAddress || {}), country: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="República Dominicana"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuración de Base de Datos */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-purple-500 text-white rounded-lg">
                        <Database className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Base de Datos</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🔗 Connection String</label>
                        <input
                          type="text"
                          value={tenantForm.database?.connectionString || ''}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            database: {...(tenantForm.database || {}), connectionString: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white font-mono text-sm"
                          placeholder="mongodb+srv://user:pass@cluster.mongodb.net/db"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🗄️ Nombre de Base de Datos</label>
                        <input
                          type="text"
                          value={tenantForm.database?.databaseName || ''}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            database: {...(tenantForm.database || {}), databaseName: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="nombre_base_datos"
                          required
                        />
                      </div>
                      <div className="flex items-center p-4 bg-purple-100 rounded-lg">
                        <input
                          type="checkbox"
                          checked={tenantForm.database?.isShared || false}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            database: {...(tenantForm.database || {}), isShared: e.target.checked}
                          })}
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 block text-sm font-semibold text-gray-700">Base de datos compartida</label>
                      </div>
                    </div>
                  </div>

                  {/* Límites */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-orange-500 text-white rounded-lg">
                        <Settings className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Límites del Sistema</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Max Usuarios</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxUsers || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxUsers: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">📦 Max Productos</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxProducts || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxProducts: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Max Clientes</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxClients || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxClients: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Max Proveedores</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxSuppliers || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxSuppliers: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">💾 Max Almacenamiento (GB)</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxStorageGB || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxStorageGB: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🔌 Max API Calls/Mes</label>
                        <input
                          type="number"
                          value={tenantForm.limits?.maxApiCallsPerMonth || 0}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            limits: {...(tenantForm.limits || {}), maxApiCallsPerMonth: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-indigo-500 text-white rounded-lg">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Características Habilitadas</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(tenantForm.features || {}).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setTenantForm({
                              ...tenantForm, 
                              features: {...(tenantForm.features || {}), [feature]: e.target.checked}
                            })}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 block text-sm font-semibold text-gray-700 capitalize cursor-pointer">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personalización */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-pink-500 text-white rounded-lg">
                        <Palette className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Personalización</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🎨 Color Primario</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={tenantForm.customization?.primaryColor || '#3B82F6'}
                          onChange={(e) => setTenantForm({
                            ...tenantForm, 
                            customization: {...(tenantForm.customization || {}), primaryColor: e.target.value}
                          })}
                          className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={tenantForm.customization?.primaryColor || '#3B82F6'}
                            onChange={(e) => setTenantForm({
                              ...tenantForm, 
                              customization: {...(tenantForm.customization || {}), primaryColor: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white font-mono"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTenantModal(false)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    {editingTenant ? (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Actualizar Tenant</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Crear Tenant</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Crear Nuevo Usuario</h3>
                    <p className="text-green-100 text-sm">Configura un nuevo usuario para el sistema</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-6">
                {/* Información Personal */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Información Personal</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Nombre</label>
                      <input
                        type="text"
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Nombre del usuario"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Apellido</label>
                      <input
                        type="text"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Apellido del usuario"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Acceso */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-500 text-white rounded-lg">
                      <Key className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Información de Acceso</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Username</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Nombre de usuario único"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Password Temporal</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Password temporal (mínimo 6 caracteres)"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Configuración */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                      <Settings className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Configuración</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🎭 Rol</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                      >
                        <option value="user">Usuario</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={userForm.isActive}
                        onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-3 block text-sm font-semibold text-gray-700">
                        Usuario Activo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center shadow-lg"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Asignar Tenant a Usuario
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Asignando tenant a: <strong>{selectedUser.username}</strong>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seleccionar Tenant</label>
                  <select
                    onChange={(e) => {
                      const tenantId = e.target.value;
                      const tenantRole = 'user';
                      if (tenantId) {
                        handleAssignTenant(selectedUser._id, tenantId, tenantRole);
                        setShowAssignModal(false);
                        setSelectedUser(null);
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar tenant...</option>
                    {tenants.map((tenant) => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.name} ({tenant.subdomain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
