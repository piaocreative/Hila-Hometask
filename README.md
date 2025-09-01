
# Candidate Take-Home — React + .NET + SQL Server (2–3 hours)

**Goal:** Build a small full-stack feature that searches breweries from a public API and lets the user save favorites (with a note) to SQL Server, then view/edit/delete them.

> Estimated effort: **2–3 hours**. Please prioritize clean, working code over breadth. If you run out of time, leave TODOs at the bottom of this README.

---

## What You’ll Build

### User Story
As a user I can:
1) **Search breweries by city** using the Open Brewery DB public API.  
2) **Page through results** (next/prev).  
3) **Save a brewery as a favorite** with an optional **note** (persisted in SQL Server).  
4) **View my favorites** from the database.  
5) **Edit the note** or **delete** a favorite.

### Public API
Open Brewery DB (no auth):  
`GET https://api.openbrewerydb.org/v1/breweries?by_city={city}&page={n}&per_page={10|20|50}`

---

## Tech Requirements

- **Frontend:** React (TypeScript preferred), Vite or CRA.  
  - Accessible form inputs (labels, keyboard nav for dialogs/modals).  
  - Minimal tests (**Vitest + React Testing Library**) for at least 2 components or flows.
- **Backend:** **.NET 8 minimal API** with **EF Core** (SQL Server).
- **DB:** SQL Server (local container via **docker-compose**).
- **Project Layout:**
  ```
  / (root)
    /client      # React app
    /server      # .NET 8 minimal API + EF Core
    docker-compose.yml
    README.md
  ```

---

## Acceptance Criteria (we will run)

### Functionality
- Search page with:
  - City input, per-page select (10/20/50), Search button.
  - Results list: name, type, city/state, website (if present).
  - Pagination (Prev/Next) wired to the Open Brewery API `page` param.
  - Each result row has **Save** → opens a small **note** form and persists via your server.
  - Disable/Hide Save when a brewery is already saved.
- Favorites page:
  - Lists favorites **from your database** (not the public API).
  - Edit note & Delete update the DB.
- Error/Loading states are visible and handled.

### Suggested Backend Endpoints
```
GET    /api/favorites
POST   /api/favorites
PUT    /api/favorites/{breweryId}/note
DELETE /api/favorites/{breweryId}
```

### Suggested Data Model
```csharp
public class FavoriteBrewery
{
    public int Id { get; set; }                       // Identity PK
    public string BreweryId { get; set; } = default!; // External ID from Open Brewery DB
    public string Name { get; set; } = default!;
    public string? BreweryType { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
}
```
- Add a **unique index** on `BreweryId`.

### Validation
- `400` for invalid payloads.  
- `404` when editing/deleting non-existent favorites.  
- Upsert on POST is OK **or** return `409` for duplicates—document your choice.

---

## Getting Started

### 1) Start SQL Server (docker-compose)
```
docker compose up -d
```

### 2) Backend
- Connection string is in `server/appsettings.Development.json` (update if needed).
- Commands:
  ```bash
  cd server
  dotnet ef migrations add Initial
  dotnet ef database update
  dotnet run
  ```
- Navigate to Swagger UI (if enabled) to explore the API.

### 3) Frontend
- Commands:
  ```bash
  cd client
  npm i
  npm run dev
  ```
- Configure the client to call:
  - Open Brewery DB for search,
  - your backend for favorites CRUD.

---

## What We’re Evaluating

**React (40 pts)**  
- Component structure, hooks, state, effects (10)  
- Accessibility (labels, focus management, aria) (8)  
- Data fetching & pagination logic with loading/error UI (10)  
- State management clarity (query params, saved state sync) (6)  
- Tests (2–3 RTL/Vitest tests) (6)

**.NET (40 pts)**  
- Minimal API design, DTOs, validation (10)  
- EF Core modeling/migrations; unique index (10)  
- Correct status codes & error handling (8)  
- One small integration test (WebApplicationFactory) (6)  
- Logging/config readiness (6)

**Craft (20 pts)**  
- Clear README, reproducible setup (6)  
- Type safety & naming (6)  
- Clean code (lint/format, small functions, separation of concerns) (8)

**Pass bar:** 75+

---

## Constraints & Guidance
- Keep it **simple and production-leaning**: small, readable functions; avoid over-engineering.
- You may use libraries (axios, zod, etc.). Avoid heavy state managers unless necessary.
- Tests: a **couple of meaningful tests** are enough.
- If you hit time limits, leave **TODOs** and describe trade-offs below.

---

## Submission
- Share a **GitHub repo** (public or private invite) with:
  - Commit history for the exercise window,
  - `README.md` with setup/run/test instructions and trade-offs.

---

## TODOs / Notes (Candidate adds here)
- [ ] ...
