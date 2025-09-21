namespace BabysitterApi.DTOs
{
    public class BookingDto
    {
        public int ReservaID { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime InicioServicio { get; set; }
        public DateTime FinServicio { get; set; }
        public decimal CostoTotal { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string? NotasParaNinera { get; set; }
        
        // Información de la familia (para niñeras)
        public string? FamiliaNombre { get; set; }
        public string? FamiliaApellido { get; set; }
        public string? FamiliaTelefono { get; set; }
        
        // Información de la niñera (para familias)
        public string? NineraNombre { get; set; }
        public string? NineraApellido { get; set; }
        public string? NineraTelefono { get; set; }
        public decimal? NineraTarifa { get; set; }
        
        // Reseña si existe
        public ResenaDto? Resena { get; set; }
    }

    public class ResenaDto
    {
        public int ResenaID { get; set; }
        public int Calificacion { get; set; }
        public string? Comentario { get; set; }
        public DateTime FechaResena { get; set; }
    }
}