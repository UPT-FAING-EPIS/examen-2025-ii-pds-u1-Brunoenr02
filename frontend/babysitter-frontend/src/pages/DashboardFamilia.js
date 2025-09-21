import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Rating
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ExitToApp, Star } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import { nanniesService, bookingsService, reviewsService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ReviewDialog from '../components/ReviewDialog';

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

const DashboardFamilia = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [nannies, setNannies] = useState([]);
  const [filteredNannies, setFilteredNannies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedNanny, setSelectedNanny] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingData, setBookingData] = useState({
    inicioServicio: null,
    finServicio: null,
    notasParaNinera: ''
  });
  const [filters, setFilters] = useState({
    ciudad: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    applyFilters();
  }, [nannies, filters]);

  const loadData = async () => {
    try {
      const [nanniesData, bookingsData, reviewsData] = await Promise.all([
        nanniesService.getNannies(),
        bookingsService.getUserBookings(user.usuarioID),
        reviewsService.getUserReviews(user.usuarioID)
      ]);
      setNannies(nanniesData);
      setBookings(bookingsData);
      setReviews(reviewsData);
      setLoading(false);
    } catch (error) {
      setError('Error cargando datos');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...nannies];

    if (filters.ciudad) {
      filtered = filtered.filter(nanny => 
        nanny.ciudad && nanny.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())
      );
    }

    setFilteredNannies(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openBookingDialog = (nanny) => {
    setSelectedNanny(nanny);
    setBookingDialog(true);
    setBookingData({
      inicioServicio: dayjs(),
      finServicio: dayjs().add(2, 'hours'),
      notasParaNinera: ''
    });
  };

  const handleBookingChange = (field, value) => {
    setBookingData({
      ...bookingData,
      [field]: value
    });
  };

  const submitBooking = async () => {
    try {
      setError('');
      
      if (!bookingData.inicioServicio || !bookingData.finServicio) {
        setError('Por favor selecciona las fechas de inicio y fin');
        return;
      }

      const booking = {
        nineraID: selectedNanny.nineraID,
        inicioServicio: bookingData.inicioServicio.toISOString(),
        finServicio: bookingData.finServicio.toISOString(),
        notasParaNinera: bookingData.notasParaNinera || null
      };

      await bookingsService.createBooking(booking);
      setSuccess('Reserva creada exitosamente');
      setBookingDialog(false);
      loadData(); // Recargar datos
      setTabValue(1); // Cambiar a la pestaña de reservas
    } catch (error) {
      setError(error.response?.data || 'Error creando la reserva');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openReviewDialog = (booking) => {
    setSelectedBooking(booking);
    setReviewDialog(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewsService.createReview(reviewData);
      setSuccess('Reseña enviada exitosamente');
      loadData(); // Recargar datos para actualizar las reseñas
    } catch (error) {
      throw error;
    }
  };

  const canReview = (booking) => {
    return booking.estado === 'Completada' && 
           !reviews.some(review => review.reservaID === booking.reservaID);
  };

  const getDiaSemanaLabel = (diaSemana) => {
    const dia = diasSemana.find(d => d.value === diaSemana);
    return dia ? dia.label : diaSemana;
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

  if (loading) {
    return <Container><Typography>Cargando...</Typography></Container>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard Familia - {user?.nombre} {user?.apellido}
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
            <Tab label="Buscar Niñeras" />
            <Tab label="Mis Reservas" />
            <Tab label="Mis Reseñas" />
          </Tabs>
        </Box>

        {/* Tab 1: Buscar Niñeras */}
        <TabPanel value={tabValue} index={0}>
          {/* Filtros */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Buscar Niñeras Disponibles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="ciudad"
                  label="Filtrar por Ciudad"
                  value={filters.ciudad}
                  onChange={handleFilterChange}
                  placeholder="Ingresa la ciudad"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Lista de Niñeras */}
          <Grid container spacing={3}>
            {filteredNannies.map((nanny) => (
              <Grid item xs={12} md={6} lg={4} key={nanny.nineraID}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {nanny.nombre} {nanny.apellido}
                    </Typography>
                    {nanny.ciudad && (
                      <Typography color="textSecondary" gutterBottom>
                        📍 {nanny.ciudad}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {nanny.biografia || 'Sin biografía disponible'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Experiencia:</strong> {nanny.anosExperiencia} años
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tarifa:</strong> ${nanny.tarifaPorHora}/hora
                    </Typography>
                    {nanny.calificacionPromedio && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Calificación:</strong> ⭐ {nanny.calificacionPromedio}/5
                      </Typography>
                    )}
                    
                    {/* Disponibilidad */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Disponibilidad:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {nanny.disponibilidades.map((disp, index) => (
                          <Chip
                            key={index}
                            label={`${getDiaSemanaLabel(disp.diaSemana)} ${disp.horaInicio}-${disp.horaFin}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => openBookingDialog(nanny)}
                    >
                      Reservar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Tab 2: Mis Reservas */}
        <TabPanel value={tabValue} index={1}>
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
                        <strong>Niñera:</strong> {booking.nineraNombre} {booking.nineraApellido}
                      </Typography>
                      
                      {booking.nineraTelefono && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Teléfono:</strong> {booking.nineraTelefono}
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
                      
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                        Creada el {formatDate(booking.fechaCreacion)}
                      </Typography>
                      
                      {/* Botón de reseña para reservas completadas */}
                      {canReview(booking) && (
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => openReviewDialog(booking)}
                        >
                          Escribir Reseña
                        </Button>
                      )}
                      
                      {/* Mostrar si ya se escribió reseña */}
                      {booking.estado === 'Completada' && 
                       reviews.some(review => review.reservaID === booking.reservaID) && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Chip 
                            label="Reseña enviada" 
                            color="success" 
                            size="small"
                            icon={<Star />}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab 3: Mis Reseñas */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Mis Reseñas
          </Typography>

          {reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No has escrito reseñas aún
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Las reseñas aparecerán aquí después de completar servicios
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {reviews.map((review) => (
                <Grid item xs={12} md={6} key={review.resenaID}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6">
                          {review.nineraNombre}
                        </Typography>
                        <Rating value={review.calificacion} readOnly size="small" />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Calificación:</strong> {review.calificacion}/5 estrellas
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Reserva:</strong> #{review.reservaID}
                      </Typography>
                      
                      {review.comentario && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            "{review.comentario}"
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                        Escrita el {formatDate(review.fechaResena)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Dialog de Reserva */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Reservar Servicio - {selectedNanny?.nombre} {selectedNanny?.apellido}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <DateTimePicker
                label="Inicio del Servicio"
                value={bookingData.inicioServicio}
                onChange={(newValue) => handleBookingChange('inicioServicio', newValue)}
                sx={{ width: '100%', mb: 2 }}
                minDateTime={dayjs()}
              />
              <DateTimePicker
                label="Fin del Servicio"
                value={bookingData.finServicio}
                onChange={(newValue) => handleBookingChange('finServicio', newValue)}
                sx={{ width: '100%', mb: 2 }}
                minDateTime={bookingData.inicioServicio || dayjs()}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas para la Niñera"
                value={bookingData.notasParaNinera}
                onChange={(e) => handleBookingChange('notasParaNinera', e.target.value)}
                placeholder="Información adicional para la niñera..."
              />
              
              {bookingData.inicioServicio && bookingData.finServicio && selectedNanny && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Costo estimado: $
                    {(
                      (bookingData.finServicio.diff(bookingData.inicioServicio, 'hour', true)) * 
                      selectedNanny.tarifaPorHora
                    ).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancelar</Button>
            <Button onClick={submitBooking} variant="contained">
              Confirmar Reserva
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Reseña */}
        <ReviewDialog
          open={reviewDialog}
          onClose={() => setReviewDialog(false)}
          booking={selectedBooking}
          onReviewSubmitted={handleReviewSubmit}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default DashboardFamilia;