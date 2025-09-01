
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

var builder = WebApplication.CreateBuilder(args);

// TODO: optionally add Serilog or other logging

builder.Services.AddDbContext<AppDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/api/healthz", () => Results.Ok(new { status = "ok" }));

// TODO: Implement endpoints
// GET /api/favorites
app.MapGet("/api/favorites", async (AppDb db) =>
{
    var list = await db.Favorites.OrderBy(f => f.Name).ToListAsync();
    return Results.Ok(list);
});

// POST /api/favorites
app.MapPost("/api/favorites", async (AppDb db, FavoriteDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.BreweryId) || string.IsNullOrWhiteSpace(dto.Name))
        return Results.BadRequest("breweryId and name are required.");

    var now = DateTime.UtcNow;
    var existing = await db.Favorites.SingleOrDefaultAsync(f => f.BreweryId == dto.BreweryId);
    if (existing is null)
    {
        var fav = new FavoriteBrewery {
            BreweryId = dto.BreweryId,
            Name = dto.Name,
            BreweryType = dto.BreweryType,
            City = dto.City,
            State = dto.State,
            WebsiteUrl = dto.WebsiteUrl,
            Note = dto.Note,
            CreatedUtc = now,
            UpdatedUtc = now
        };
        db.Favorites.Add(fav);
        await db.SaveChangesAsync();
        return Results.Created($"/api/favorites/{dto.BreweryId}", fav);
    }
    else
    {
        // Choose: upsert OR conflict. Default here: Conflict.
        return Results.Conflict($"Brewery {dto.BreweryId} already saved.");
    }
});

// PUT /api/favorites/{breweryId}/note
app.MapPut("/api/favorites/{breweryId}/note", async (AppDb db, string breweryId, NoteDto dto) =>
{
    var fav = await db.Favorites.SingleOrDefaultAsync(f => f.BreweryId == breweryId);
    if (fav is null) return Results.NotFound();
    fav.Note = dto.Note;
    fav.UpdatedUtc = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok();
});

// DELETE /api/favorites/{breweryId}
app.MapDelete("/api/favorites/{breweryId}", async (AppDb db, string breweryId) =>
{
    var fav = await db.Favorites.SingleOrDefaultAsync(f => f.BreweryId == breweryId);
    if (fav is null) return Results.NoContent();
    db.Favorites.Remove(fav);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

// DTOs
public record FavoriteDto(string BreweryId, string Name, string? BreweryType, string? City, string? State, string? WebsiteUrl, string? Note);
public record NoteDto(string Note);
