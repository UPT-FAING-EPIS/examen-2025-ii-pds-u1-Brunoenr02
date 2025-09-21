using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BabysitterApi.Models
{
    [Table("Nineras")]
    public class Ninera
    {
        [Key]
        public int NineraID { get; set; }

        [Required]
        public int UsuarioID { get; set; }

        public string? Biografia { get; set; }

        public int AnosExperiencia { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TarifaPorHora { get; set; }

        [Column(TypeName = "decimal(3,2)")]
        public decimal? CalificacionPromedio { get; set; }

        // Navegación
        [ForeignKey("UsuarioID")]
        public virtual Usuario Usuario { get; set; } = null!;
        
        public virtual ICollection<Disponibilidad> Disponibilidades { get; set; } = new List<Disponibilidad>();
        public virtual ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public virtual ICollection<Resena> ResenasRecibidas { get; set; } = new List<Resena>();
    }
}