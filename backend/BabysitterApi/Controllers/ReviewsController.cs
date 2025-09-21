using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BabysitterApi.Data;
using BabysitterApi.Models;
using System.Security.Claims;

namespace BabysitterApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly BabysitterContext _context;

        public ReviewsController(BabysitterContext context)
        {
            _context = context;
        }

        // GET: api/Reviews/nanny/{nineraId}
        [HttpGet("nanny/{nineraId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetNannyReviews(int nineraId)
        {
            var reviews = await _context.Resenas
                .Where(r => r.NineraResenadaID == nineraId)
                .Include(r => r.Autor)
                .Include(r => r.Reserva)
                .Select(r => new
                {
                    r.ResenaID,
                    r.Calificacion,
                    r.Comentario,
                    r.FechaResena,
                    AutorNombre = r.Autor.Nombre + " " + r.Autor.Apellido,
                    ReservaId = r.ReservaID
                })
                .OrderByDescending(r => r.FechaResena)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/reservation/{reservaId}/can-review
        [HttpGet("reservation/{reservaId}/can-review")]
        public async Task<ActionResult<bool>> CanReviewReservation(int reservaId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Verificar que la reserva existe, pertenece al usuario y está completada
            var reservation = await _context.Reservas
                .FirstOrDefaultAsync(r => r.ReservaID == reservaId && 
                                        r.FamiliaUsuarioID == userId && 
                                        r.Estado == "Completada");

            if (reservation == null)
            {
                return Ok(false);
            }

            // Verificar que no existe ya una reseña para esta reserva
            var existingReview = await _context.Resenas
                .FirstOrDefaultAsync(r => r.ReservaID == reservaId);

            return Ok(existingReview == null);
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<object>> CreateReview([FromBody] CreateReviewRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Validar que la reserva existe y pertenece al usuario
            var reservation = await _context.Reservas
                .Include(r => r.Ninera)
                .FirstOrDefaultAsync(r => r.ReservaID == request.ReservaID && 
                                        r.FamiliaUsuarioID == userId && 
                                        r.Estado == "Completada");

            if (reservation == null)
            {
                return BadRequest("Reserva no encontrada o no completada");
            }

            // Verificar que no existe ya una reseña para esta reserva
            var existingReview = await _context.Resenas
                .FirstOrDefaultAsync(r => r.ReservaID == request.ReservaID);

            if (existingReview != null)
            {
                return BadRequest("Ya existe una reseña para esta reserva");
            }

            // Validar calificación
            if (request.Calificacion < 1 || request.Calificacion > 5)
            {
                return BadRequest("La calificación debe estar entre 1 y 5");
            }

            var review = new Resena
            {
                ReservaID = request.ReservaID,
                AutorUsuarioID = userId,
                NineraResenadaID = reservation.NineraID,
                Calificacion = request.Calificacion,
                Comentario = string.IsNullOrWhiteSpace(request.Comentario) ? null : request.Comentario.Trim(),
                FechaResena = DateTime.Now
            };

            _context.Resenas.Add(review);
            await _context.SaveChangesAsync();

            // Actualizar calificación promedio de la niñera
            await UpdateNannyAverageRating(reservation.NineraID);

            return Ok(new
            {
                review.ResenaID,
                review.Calificacion,
                review.Comentario,
                review.FechaResena,
                Message = "Reseña creada exitosamente"
            });
        }

        // GET: api/Reviews/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserReviews(int userId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
            {
                return Unauthorized();
            }

            // Solo permitir ver las propias reseñas
            if (userId != currentUserId)
            {
                return Forbid();
            }

            var reviews = await _context.Resenas
                .Where(r => r.AutorUsuarioID == userId)
                .Include(r => r.NineraResenada)
                .ThenInclude(n => n.Usuario)
                .Include(r => r.Reserva)
                .Select(r => new
                {
                    r.ResenaID,
                    r.Calificacion,
                    r.Comentario,
                    r.FechaResena,
                    r.ReservaID,
                    NineraNombre = r.NineraResenada.Usuario.Nombre + " " + r.NineraResenada.Usuario.Apellido,
                    NineraId = r.NineraResenadaID
                })
                .OrderByDescending(r => r.FechaResena)
                .ToListAsync();

            return Ok(reviews);
        }

        private async Task UpdateNannyAverageRating(int nineraId)
        {
            var averageRating = await _context.Resenas
                .Where(r => r.NineraResenadaID == nineraId)
                .AverageAsync(r => (double)r.Calificacion);

            var nanny = await _context.Nineras.FindAsync(nineraId);
            if (nanny != null)
            {
                nanny.CalificacionPromedio = (decimal)Math.Round(averageRating, 1);
                await _context.SaveChangesAsync();
            }
        }
    }

    public class CreateReviewRequest
    {
        public int ReservaID { get; set; }
        public int Calificacion { get; set; }
        public string? Comentario { get; set; }
    }
}