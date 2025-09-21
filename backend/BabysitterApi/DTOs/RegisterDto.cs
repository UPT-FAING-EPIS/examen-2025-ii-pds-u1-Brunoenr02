using System.ComponentModel.DataAnnotations;

namespace BabysitterApi.DTOs
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(255)]
        public string? Direccion { get; set; }

        [StringLength(100)]
        public string? Ciudad { get; set; }

        [Required]
        public string Rol { get; set; } = string.Empty; // "Familia" o "Ninera"

        // Campos específicos para niñeras
        public string? Biografia { get; set; }
        public int? AnosExperiencia { get; set; }
        public decimal? TarifaPorHora { get; set; }
    }
}