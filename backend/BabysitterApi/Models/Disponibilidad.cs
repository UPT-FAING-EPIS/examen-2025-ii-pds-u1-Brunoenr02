using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BabysitterApi.Models
{
    [Table("Disponibilidad")]
    public class Disponibilidad
    {
        [Key]
        public int DisponibilidadID { get; set; }

        [Required]
        public int NineraID { get; set; }

        [Required]
        [Range(1, 7)] // 1=Lunes, 2=Martes, ..., 7=Domingo
        public int DiaSemana { get; set; }

        [Required]
        [StringLength(8)] // HH:mm:ss
        public string HoraInicio { get; set; } = string.Empty;

        [Required]
        [StringLength(8)] // HH:mm:ss
        public string HoraFin { get; set; } = string.Empty;

        // Navegación
        [ForeignKey("NineraID")]
        public virtual Ninera Ninera { get; set; } = null!;
    }
}