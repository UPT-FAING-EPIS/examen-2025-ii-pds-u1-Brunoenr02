using System.ComponentModel.DataAnnotations;

namespace BabysitterApi.DTOs
{
    public class CreateBookingDto
    {
        [Required]
        public int NineraID { get; set; }

        [Required]
        public DateTime InicioServicio { get; set; }

        [Required]
        public DateTime FinServicio { get; set; }

        [StringLength(500)]
        public string? NotasParaNinera { get; set; }
    }
}