import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardFamilia from './pages/DashboardFamilia';
import DashboardNinera from './pages/DashboardNinera';
import MisReservas from './pages/MisReservas';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para redirigir usuarios autenticados
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    if (user.rol === 'Familia') {
      return <Navigate to="/dashboard-familia" replace />;
    } else {
      return <Navigate to="/dashboard-ninera" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Rutas protegidas */}
            <Route 
              path="/dashboard-familia" 
              element={
                <ProtectedRoute roles={['Familia']}>
                  <DashboardFamilia />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-ninera" 
              element={
                <ProtectedRoute roles={['Ninera']}>
                  <DashboardNinera />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mis-reservas" 
              element={
                <ProtectedRoute>
                  <MisReservas />
                </ProtectedRoute>
              } 
            />

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
