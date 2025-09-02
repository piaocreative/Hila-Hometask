import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api, Brewery, Favorite } from './api';

type Tab = 'search' | 'favorites';

export default function App() {
  const [tab, setTab] = useState<Tab>('search');
  const [city, setCity] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [errorFav, setErrorFav] = useState<string | null>(null);
  const [saveForId, setSaveForId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState('');
  const [pendingSave, setPendingSave] = useState<string | null>(null);
  const [editForId, setEditForId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [pendingEdit, setPendingEdit] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const savedIds = useMemo(
    () => new Set(favorites.map((f) => f.breweryId)),
    [favorites]
  );

  const newNoteRef = useRef<HTMLTextAreaElement | null>(null);
  const editNoteRef = useRef<HTMLTextAreaElement | null>(null);

  async function loadFavorites() {
    setLoadingFav(true);
    setErrorFav(null);
    try {
      const list = await api.getFavorites();
      setFavorites(list);
    } catch (e: any) {
      setErrorFav(e.message ?? 'Failed to load favorites');
    } finally {
      setLoadingFav(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function runSearch(nextPage?: number) {
    if (!city.trim()) {
      setBreweries([]);
      return;
    }
    setLoadingSearch(true);
    setErrorSearch(null);
    try {
      const data = await api.searchBreweries(
        city.trim(),
        nextPage ?? page,
        perPage
      );
      setBreweries(data);
    } catch (e: any) {
      setErrorSearch(e.message ?? 'Search failed');
      setBreweries([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  function prev() {
    const p = Math.max(1, page - 1);
    setPage(p);
    runSearch(p);
  }

  function next() {
    const p = page + 1;
    setPage(p);
    runSearch(p);
  }

  useEffect(() => {
    if (city.trim()) {
      setPage(1);
      runSearch(1);
    }
  }, [perPage]);

  function openSaveNote(b: Brewery) {
    setSaveForId(b.id);
    setSaveNote('');
    setTimeout(() => newNoteRef.current?.focus(), 0);
  }

  function cancelSaveNote() {
    setSaveForId(null);
    setSaveNote('');
  }

  async function doSave(b: Brewery) {
    try {
      setPendingSave(b.id);
      await api.createFavorite(b, saveNote.trim() || null);
      await loadFavorites();
      setSaveForId(null);
      setSaveNote('');
    } catch (e: any) {
      alert(e.message ?? 'Failed to save favorite');
    } finally {
      setPendingSave(null);
    }
  }

  function openEditNote(f: Favorite) {
    setEditForId(f.breweryId);
    setEditNote(f.note ?? '');
    setTimeout(() => editNoteRef.current?.focus(), 0);
  }

  function cancelEditNote() {
    setEditForId(null);
    setEditNote('');
  }

  async function doEdit(f: Favorite) {
    try {
      setPendingEdit(f.breweryId);
      await api.updateNote(f.breweryId, editNote.trim() || null);
      await loadFavorites();
      setEditForId(null);
      setEditNote('');
    } catch (e: any) {
      alert(e.message ?? 'Failed to update note');
    } finally {
      setPendingEdit(null);
    }
  }

  async function doDelete(f: Favorite) {
    if (!confirm(`Delete "${f.name}" from favorites?`)) return;
    try {
      setPendingDelete(f.breweryId);
      await api.deleteFavorite(f.breweryId);
      setFavorites((prev) => prev.filter((x) => x.breweryId !== f.breweryId));
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete favorite');
    } finally {
      setPendingDelete(null);
    }
  }

  const disableNext = breweries.length < perPage;

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '2rem auto',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1.4,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Breweries Finder</h1>
      <p id="app-desc" style={{ marginTop: 0, color: '#555' }}>
        Search breweries by city and save favorites with a note.
      </p>

      <div role="tablist" aria-label="Views" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          role="tab"
          aria-selected={tab === 'search'}
          onClick={() => setTab('search')}
          style={tabBtnStyle(tab === 'search')}
        >
          Search
        </button>
        <button
          role="tab"
          aria-selected={tab === 'favorites'}
          onClick={() => setTab('favorites')}
          style={tabBtnStyle(tab === 'favorites')}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {tab === 'search' ? (
        <section aria-describedby="app-desc">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',         
              gap: 20,
              alignItems: 'flex-end',   
              marginBottom: 12,
            }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Cincinnati"
                autoComplete="off"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '0 0 auto', marginTop: 20 }}>
              <button
                onClick={() => {
                  setPage(1);
                  runSearch(1);
                }}
                style={{ height: 22 }}
              >
                Search
              </button>
            </div>

            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={prev} disabled={page === 1 || loadingSearch}>
                Prev
              </button>
              <span>Page {page}</span>
              <button onClick={next} disabled={disableNext || loadingSearch}>
                Next
              </button>
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <label htmlFor="perPage">Per Page</label>
              <select
                id="perPage"
                value={perPage}
                onChange={(e) => setPerPage(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>

          </div>
          {breweries.length === 0 && !!city && !loadingSearch && !errorSearch ? (
            <p>No breweries found.</p>
          ) : null}

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {breweries.map((b) => {
              const isSaved = savedIds.has(b.id);
              const open = saveForId === b.id;
              return (
                <li
                  key={b.id}
                  style={{
                    border: '1px solid #e3e3e3',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <strong>{b.name}</strong>{' '}
                      <span style={{ color: '#555' }}>
                        ({b.brewery_type ?? 'n/a'}) — {b.city ?? '—'}, {b.state ?? '—'}
                      </span>{' '}
                      {b.website_url ? (
                        <>
                          —{' '}
                          <a href={b.website_url} target="_blank" rel="noreferrer">
                            website
                          </a>
                        </>
                      ) : null}
                    </div>
                    <div>
                      <button
                        onClick={() => openSaveNote(b)}
                        disabled={isSaved}
                        aria-disabled={isSaved}
                        aria-label={isSaved ? 'Already saved' : 'Save to favorites'}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div
                      role="dialog"
                      aria-labelledby={`save-note-label-${b.id}`}
                      aria-modal="false"
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px dashed #ddd',
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <label id={`save-note-label-${b.id}`} htmlFor={`save-note-${b.id}`}>
                        Add a note (optional)
                      </label>
                      <textarea
                        id={`save-note-${b.id}`}
                        ref={newNoteRef}
                        rows={3}
                        value={saveNote}
                        onChange={(e) => setSaveNote(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => doSave(b)}
                          disabled={pendingSave === b.id}
                        >
                          {pendingSave === b.id ? 'Saving…' : 'Save Favorite'}
                        </button>
                        <button onClick={cancelSaveNote} className="secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section>
          <div
            aria-live="polite"
            role="status"
            style={{ minHeight: 20, marginBottom: 8 }}
          >
            {loadingFav ? 'Loading favorites…' : errorFav ? `Error: ${errorFav}` : ''}
          </div>

          {favorites.length === 0 && !loadingFav && !errorFav ? (
            <p>No favorites saved yet.</p>
          ) : null}

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {favorites.map((f) => {
              const editing = editForId === f.breweryId;
              return (
                <li
                  key={f.breweryId}
                  style={{
                    border: '1px solid #e3e3e3',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div>
                      <strong>{f.name}</strong>{' '}
                      <span style={{ color: '#555' }}>
                        ({f.breweryType ?? 'n/a'}) — {f.city ?? '—'}, {f.state ?? '—'}
                      </span>{' '}
                      {f.websiteUrl ? (
                        <>
                          —{' '}
                          <a href={f.websiteUrl} target="_blank" rel="noreferrer">
                            website
                          </a>
                        </>
                      ) : null}
                      <div style={{ marginTop: 6 }}>
                        <span style={{ color: '#333' }}>
                          <em>Note:</em>{' '}
                          {f.note ? <>{f.note}</> : <span style={{ color: '#888' }}>—</span>}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, height: '21px' }}>
                      <button onClick={() => openEditNote(f)} disabled={editing}>
                        Edit
                      </button>
                      <button
                        onClick={() => doDelete(f)}
                        disabled={pendingDelete === f.breweryId}
                        aria-label={`Delete ${f.name}`}
                      >
                        {pendingDelete === f.breweryId ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  {editing && (
                    <div
                      role="dialog"
                      aria-labelledby={`edit-note-label-${f.breweryId}`}
                      aria-modal="false"
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px dashed #ddd',
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <label
                        id={`edit-note-label-${f.breweryId}`}
                        htmlFor={`edit-note-${f.breweryId}`}
                      >
                        Edit note
                      </label>
                      <textarea
                        id={`edit-note-${f.breweryId}`}
                        ref={editNoteRef}
                        rows={3}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => doEdit(f)}
                          disabled={pendingEdit === f.breweryId}
                        >
                          {pendingEdit === f.breweryId ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button onClick={cancelEditNote} className="secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #d5d5d5',
    background: active ? '#f3f3f3' : 'white',
    cursor: 'pointer',
  };
}