import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OfflinePage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sin conexión
            </h1>
            <p className="text-gray-600 mb-6">
              No se pudo conectar a internet. Verifica tu conexión y vuelve a intentar.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Reintentar</span>
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Ir al inicio</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Algunas funciones pueden estar disponibles sin conexión gracias al caché local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
