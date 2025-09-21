using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BabysitterApi.Models
{
    [Table("Resenas")]
    public class Resena
    {
        [Key]
        public int ResenaID { get; set; }

        [Required]
        public int ReservaID { get; set; }

        [Required]
        public int AutorUsuarioID { get; set; }

        [Required]
        public int NineraResenadaID { get; set; }

        [Required]
        [Range(1, 5)]
        public int Calificacion { get; set; }

        public string? Comentario { get; set; }

        public DateTime FechaResena { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("ReservaID")]
        public virtual Reserva Reserva { get; set; } = null!;

        [ForeignKey("AutorUsuarioID")]
        public virtual Usuario Autor { get; set; } = null!;

        [ForeignKey("NineraResenadaID")]
        public virtual Ninera NineraResenada { get; set; } = null!;
    }
}