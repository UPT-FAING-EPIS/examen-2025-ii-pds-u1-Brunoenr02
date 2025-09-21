using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BabysitterApi.Data;
using BabysitterApi.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace BabysitterApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NanniesController : ControllerBase
    {
        private readonly BabysitterContext _context;

        public NanniesController(BabysitterContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NannyListDto>>> GetNannies([FromQuery] string? ciudad = null, [FromQuery] int? diaSemana = null)
        {
            // Cargar niñeras sin disponibilidades por ahora para evitar errores de casting
            var query = _context.Nineras
                .Include(n => n.Usuario)
                .Where(n => n.Usuario.Rol == "Ninera");

            // Filtrar por ciudad si se proporciona
            if (!string.IsNullOrEmpty(ciudad))
            {
                query = query.Where(n => n.Usuario.Ciudad != null && n.Usuario.Ciudad.Contains(ciudad));
            }

            var nannies = await query.ToListAsync();

            // Mapear a DTOs sin disponibilidades por ahora
            var nanniesDtos = nannies.Select(n => new NannyListDto
            {
                NineraID = n.NineraID,
                UsuarioID = n.UsuarioID,
                Nombre = n.Usuario.Nombre,
                Apellido = n.Usuario.Apellido,
                Ciudad = n.Usuario.Ciudad,
                Biografia = n.Biografia,
                AnosExperiencia = n.AnosExperiencia,
                TarifaPorHora = n.TarifaPorHora,
                CalificacionPromedio = n.CalificacionPromedio,
                Telefono = n.Usuario.Telefono,
                Disponibilidades = new List<DisponibilidadDto>() // Temporalmente vacío
            }).ToList();

            return Ok(nanniesDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NannyListDto>> GetNanny(int id)
        {
            var nanny = await _context.Nineras
                .Include(n => n.Usuario)
                .Where(n => n.NineraID == id)
                .FirstOrDefaultAsync();

            if (nanny == null)
            {
                return NotFound("Niñera no encontrada");
            }

            // Mapear a DTO sin disponibilidades por ahora
            var nannyDto = new NannyListDto
            {
                NineraID = nanny.NineraID,
                UsuarioID = nanny.UsuarioID,
                Nombre = nanny.Usuario.Nombre,
                Apellido = nanny.Usuario.Apellido,
                Ciudad = nanny.Usuario.Ciudad,
                Biografia = nanny.Biografia,
                AnosExperiencia = nanny.AnosExperiencia,
                TarifaPorHora = nanny.TarifaPorHora,
                CalificacionPromedio = nanny.CalificacionPromedio,
                Telefono = nanny.Usuario.Telefono,
                Disponibilidades = new List<DisponibilidadDto>() // Temporalmente vacío
            };

            return Ok(nannyDto);
        }

        [HttpPut("{id}/disponibilidad")]
        [Authorize]
        public async Task<ActionResult> UpdateDisponibilidad(int id, [FromBody] List<UpdateDisponibilidadDto> disponibilidades)
        {
            // Verificar que la niñera existe y pertenece al usuario logueado
            var nanny = await _context.Nineras
                .Include(n => n.Usuario)
                .FirstOrDefaultAsync(n => n.NineraID == id);

            if (nanny == null)
            {
                return NotFound("Niñera no encontrada");
            }

            // Verificar que el usuario logueado es el dueño de este perfil de niñera
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId) || nanny.UsuarioID != userId)
            {
                return StatusCode(403, new { message = "No tienes permiso para modificar este perfil" });
            }

            // Validar datos de entrada
            foreach (var disp in disponibilidades)
            {
                if (disp.DiaSemana < 1 || disp.DiaSemana > 7)
                {
                    return BadRequest($"Día de semana inválido: {disp.DiaSemana}. Debe estar entre 1 y 7.");
                }

                // Validación simple de formato de hora
                if (string.IsNullOrWhiteSpace(disp.HoraInicio) || string.IsNullOrWhiteSpace(disp.HoraFin))
                {
                    return BadRequest("Formato de hora inválido. Use HH:mm (ej: 09:00)");
                }

                // Validación adicional de formato con regex
                if (!System.Text.RegularExpressions.Regex.IsMatch(disp.HoraInicio, @"^\d{2}:\d{2}$") ||
                    !System.Text.RegularExpressions.Regex.IsMatch(disp.HoraFin, @"^\d{2}:\d{2}$"))
                {
                    return BadRequest("Formato de hora inválido. Use HH:mm (ej: 09:00)");
                }
            }

            // Eliminar disponibilidades existentes
            var existingDisponibilidades = await _context.Disponibilidades
                .Where(d => d.NineraID == id)
                .ToListAsync();
            
            _context.Disponibilidades.RemoveRange(existingDisponibilidades);

            // Agregar nuevas disponibilidades
            foreach (var disp in disponibilidades)
            {
                _context.Disponibilidades.Add(new Models.Disponibilidad
                {
                    NineraID = id,
                    DiaSemana = disp.DiaSemana,
                    HoraInicio = disp.HoraInicio,
                    HoraFin = disp.HoraFin
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Disponibilidad actualizada correctamente" });
        }

        [HttpPut("{id}/perfil")]
        [Authorize]
        public async Task<ActionResult> UpdatePerfil(int id, [FromBody] UpdatePerfilNineraDto perfilData)
        {
            var nanny = await _context.Nineras
                .Include(n => n.Usuario)
                .FirstOrDefaultAsync(n => n.NineraID == id);

            if (nanny == null)
            {
                return NotFound("Niñera no encontrada");
            }

            // Verificar que el usuario logueado es el dueño de este perfil de niñera
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId) || nanny.UsuarioID != userId)
            {
                return StatusCode(403, new { message = "No tienes permiso para modificar este perfil" });
            }

            // Actualizar campos del usuario
            if (!string.IsNullOrWhiteSpace(perfilData.Nombre))
                nanny.Usuario.Nombre = perfilData.Nombre;
            
            if (!string.IsNullOrWhiteSpace(perfilData.Apellido))
                nanny.Usuario.Apellido = perfilData.Apellido;
            
            if (!string.IsNullOrWhiteSpace(perfilData.Telefono))
                nanny.Usuario.Telefono = perfilData.Telefono;
            
            if (!string.IsNullOrWhiteSpace(perfilData.Ciudad))
                nanny.Usuario.Ciudad = perfilData.Ciudad;

            // Actualizar campos de la niñera
            if (!string.IsNullOrWhiteSpace(perfilData.Biografia))
                nanny.Biografia = perfilData.Biografia;
            
            if (perfilData.AnosExperiencia.HasValue)
                nanny.AnosExperiencia = perfilData.AnosExperiencia.Value;
            
            if (perfilData.TarifaPorHora.HasValue)
                nanny.TarifaPorHora = perfilData.TarifaPorHora.Value;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Perfil actualizado correctamente" });
        }
    }
}