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
  Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { bookingsService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MisReservas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getUserBookings(user.usuarioID);
      setBookings(data);
      setLoading(false);
    } catch (error) {
      setError('Error cargando reservas');
      setLoading(false);
    }
  };

  const goBack = () => {
    if (user.rol === 'Familia') {
      navigate('/dashboard-familia');
    } else {
      navigate('/dashboard-ninera');
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

  if (loading) {
    return <Container><Typography>Cargando...</Typography></Container>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={goBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mis Reservas
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                    
                    {user.rol === 'Familia' ? (
                      <>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Niñera:</strong> {booking.nineraNombre} {booking.nineraApellido}
                        </Typography>
                        {booking.nineraTelefono && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Teléfono:</strong> {booking.nineraTelefono}
                          </Typography>
                        )}
                        {booking.nineraTarifa && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Tarifa:</strong> ${booking.nineraTarifa}/hora
                          </Typography>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Familia:</strong> {booking.familiaNombre} {booking.familiaApellido}
                        </Typography>
                        {booking.familiaTelefono && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Teléfono:</strong> {booking.familiaTelefono}
                          </Typography>
                        )}
                      </>
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
      </Container>
    </>
  );
};

export default MisReservas;