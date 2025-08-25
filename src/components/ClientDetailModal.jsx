import { Button } from '@/components/ui/button';

export function ClientDetailModal({ 
  isOpen, 
  onClose, 
  client, 
  onEdit 
}) {
  if (!isOpen || !client) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    // Determinar el estado basado en isActive y otros campos si es necesario
    let status = isActive ? 'Activo' : 'Inactivo';
    
    // Si el cliente tiene un campo status específico, usarlo
    if (client.status) {
      status = client.status;
    }
    
    const statusColors = {
      'Activo': 'bg-green-100 text-green-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Inactivo': 'bg-gray-100 text-gray-800',
      'Bloqueado': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${statusColors[status] || statusColors['Inactivo']}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeLabels = {
      individual: 'Individual',
      empresa: 'Empresa',
      distribuidor: 'Distribuidor'
    };
    
    const typeColors = {
      individual: 'bg-blue-100 text-blue-800',
      empresa: 'bg-purple-100 text-purple-800',
      distribuidor: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-3 py-1 text-sm rounded-full ${typeColors[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle del Cliente
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header con información principal */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {client.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  {getStatusBadge(client.isActive)}
                  {getTypeBadge(client.type)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">📧</span>
                    <span className="text-gray-600">{client.email || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📱</span>
                    <span className="text-gray-600">{client.phone || 'No especificado'}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => onEdit(client)}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-200"
              >
                ✏️ Editar
              </Button>
            </div>
          </div>

          {/* Información de contacto y dirección */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📍 Dirección
              </h3>
              <div className="space-y-3">
                {client.address?.street && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Calle:</span>
                    <p className="text-gray-900">{client.address.street}</p>
                  </div>
                )}
                {client.address?.city && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ciudad:</span>
                    <p className="text-gray-900">{client.address.city}</p>
                  </div>
                )}
                {client.address?.state && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Provincia:</span>
                    <p className="text-gray-900">{client.address.state}</p>
                  </div>
                )}
                {client.address?.zipCode && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Código Postal:</span>
                    <p className="text-gray-900">{client.address.zipCode}</p>
                  </div>
                )}
                {client.address?.country && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">País:</span>
                    <p className="text-gray-900">{client.address.country}</p>
                  </div>
                )}
                {!client.address?.street && !client.address?.city && (
                  <p className="text-gray-500 italic">No se ha especificado dirección</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                👤 Persona de Contacto
              </h3>
              <div className="space-y-3">
                {client.contactPerson?.name && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nombre:</span>
                    <p className="text-gray-900">{client.contactPerson.name}</p>
                  </div>
                )}
                {client.contactPerson?.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                    <p className="text-gray-900">{client.contactPerson.phone}</p>
                  </div>
                )}
                {client.contactPerson?.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{client.contactPerson.email}</p>
                  </div>
                )}
                {!client.contactPerson?.name && !client.contactPerson?.phone && !client.contactPerson?.email && (
                  <p className="text-gray-500 italic">No se ha especificado persona de contacto</p>
                )}
              </div>
            </div>
          </div>

          {/* Información financiera */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💰 Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-4 hover:bg-blue-200 transition-all duration-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(client.creditLimit || 0)}
                  </div>
                  <div className="text-sm text-blue-600">Límite de Crédito</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-4 hover:bg-green-200 transition-all duration-200">
                  <div className="text-2xl font-bold text-green-600">
                    {client.paymentTerms || 30} días
                  </div>
                  <div className="text-sm text-green-600">Términos de Pago</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-4 hover:bg-purple-200 transition-all duration-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {client.taxId || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-600">RNC/ID Fiscal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {client.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📝 Notas
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          {/* Información del sistema */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              ⚙️ Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Creado:</span>
                <p className="text-gray-900">{formatDate(client.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Última actualización:</span>
                <p className="text-gray-900">{formatDate(client.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="transition-all duration-200 hover:bg-gray-50"
            >
              Cerrar
            </Button>
            <Button
              onClick={() => onEdit(client)}
              className="bg-purple-600 hover:bg-purple-700 transition-all duration-200"
            >
              ✏️ Editar Cliente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
