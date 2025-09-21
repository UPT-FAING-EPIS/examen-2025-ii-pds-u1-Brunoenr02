using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BabysitterApi.Models
{
    [Table("Usuarios")]
    public class Usuario
    {
        [Key]
        public int UsuarioID { get; set; }

        [Required]
        [StringLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(255)]
        public string? Direccion { get; set; }

        [StringLength(100)]
        public string? Ciudad { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        [Required]
        [StringLength(10)]
        public string Rol { get; set; } = string.Empty; // "Familia" o "Ninera"

        // Navegación
        public virtual Ninera? Ninera { get; set; }
        public virtual ICollection<Reserva> ReservasComoFamilia { get; set; } = new List<Reserva>();
        public virtual ICollection<Resena> ResenasEscritas { get; set; } = new List<Resena>();
    }
}