import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Alert,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { bookingsService, nanniesService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DashboardNinera = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [nineraData, setNineraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    ciudad: '',
    biografia: '',
    anosExperiencia: 0,
    tarifaPorHora: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar reservas de niñera usando el endpoint existente
      const reservasResult = await bookingsService.getUserBookings(user.usuarioID);
      setBookings(reservasResult);

      // Buscar y cargar datos de la niñera actual
      const nanniesResult = await nanniesService.getNannies();
      const myNineraData = nanniesResult.find(n => n.usuarioID === user.usuarioID);
      if (myNineraData) {
        setNineraData(myNineraData);
        setProfileData({
          nombre: myNineraData.nombre,
          apellido: myNineraData.apellido,
          telefono: myNineraData.telefono || '',
          ciudad: myNineraData.ciudad || '',
          biografia: myNineraData.biografia || '',
          anosExperiencia: myNineraData.anosExperiencia || 0,
          tarifaPorHora: myNineraData.tarifaPorHora || 0
        });
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando datos: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'warning';
      case 'Confirmada': return 'success';
      case 'Completada': return 'info';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      
      const updateData = {
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        telefono: profileData.telefono,
        ciudad: profileData.ciudad,
        biografia: profileData.biografia,
        anosExperiencia: profileData.anosExperiencia,
        tarifaPorHora: profileData.tarifaPorHora
      };

      await nanniesService.updateProfile(nineraData.nineraID, updateData);
      setSuccess('Perfil actualizado correctamente');
      setEditingProfile(false);
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('Error al actualizar perfil: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard Niñera - {user?.nombre}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Mis Reservas" />
            <Tab label="Mi Perfil" />
          </Tabs>
        </Box>

        {/* Tab 1: Mis Reservas */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Mis Reservas
          </Typography>
          
          {bookings.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="textSecondary" align="center">
                  No tienes reservas aún
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking.reservaID}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6">
                          Reserva #{booking.reservaID}
                        </Typography>
                        <Chip 
                          label={booking.estado} 
                          color={getStatusColor(booking.estado)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Familia:</strong> {booking.familiaNombre} {booking.familiaApellido}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Teléfono:</strong> {booking.familiaTelefono}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Inicio:</strong> {formatDateTime(booking.inicioServicio)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Fin:</strong> {formatDateTime(booking.finServicio)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Costo Total:</strong> ${booking.costoTotal}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Fecha de reserva:</strong> {formatDate(booking.fechaCreacion)}
                      </Typography>
                      
                      {booking.notasParaNinera && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Notas:</strong> {booking.notasParaNinera}
                        </Typography>
                      )}

                      {booking.resena && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Reseña ({booking.resena.calificacion}/5 ⭐)
                          </Typography>
                          <Typography variant="body2">
                            {booking.resena.comentario}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab 2: Mi Perfil */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Mi Perfil
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setEditingProfile(true)}
            >
              Editar Perfil
            </Button>
          </Box>

          {nineraData && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Información Personal
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Nombre:</strong> {nineraData.nombre} {nineraData.apellido}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Teléfono:</strong> {nineraData.telefono || 'No especificado'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Ciudad:</strong> {nineraData.ciudad || 'No especificada'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Información Profesional
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Experiencia:</strong> {nineraData.anosExperiencia} años
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tarifa:</strong> ${nineraData.tarifaPorHora}/hora
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Calificación:</strong> {nineraData.calificacionPromedio || 'Sin calificaciones'}/5 ⭐
                    </Typography>
                  </Grid>
                  {nineraData.biografia && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Biografía
                      </Typography>
                      <Typography variant="body1">
                        {nineraData.biografia}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Dialog Editar Perfil */}
        <Dialog open={editingProfile} onClose={() => setEditingProfile(false)} maxWidth="md" fullWidth>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={profileData.nombre}
                  onChange={(e) => handleProfileChange('nombre', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={profileData.apellido}
                  onChange={(e) => handleProfileChange('apellido', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={profileData.telefono}
                  onChange={(e) => handleProfileChange('telefono', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={profileData.ciudad}
                  onChange={(e) => handleProfileChange('ciudad', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Años de Experiencia"
                  value={profileData.anosExperiencia}
                  onChange={(e) => handleProfileChange('anosExperiencia', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Tarifa por Hora"
                  value={profileData.tarifaPorHora}
                  onChange={(e) => handleProfileChange('tarifaPorHora', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Biografía"
                  value={profileData.biografia}
                  onChange={(e) => handleProfileChange('biografia', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingProfile(false)}>Cancelar</Button>
            <Button onClick={saveProfile} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default DashboardNinera;