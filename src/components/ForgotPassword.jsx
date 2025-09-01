import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useForgotPassword } from '@/hooks/useForgotPassword'
import { 
  BarChart3, 
  Mail, 
  CheckCircle2, 
  ChevronLeft,
  Loader2
} from 'lucide-react'

export function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const { isLoading, isSubmitted, error, sendResetEmail, resetState } = useForgotPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await sendResetEmail(email)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Correo Enviado</h1>
            <p className="text-gray-600">Revise su bandeja de entrada</p>
          </div>

          {/* Mensaje de Confirmación */}
          <div className="card card-hover p-8 animate-slide-up">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Instrucciones Enviadas
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>. 
                  Haga clic en el enlace para crear una nueva contraseña.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    resetState();
                    onBack();
                  }}
                  className="btn-secondary w-full"
                >
                  Volver al Login
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in">
            <p className="text-gray-500 text-sm">
              © 2024 Innovadom. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
          <p className="text-gray-600">Ingrese su correo para restablecer la contraseña</p>
        </div>

        {/* Formulario */}
        <div className="card card-hover p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field pl-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>
              )}
            </div>

            {/* Botón de Envío */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary h-12 text-base font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                'Enviar Instrucciones'
              )}
            </Button>

            {/* Enlace Volver */}
            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors duration-200"
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />
                Volver al Login
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
      </div>
    </div>
  )
}
