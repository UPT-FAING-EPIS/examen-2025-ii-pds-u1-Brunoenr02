namespace BabysitterApi.DTOs
{
    public class NannyListDto
    {
        public int NineraID { get; set; }
        public int UsuarioID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string? Ciudad { get; set; }
        public string? Biografia { get; set; }
        public int AnosExperiencia { get; set; }
        public decimal TarifaPorHora { get; set; }
        public decimal? CalificacionPromedio { get; set; }
        public string? Telefono { get; set; }
        public List<DisponibilidadDto> Disponibilidades { get; set; } = new List<DisponibilidadDto>();
    }

    public class DisponibilidadDto
    {
        public int DiaSemana { get; set; }
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
    }

    public class UpdateDisponibilidadDto
    {
        public int DiaSemana { get; set; }
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
    }

    public class UpdatePerfilNineraDto
    {
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Telefono { get; set; }
        public string? Ciudad { get; set; }
        public string? Biografia { get; set; }
        public int? AnosExperiencia { get; set; }
        public decimal? TarifaPorHora { get; set; }
    }
}