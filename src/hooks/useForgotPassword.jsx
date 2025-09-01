import { useState } from 'react';
import { authAPI } from '@/config/api';
import { toast } from 'react-hot-toast';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const sendResetEmail = async (email) => {
    if (!email.trim()) {
      setError('Por favor ingrese su correo electrónico');
      return false;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.data.success) {
        setIsSubmitted(true);
        toast.success('Correo de recuperación enviado exitosamente');
        return true;
      } else {
        setError(response.data.message || 'Error al enviar el correo');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el correo. Intente nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
      setError('Token y nueva contraseña son requeridos');
      return false;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      
      if (response.data.success) {
        toast.success('Contraseña restablecida exitosamente');
        return true;
      } else {
        setError(response.data.message || 'Error al restablecer la contraseña');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña. Intente nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsSubmitted(false);
    setError('');
  };

  return {
    isLoading,
    isSubmitted,
    error,
    sendResetEmail,
    resetPassword,
    resetState
  };
};
