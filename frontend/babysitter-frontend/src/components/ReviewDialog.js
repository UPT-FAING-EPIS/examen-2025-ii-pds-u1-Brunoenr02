import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Star } from '@mui/icons-material';

const ReviewDialog = ({ open, onClose, booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reviewData = {
        reservaID: booking.reservaID,
        calificacion: rating,
        comentario: comment.trim() || null
      };

      await onReviewSubmitted(reviewData);
      
      // Reset form
      setRating(5);
      setComment('');
      onClose();
    } catch (error) {
      setError(error.response?.data || 'Error al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(5);
      setComment('');
      setError('');
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Calificar Servicio
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Servicio con: <strong>{booking.nineraNombre} {booking.nineraApellido}</strong>
          </Typography>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {new Date(booking.inicioServicio).toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Calificación *
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue || 1);
              }}
              size="large"
              emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
              {rating === 1 && "Muy malo"}
              {rating === 2 && "Malo"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bueno"}
              {rating === 5 && "Excelente"}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con esta niñera..."
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={submitting}
        >
          {submitting ? 'Enviando...' : 'Enviar Reseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;