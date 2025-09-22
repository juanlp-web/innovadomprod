import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';

export function ConfiguracionPage() {
  const { configs, loading, error, updateConfig, createConfig, fetchConfigs } = useConfig();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    iva_percentage: 0,
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    currency_symbol: '$',
    currency_code: 'USD'
  });

  const [saving, setSaving] = useState(false);

  // Cargar configuraciones cuando se monta el componente
  useEffect(() => {
    if (Object.keys(configs).length > 0) {
      setFormData(prev => ({
        ...prev,
        iva_percentage: configs.iva_percentage || 0,
        company_name: configs.company_name || '',
        company_address: configs.company_address || '',
        company_phone: configs.company_phone || '',
        company_email: configs.company_email || '',
        currency_symbol: configs.currency_symbol || '$',
        currency_code: configs.currency_code || 'USD'
      }));
    }
  }, [configs]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    let newValue = value;
    if (type === 'number') {
      if (value === '') {
        newValue = '';
      } else {
        const parsed = parseFloat(value);
        newValue = isNaN(parsed) ? '' : parsed;
      }
    }
    
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      
      // Guardar cada configuración
      const configsToSave = [
        { key: 'iva_percentage', value: formData.iva_percentage === '' ? 0 : formData.iva_percentage, type: 'number', description: 'Porcentaje de IVA aplicado a las ventas' },
        { key: 'company_name', value: formData.company_name, type: 'string', description: 'Nombre de la empresa' },
        { key: 'company_address', value: formData.company_address, type: 'string', description: 'Dirección de la empresa' },
        { key: 'company_phone', value: formData.company_phone, type: 'string', description: 'Teléfono de la empresa' },
        { key: 'company_email', value: formData.company_email, type: 'string', description: 'Email de la empresa' },
        { key: 'currency_symbol', value: formData.currency_symbol, type: 'string', description: 'Símbolo de moneda' },
        { key: 'currency_code', value: formData.currency_code, type: 'string', description: 'Código de moneda' }
      ];

      for (const config of configsToSave) {
        if (configs[config.key] !== undefined) {
          await updateConfig(config.key, config.value, config.type, config.description);
        } else {
          await createConfig(config.key, config.value, config.type, config.description);
        }
      }

      showSuccess('Configuraciones guardadas correctamente');
    } catch (err) {
      showError('Error al guardar las configuraciones');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuraciones...</p>
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
            <Settings className="w-6 h-6 text-blue-600" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la configuración general del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración Fiscal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuración Fiscal</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de IVA (%)
              </label>
              <input
                type="number"
                name="iva_percentage"
                value={formData.iva_percentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full input-field"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Porcentaje de IVA que se aplicará a todas las ventas
              </p>
            </div>
          </div>
        </div>

        {/* Información de la Empresa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Información de la Empresa</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full input-field"
                placeholder="Innovadomprod"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                rows="3"
                className="w-full input-field"
                placeholder="Dirección completa de la empresa"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="empresa@ejemplo.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Moneda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuración de Moneda</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  name="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="$"
                  maxLength="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Moneda
                </label>
                <input
                  type="text"
                  name="currency_code"
                  value={formData.currency_code}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="USD"
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Configuración Actual */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resumen Actual</h2>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">IVA:</span>
              <span className="font-medium">{formData.iva_percentage === '' ? '0' : formData.iva_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empresa:</span>
              <span className="font-medium">{formData.company_name || 'No configurado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Moneda:</span>
              <span className="font-medium">{formData.currency_symbol} ({formData.currency_code})</span>
            </div>
          </div>
        </div>
      </div>



      <ToastContainer />
    </div>
  );
}
