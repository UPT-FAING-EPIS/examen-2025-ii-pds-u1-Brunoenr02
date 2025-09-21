namespace BabysitterApi.Models
{
    public class DisponibilidadRaw
    {
        public int DiaSemana { get; set; }
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
    }
}