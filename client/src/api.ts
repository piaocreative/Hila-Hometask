const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export type Brewery = {
  id: string;
  name: string;
  brewery_type?: string | null;
  city?: string | null;
  state?: string | null;
  website_url?: string | null;
};

export type Favorite = {
  id: number;
  breweryId: string;
  name: string;
  breweryType?: string | null;
  city?: string | null;
  state?: string | null;
  websiteUrl?: string | null;
  note?: string | null;
  createdUtc: string;
  updatedUtc: string;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  getFavorites: () => http<Favorite[]>('/api/favorites'),

  createFavorite: (b: Brewery, note?: string | null) =>
    http<Favorite>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        breweryId: b.id,
        name: b.name,
        breweryType: b.brewery_type,
        city: b.city,
        state: b.state,
        websiteUrl: b.website_url,
        note: note ?? null,
      }),
    }),

  updateNote: (breweryId: string, note?: string | null) =>
    http<void>(`/api/favorites/${breweryId}/note`, {
      method: 'PUT',
      body: JSON.stringify({ breweryId: breweryId, note: note ?? null }),
    }),

  deleteFavorite: (breweryId: string) =>
    http<void>(`/api/favorites/${encodeURIComponent(breweryId)}`, {
      method: 'DELETE',
    }),

  searchBreweries: async (city: string, page: number, perPage: number) => {
    const url =
      `https://api.openbrewerydb.org/v1/breweries?by_city=${encodeURIComponent(city)}` +
      `&page=${page}&per_page=${perPage}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed fetching breweries');
    return (await res.json()) as Brewery[];
  },
};