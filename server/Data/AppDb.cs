
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> options) : base(options) { }
    public DbSet<FavoriteBrewery> Favorites => Set<FavoriteBrewery>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<FavoriteBrewery>()
            .HasIndex(x => x.BreweryId)
            .IsUnique();
    }
}
