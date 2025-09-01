
import React, { useState, useEffect } from 'react'

type Brewery = {
  id: string
  name: string
  brewery_type?: string
  city?: string
  state?: string
  website_url?: string
}

export default function App() {
  const [city, setCity] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [breweries, setBreweries] = useState<Brewery[]>([])

  useEffect(() => {
    // initial no-op
  }, [])

  async function search() {
    setLoading(true); setError(null)
    try {
      const url = `https://api.openbrewerydb.org/v1/breweries?by_city=${encodeURIComponent(city)}&page=${page}&per_page=${perPage}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed fetching breweries')
      const data = await res.json()
      setBreweries(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function prev() { setPage(p => Math.max(1, p - 1)) }
  function next() { setPage(p => p + 1) }

  useEffect(() => {
    if (city) search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage])

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Breweries Finder</h1>

      <label htmlFor="city">City</label>
      <input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Cincinnati" />

      <label htmlFor="perPage" style={{ marginLeft: 12 }}>Per Page</label>
      <select id="perPage" value={perPage} onChange={e => setPerPage(parseInt(e.target.value))}>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      <button onClick={() => { setPage(1); search(); }} style={{ marginLeft: 12 }}>Search</button>

      <div style={{ marginTop: 16 }}>
        <button onClick={prev} disabled={page === 1}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}</span>
        <button onClick={next}>Next</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">Error: {error}</p>}

      <ul>
        {breweries.map(b => (
          <li key={b.id} style={{ marginBottom: 8 }}>
            <strong>{b.name}</strong> ({b.brewery_type ?? 'n/a'}) — {b.city}, {b.state}
            {b.website_url ? <> — <a href={b.website_url} target="_blank" rel="noreferrer">site</a></> : null}
            {/* TODO: Add Save button → POST to /api/favorites with optional note */}
          </li>
        ))}
      </ul>
    </main>
  )
}
