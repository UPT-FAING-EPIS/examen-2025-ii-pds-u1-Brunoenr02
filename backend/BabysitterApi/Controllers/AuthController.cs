using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BabysitterApi.Data;
using BabysitterApi.Models;
using BabysitterApi.DTOs;
using BabysitterApi.Services;
using BCrypt.Net;

namespace BabysitterApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BabysitterContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(BabysitterContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            // Verificar si el email ya existe
            if (await _context.Usuarios.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("El email ya está registrado");
            }

            // Validar rol
            if (registerDto.Rol != "Familia" && registerDto.Rol != "Ninera")
            {
                return BadRequest("El rol debe ser 'Familia' o 'Ninera'");
            }

            // Si es niñera, validar campos requeridos
            if (registerDto.Rol == "Ninera")
            {
                if (!registerDto.TarifaPorHora.HasValue || registerDto.TarifaPorHora <= 0)
                {
                    return BadRequest("La tarifa por hora es requerida para niñeras");
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Crear usuario
                var usuario = new Usuario
                {
                    Nombre = registerDto.Nombre,
                    Apellido = registerDto.Apellido,
                    Email = registerDto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    Telefono = registerDto.Telefono,
                    Direccion = registerDto.Direccion,
                    Ciudad = registerDto.Ciudad,
                    Rol = registerDto.Rol,
                    FechaRegistro = DateTime.Now
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                // Si es niñera, crear perfil de niñera
                if (registerDto.Rol == "Ninera")
                {
                    var ninera = new Ninera
                    {
                        UsuarioID = usuario.UsuarioID,
                        Biografia = registerDto.Biografia,
                        AnosExperiencia = registerDto.AnosExperiencia ?? 0,
                        TarifaPorHora = registerDto.TarifaPorHora!.Value
                    };

                    _context.Nineras.Add(ninera);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                var token = _jwtService.GenerateToken(usuario);

                return Ok(new AuthResponseDto
                {
                    Token = token,
                    UsuarioID = usuario.UsuarioID,
                    Nombre = usuario.Nombre,
                    Apellido = usuario.Apellido,
                    Email = usuario.Email,
                    Rol = usuario.Rol,
                    Expiracion = DateTime.Now.AddDays(1)
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.Password))
            {
                return Unauthorized("Credenciales inválidas");
            }

            var token = _jwtService.GenerateToken(usuario);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UsuarioID = usuario.UsuarioID,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Expiracion = DateTime.Now.AddDays(1)
            });
        }
    }
}