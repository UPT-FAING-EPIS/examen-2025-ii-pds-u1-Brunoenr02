import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    rol: '',
    biografia: '',
    anosExperiencia: '',
    tarifaPorHora: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        ciudad: formData.ciudad || null,
        rol: formData.rol
      };

      if (formData.rol === 'Ninera') {
        submitData.biografia = formData.biografia || null;
        submitData.anosExperiencia = parseInt(formData.anosExperiencia) || 0;
        submitData.tarifaPorHora = parseFloat(formData.tarifaPorHora) || null;
      }

      await register(submitData);
      
      // Mostrar mensaje de éxito y redirigir al login
      alert('Registro exitoso. Por favor, inicia sesión con tus credenciales.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Registro
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="apellido"
              label="Apellido"
              value={formData.apellido}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="ciudad"
              label="Ciudad"
              value={formData.ciudad}
              onChange={handleChange}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rol</InputLabel>
              <Select
                name="rol"
                value={formData.rol}
                label="Rol"
                onChange={handleChange}
              >
                <MenuItem value="Familia">Familia</MenuItem>
                <MenuItem value="Ninera">Niñera</MenuItem>
              </Select>
            </FormControl>

            {formData.rol === 'Ninera' && (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  name="biografia"
                  label="Biografía"
                  multiline
                  rows={3}
                  value={formData.biografia}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="anosExperiencia"
                  label="Años de Experiencia"
                  type="number"
                  value={formData.anosExperiencia}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="tarifaPorHora"
                  label="Tarifa por Hora"
                  type="number"
                  step="0.01"
                  value={formData.tarifaPorHora}
                  onChange={handleChange}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            
            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;