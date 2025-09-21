using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BabysitterApi.Models
{
    [Table("Reservas")]
    public class Reserva
    {
        [Key]
        public int ReservaID { get; set; }

        [Required]
        public int FamiliaUsuarioID { get; set; }

        [Required]
        public int NineraID { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Required]
        public DateTime InicioServicio { get; set; }

        [Required]
        public DateTime FinServicio { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal CostoTotal { get; set; }

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "Solicitada"; // Solicitada, Confirmada, Completada, Cancelada

        [StringLength(500)]
        public string? NotasParaNinera { get; set; }

        // Navegación
        [ForeignKey("FamiliaUsuarioID")]
        public virtual Usuario Familia { get; set; } = null!;

        [ForeignKey("NineraID")]
        public virtual Ninera Ninera { get; set; } = null!;

        public virtual Resena? Resena { get; set; }
    }
}