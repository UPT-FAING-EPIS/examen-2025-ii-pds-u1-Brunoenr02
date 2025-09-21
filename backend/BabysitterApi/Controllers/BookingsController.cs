using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BabysitterApi.Data;
using BabysitterApi.Models;
using BabysitterApi.DTOs;

namespace BabysitterApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly BabysitterContext _context;

        public BookingsController(BabysitterContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Familia")]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto createBookingDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Verificar que la niñera existe
            var ninera = await _context.Nineras
                .Include(n => n.Usuario)
                .FirstOrDefaultAsync(n => n.NineraID == createBookingDto.NineraID);

            if (ninera == null)
            {
                return NotFound("Niñera no encontrada");
            }

            // Validar fechas
            if (createBookingDto.InicioServicio >= createBookingDto.FinServicio)
            {
                return BadRequest("La fecha de inicio debe ser anterior a la fecha de fin");
            }

            // Convertir a UTC si no están en UTC
            var inicioUtc = createBookingDto.InicioServicio.Kind == DateTimeKind.Utc 
                ? createBookingDto.InicioServicio 
                : createBookingDto.InicioServicio.ToUniversalTime();
            
            var finUtc = createBookingDto.FinServicio.Kind == DateTimeKind.Utc 
                ? createBookingDto.FinServicio 
                : createBookingDto.FinServicio.ToUniversalTime();

            if (inicioUtc <= DateTime.UtcNow)
            {
                return BadRequest("La fecha de inicio debe ser futura");
            }

            // Calcular costo total
            var horas = (finUtc - inicioUtc).TotalHours;
            var costoTotal = (decimal)horas * ninera.TarifaPorHora;

            // Crear reserva
            var reserva = new Reserva
            {
                FamiliaUsuarioID = userId,
                NineraID = createBookingDto.NineraID,
                InicioServicio = inicioUtc,
                FinServicio = finUtc,
                CostoTotal = costoTotal,
                Estado = "Solicitada",
                NotasParaNinera = createBookingDto.NotasParaNinera,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            // Cargar la reserva completa para retornar
            var reservaCompleta = await _context.Reservas
                .Include(r => r.Ninera)
                .ThenInclude(n => n.Usuario)
                .Where(r => r.ReservaID == reserva.ReservaID)
                .Select(r => new BookingDto
                {
                    ReservaID = r.ReservaID,
                    FechaCreacion = r.FechaCreacion,
                    InicioServicio = r.InicioServicio,
                    FinServicio = r.FinServicio,
                    CostoTotal = r.CostoTotal,
                    Estado = r.Estado,
                    NotasParaNinera = r.NotasParaNinera,
                    NineraNombre = r.Ninera.Usuario.Nombre,
                    NineraApellido = r.Ninera.Usuario.Apellido,
                    NineraTelefono = r.Ninera.Usuario.Telefono,
                    NineraTarifa = r.Ninera.TarifaPorHora
                })
                .FirstOrDefaultAsync();

            return Ok(reservaCompleta);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetUserBookings(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Verificar que el usuario solo pueda ver sus propias reservas
            if (currentUserId != userId)
            {
                return StatusCode(403, "No tienes permiso para ver estas reservas");
            }

            IQueryable<Reserva> query = _context.Reservas
                .Include(r => r.Familia)
                .Include(r => r.Ninera)
                .ThenInclude(n => n.Usuario)
                .Include(r => r.Resena);

            if (userRole == "Familia")
            {
                query = query.Where(r => r.FamiliaUsuarioID == userId);
            }
            else if (userRole == "Ninera")
            {
                query = query.Where(r => r.Ninera.UsuarioID == userId);
            }
            else
            {
                return BadRequest("Rol de usuario no válido");
            }

            var bookings = await query
                .Select(r => new BookingDto
                {
                    ReservaID = r.ReservaID,
                    FechaCreacion = r.FechaCreacion,
                    InicioServicio = r.InicioServicio,
                    FinServicio = r.FinServicio,
                    CostoTotal = r.CostoTotal,
                    Estado = r.Estado,
                    NotasParaNinera = r.NotasParaNinera,
                    // Para familias - mostrar info de niñera
                    NineraNombre = userRole == "Familia" ? r.Ninera.Usuario.Nombre : null,
                    NineraApellido = userRole == "Familia" ? r.Ninera.Usuario.Apellido : null,
                    NineraTelefono = userRole == "Familia" ? r.Ninera.Usuario.Telefono : null,
                    NineraTarifa = userRole == "Familia" ? r.Ninera.TarifaPorHora : null,
                    // Para niñeras - mostrar info de familia
                    FamiliaNombre = userRole == "Ninera" ? r.Familia.Nombre : null,
                    FamiliaApellido = userRole == "Ninera" ? r.Familia.Apellido : null,
                    FamiliaTelefono = userRole == "Ninera" ? r.Familia.Telefono : null,
                    // Reseña si existe
                    Resena = r.Resena != null ? new ResenaDto
                    {
                        ResenaID = r.Resena.ResenaID,
                        Calificacion = r.Resena.Calificacion,
                        Comentario = r.Resena.Comentario,
                        FechaResena = r.Resena.FechaResena
                    } : null
                })
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();

            return Ok(bookings);
        }
    }
}