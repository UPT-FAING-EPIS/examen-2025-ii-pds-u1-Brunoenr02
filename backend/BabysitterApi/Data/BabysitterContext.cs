using Microsoft.EntityFrameworkCore;
using BabysitterApi.Models;

namespace BabysitterApi.Data
{
    public class BabysitterContext : DbContext
    {
        public BabysitterContext(DbContextOptions<BabysitterContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Ninera> Nineras { get; set; }
        public DbSet<Disponibilidad> Disponibilidades { get; set; }
        public DbSet<Reserva> Reservas { get; set; }
        public DbSet<Resena> Resenas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar relaciones y restricciones

            // Usuario - Ninera (1:1)
            modelBuilder.Entity<Ninera>()
                .HasOne(n => n.Usuario)
                .WithOne(u => u.Ninera)
                .HasForeignKey<Ninera>(n => n.UsuarioID)
                .OnDelete(DeleteBehavior.Cascade);

            // Ninera - Disponibilidad (1:N)
            modelBuilder.Entity<Disponibilidad>()
                .HasOne(d => d.Ninera)
                .WithMany(n => n.Disponibilidades)
                .HasForeignKey(d => d.NineraID)
                .OnDelete(DeleteBehavior.Cascade);

            // Reserva - Usuario (Familia) (N:1)
            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Familia)
                .WithMany(u => u.ReservasComoFamilia)
                .HasForeignKey(r => r.FamiliaUsuarioID)
                .OnDelete(DeleteBehavior.NoAction);

            // Reserva - Ninera (N:1)
            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Ninera)
                .WithMany(n => n.Reservas)
                .HasForeignKey(r => r.NineraID)
                .OnDelete(DeleteBehavior.NoAction);

            // Resena - Reserva (1:1)
            modelBuilder.Entity<Resena>()
                .HasOne(r => r.Reserva)
                .WithOne(res => res.Resena)
                .HasForeignKey<Resena>(r => r.ReservaID)
                .OnDelete(DeleteBehavior.Cascade);

            // Resena - Usuario (Autor) (N:1)
            modelBuilder.Entity<Resena>()
                .HasOne(r => r.Autor)
                .WithMany(u => u.ResenasEscritas)
                .HasForeignKey(r => r.AutorUsuarioID)
                .OnDelete(DeleteBehavior.NoAction);

            // Resena - Ninera (N:1)
            modelBuilder.Entity<Resena>()
                .HasOne(r => r.NineraResenada)
                .WithMany(n => n.ResenasRecibidas)
                .HasForeignKey(r => r.NineraResenadaID)
                .OnDelete(DeleteBehavior.NoAction);

            // Índices únicos
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Ninera>()
                .HasIndex(n => n.UsuarioID)
                .IsUnique();

            modelBuilder.Entity<Resena>()
                .HasIndex(r => r.ReservaID)
                .IsUnique();
        }
    }
}