
namespace Server.Models;

public class FavoriteBrewery
{
    public int Id { get; set; }
    public string BreweryId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? BreweryType { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
}
