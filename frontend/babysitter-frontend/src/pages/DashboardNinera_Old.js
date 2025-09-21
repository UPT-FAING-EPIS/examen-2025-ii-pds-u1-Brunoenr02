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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { ExitToApp, Add, Edit, Delete } from '@mui/icons-material';
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

  // Estados para disponibilidad
  const [editingDisponibilidad, setEditingDisponibilidad] = useState(false);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [newDisponibilidad, setNewDisponibilidad] = useState({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '17:00'
  });

  const diasSemana = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, nineraInfo] = await Promise.all([
        bookingsService.getUserBookings(user.usuarioID),
        nanniesService.getNannies() // Buscar la niñera del usuario logueado
      ]);
      
      setBookings(bookingsData);
      
      // Encontrar la niñera que corresponde al usuario logueado
      const myNineraData = nineraInfo.find(n => n.usuarioID === user.usuarioID);
      if (myNineraData) {
        setNineraData(myNineraData);
        setProfileData({
          nombre: myNineraData.nombre,
          apellido: myNineraData.apellido,
          telefono: myNineraData.telefono || '',
          ciudad: myNineraData.ciudad || '',
          biografia: myNineraData.biografia || '',
          anosExperiencia: myNineraData.anosExperiencia,
          tarifaPorHora: myNineraData.tarifaPorHora
        });
        setDisponibilidades(myNineraData.disponibilidades || []);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Error cargando datos');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const saveProfile = async () => {
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/nannies/${nineraData.nineraID}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setSuccess('Perfil actualizado correctamente');
        setEditingProfile(false);
        loadData(); // Recargar datos
      } else {
        const errorData = await response.text();
        setError(errorData || 'Error actualizando perfil');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const addDisponibilidad = () => {
    // Verificar que no exista ya esta disponibilidad
    const exists = disponibilidades.some(d => 
      d.diaSemana === newDisponibilidad.diaSemana && 
      d.horaInicio === newDisponibilidad.horaInicio && 
      d.horaFin === newDisponibilidad.horaFin
    );

    if (exists) {
      setError('Esta disponibilidad ya existe');
      return;
    }

    setDisponibilidades([...disponibilidades, { ...newDisponibilidad }]);
    setNewDisponibilidad({ diaSemana: 1, horaInicio: '09:00', horaFin: '17:00' });
  };

  const removeDisponibilidad = (index) => {
    const newDisps = disponibilidades.filter((_, i) => i !== index);
    setDisponibilidades(newDisps);
  };

  const saveDisponibilidad = async () => {
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/nannies/${nineraData.nineraID}/disponibilidad`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(disponibilidades)
      });

      if (response.ok) {
        setSuccess('Disponibilidad actualizada correctamente');
        setEditingDisponibilidad(false);
        loadData(); // Recargar datos
      } else {
        const errorData = await response.text();
        setError(errorData || 'Error actualizando disponibilidad');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Solicitada': return 'warning';
      case 'Confirmada': return 'info';
      case 'Completada': return 'success';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiaSemanaLabel = (diaSemana) => {
    const dia = diasSemana.find(d => d.value === diaSemana);
    return dia ? dia.label : diaSemana;
  };

  if (loading) {
    return <Container><Typography>Cargando...</Typography></Container>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard Niñera - {user?.nombre} {user?.apellido}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No tienes reservas aún
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking.reservaID}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6">
                          Reserva #{booking.reservaID}
                        </Typography>
                        <Chip 
                          label={booking.estado} 
                          color={getEstadoColor(booking.estado)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Familia:</strong> {booking.familiaNombre} {booking.familiaApellido}
                      </Typography>
                      
                      {booking.familiaTelefono && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Teléfono:</strong> {booking.familiaTelefono}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Inicio:</strong> {formatDate(booking.inicioServicio)}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Fin:</strong> {formatDate(booking.finServicio)}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Costo Total:</strong> ${booking.costoTotal}
                      </Typography>
                      
                      {booking.notasParaNinera && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Notas:</strong> {booking.notasParaNinera}
                          </Typography>
                        </Box>
                      )}
                      
                      {booking.resena && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Reseña:</strong> ⭐ {booking.resena.calificacion}/5
                          </Typography>
                          {booking.resena.comentario && (
                            <Typography variant="body2">
                              {booking.resena.comentario}
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                        Creada el {formatDate(booking.fechaCreacion)}
                      </Typography>
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
              startIcon={<Edit />}
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
                    <Typography variant="body1"><strong>Nombre:</strong> {nineraData.nombre}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Apellido:</strong> {nineraData.apellido}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Teléfono:</strong> {nineraData.telefono || 'No especificado'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Ciudad:</strong> {nineraData.ciudad || 'No especificada'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Experiencia:</strong> {nineraData.anosExperiencia} años</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Tarifa:</strong> ${nineraData.tarifaPorHora}/hora</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1"><strong>Biografía:</strong></Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {nineraData.biografia || 'Sin biografía'}
                    </Typography>
                  </Grid>
                  {nineraData.calificacionPromedio && (
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>Calificación Promedio:</strong> ⭐ {nineraData.calificacionPromedio}/5
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

        {/* Dialog Editar Disponibilidad */}
        <Dialog open={editingDisponibilidad} onClose={() => setEditingDisponibilidad(false)} maxWidth="md" fullWidth>
          <DialogTitle>Editar Disponibilidad</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Agregar Horario
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Día</InputLabel>
                    <Select
                      value={newDisponibilidad.diaSemana}
                      label="Día"
                      onChange={(e) => setNewDisponibilidad({...newDisponibilidad, diaSemana: e.target.value})}
                    >
                      {diasSemana.map(dia => (
                        <MenuItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Inicio"
                    value={newDisponibilidad.horaInicio}
                    onChange={(e) => setNewDisponibilidad({...newDisponibilidad, horaInicio: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Fin"
                    value={newDisponibilidad.horaFin}
                    onChange={(e) => setNewDisponibilidad({...newDisponibilidad, horaFin: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={addDisponibilidad}
                    fullWidth
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Horarios Actuales
              </Typography>
              {disponibilidades.length === 0 ? (
                <Typography color="textSecondary">
                  No hay horarios configurados
                </Typography>
              ) : (
                <List>
                  {disponibilidades.map((disp, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={getDiaSemanaLabel(disp.diaSemana)}
                        secondary={`${disp.horaInicio} - ${disp.horaFin}`}
                      />
                      <IconButton 
                        color="error" 
                        onClick={() => removeDisponibilidad(index)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingDisponibilidad(false)}>Cancelar</Button>
            <Button onClick={saveDisponibilidad} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default DashboardNinera;