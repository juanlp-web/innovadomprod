import { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const TenantSelector = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar tenants disponibles para el usuario
  useEffect(() => {
    if (user) {
      loadUserTenants();
      
      // Cargar tenant seleccionado del localStorage
      const savedTenant = localStorage.getItem('selectedTenant');
      if (savedTenant) {
        try {
          const tenant = JSON.parse(savedTenant);
          setSelectedTenant(tenant);
        } catch (error) {
          console.error('Error parsing saved tenant:', error);
          localStorage.removeItem('selectedTenant');
        }
      }
    }
  }, [user]);

  const loadUserTenants = async () => {
    try {
      setLoading(true);
      
      // Si el usuario tiene tenantId, cargar ese tenant específico
      if (user.tenantId) {
        const response = await fetch('/api/tenants/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Tenant-ID': user.tenantId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const tenant = {
            id: data.data.tenant.id,
            name: data.data.tenant.companyName,
            subdomain: data.data.tenant.subdomain,
            plan: data.data.tenant.plan,
            status: data.data.tenant.status
          };
          setTenants([tenant]);
          
          // Auto-seleccionar si no hay uno seleccionado
          if (!selectedTenant) {
            selectTenant(tenant);
          }
        }
      } else {
        // Usuario super admin puede ver todos los tenants
        const response = await fetch('/api/tenants', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTenants(data.data.tenants.map(t => ({
            id: t._id,
            name: t.companyName,
            subdomain: t.subdomain,
            plan: t.plan,
            status: t.status
          })));
        }
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    localStorage.setItem('selectedTenant', tenant.subdomain);
    localStorage.setItem('selectedTenantData', JSON.stringify(tenant));
    setIsOpen(false);
    
    // Recargar la página para aplicar el nuevo contexto
    window.location.reload();
  };

  const clearTenant = () => {
    setSelectedTenant(null);
    localStorage.removeItem('selectedTenant');
    localStorage.removeItem('selectedTenantData');
    setIsOpen(false);
    window.location.reload();
  };

  // No mostrar selector si no hay tenants o si es usuario regular con un solo tenant
  if (!user || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 min-w-48"
      >
        <div className="flex items-center space-x-2 flex-1">
          <Building2 className="w-4 h-4 text-gray-500" />
          <div className="text-left">
            {selectedTenant ? (
              <div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedTenant.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedTenant.subdomain} • {selectedTenant.plan}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Seleccionar Empresa
                </div>
                <div className="text-xs text-gray-500">
                  Ninguna seleccionada
                </div>
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Cargando empresas...
            </div>
          ) : (
            <>
              {/* Opción para limpiar selección (solo super admin) */}
              {!user.tenantId && (
                <button
                  onClick={clearTenant}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">
                        Sistema Principal
                      </div>
                      <div className="text-xs text-gray-500">
                        Ver todas las empresas
                      </div>
                    </div>
                    {!selectedTenant && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                  </div>
                </button>
              )}

              {/* Lista de tenants */}
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => selectTenant(tenant)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {tenant.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tenant.subdomain} • {tenant.plan}
                        {tenant.status !== 'active' && (
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                            tenant.status === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                            tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {tenant.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTenant?.id === tenant.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}

              {/* Opción para crear nuevo tenant (solo super admin) */}
              {!user.tenantId && (
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Aquí puedes abrir un modal para crear nuevo tenant
                      console.log('Crear nuevo tenant');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-green-600">
                          Crear Nueva Empresa
                        </div>
                        <div className="text-xs text-gray-500">
                          Registrar nueva organización
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
