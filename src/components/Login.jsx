import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  User, 
  Lock, 
  Mail, 
  CheckCircle2,
  Loader2
} from 'lucide-react'

export function Login({ onForgotPassword }) {
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Log del estado del usuario
  useEffect(() => {
    console.log('🔍 Login component - Estado del usuario:', user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    console.log('📝 Enviando formulario de login...');
    setIsLoading(true)
    try {
      // Usar el hook de autenticación
      const result = await login({
        email: formData.username,
        password: formData.password
      });

      console.log('📡 Resultado del login:', result);

      if (result.success) {
        console.log('✅ Login exitoso, limpiando errores...');
        setErrors({});
        // El hook se encarga de establecer el usuario
        // React Router debería detectar el cambio y redirigir
      } else {
        console.log('❌ Login fallido:', result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('💥 Error de login:', error);
      setErrors({ general: 'Error inesperado durante el login' });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido a Innovadom</h1>
          <p className="text-gray-600">Sistema de gestión para productos de belleza</p>
        </div>

        {/* Formulario de Login */}
        <div className="card card-hover p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Ingrese su usuario"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.username}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Error General */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Botón de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary h-12 text-base font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Enlace Olvidé Contraseña */}
            <div className="text-center">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors duration-200"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-gray-500 text-sm">
            © 2024 Innovadom. Todos los derechos reservados.
          </p>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p>Debug: Usuario actual: {user ? user.name : 'No logueado'}</p>
            <p>Debug: Estado: {user ? 'Autenticado' : 'No autenticado'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
