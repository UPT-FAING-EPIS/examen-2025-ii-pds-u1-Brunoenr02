import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        usuarioID: response.usuarioID,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        rol: response.rol
      }));
      
      setUser({
        usuarioID: response.usuarioID,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        rol: response.rol
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (registerData) => {
    try {
      const response = await authService.register(registerData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        usuarioID: response.usuarioID,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        rol: response.rol
      }));
      
      setUser({
        usuarioID: response.usuarioID,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        rol: response.rol
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};