import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Verificar si hay token y usuario en localStorage
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Intentar usar el usuario almacenado primero
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Luego verificar con el servidor en segundo plano
          try {
            const response = await authAPI.getProfile();
            if (response.data && response.data.success) {
              setUser(response.data.data);
            }
          } catch (profileError) {
            // Si falla el profile, pero tenemos datos locales válidos, mantener sesión
            console.warn('Error al verificar perfil, manteniendo sesión local:', profileError);
            
            // Solo hacer logout si el error indica token completamente inválido
            if (profileError.response?.status === 401) {
              logout();
            }
          }
        } catch (parseError) {
          console.error('Error al parsear usuario almacenado:', parseError);
          logout();
        }
      } else if (token && !storedUser) {
        // Hay token pero no usuario, intentar obtener perfil
        try {
          const response = await authAPI.getProfile();
          if (response.data && response.data.success) {
            const userData = response.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Verificar que la respuesta sea exitosa
      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el login'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el login'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Verificar que la respuesta sea exitosa
      if (response.data.success) {
        const { token: newToken, ...userInfo } = response.data.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setToken(newToken);
        setUser(userInfo);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el registro'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedTenant');
    setToken(null);
    setUser(null);
    
    // Forzar redirección a login
    window.location.href = '/login';
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Verificar que la respuesta sea exitosa
      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar perfil'
        };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil'
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar contraseña'
      };
    }
  };

  const refreshSession = async () => {
    try {
      // Verificar si tenemos un token antes de intentar refrescar
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        return { success: false, message: 'No hay token para refrescar' };
      }

      // Intentar obtener el perfil actualizado (esto valida el token)
      const response = await authAPI.getProfile();
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        
        // Actualizar datos del usuario en localStorage y estado
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Actualizar timestamp de última actividad
        localStorage.setItem('lastActivity', Date.now().toString());
        
        console.log('Sesión refrescada exitosamente');
        return { success: true };
      } else {
        console.warn('Respuesta inválida al refrescar sesión');
        return {
          success: false,
          message: 'Respuesta inválida del servidor'
        };
      }
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      
      // Solo hacer logout si es un error 401 (token inválido)
      if (error.response?.status === 401) {
        console.warn('Token inválido, cerrando sesión');
        logout();
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al refrescar sesión'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshSession,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
