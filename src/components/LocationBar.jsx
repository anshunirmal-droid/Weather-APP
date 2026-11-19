import { useEffect, useRef, useState } from 'react';
import { searchCities, locationId } from '../utils/api.js';

/** City search, "use my location", and the row of saved locations. */
export default function LocationBar({ active, saved, isSaved, onSelect, onSave, onRemove }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Search 350 ms after the user stops typing.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchCities(q);
        setResults(found);
        setMessage(found.length ? '' : 'No matching cities found.');
      } catch (e) {
        setMessage(e.message);
      } finally {
        setSearching(false);
        setOpen(true);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Close the dropdown when clicking elsewhere.
  useEffect(() => {
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (loc) => {
    onSelect(loc);
    setQuery('');
    setResults([]);
    setOpen(false);
    setMessage('');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setMessage('Your browser does not support location.');
    setMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMessage('');
        pick({
          id: locationId(coords.latitude, coords.longitude),
          name: 'My location',
          region: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
          lat: coords.latitude,
          lon: coords.longitude,
        });
      },
      (err) =>
        setMessage(
          err.code === 1
            ? 'Location permission was denied. Allow it in your browser settings or search for a city.'
            : 'Could not get your location. Please search for a city instead.'
        ),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  return (
    <section className="locationbar">
      <div className="search-row">
        <div className="search-box" ref={boxRef}>
          <input
            type="search"
            placeholder="Search for a city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            aria-label="Search for a city"
          />
          {searching && <span className="mini-spinner" aria-hidden="true" />}
          {open && (results.length > 0 || message) && (
            <ul className="results">
              {results.map((r) => (
                <li key={r.id}>
                  <button onClick={() => pick(r)}>
                    <strong>{r.name}</strong>
                    <span>{r.region}</span>
                  </button>
                </li>
              ))}
              {!results.length && message && <li className="results-msg">{message}</li>}
            </ul>
          )}
        </div>
        <button className="btn" onClick={useMyLocation}>📍 Use my location</button>
        {active && !isSaved && (
          <button className="btn primary" onClick={() => onSave(active)}>☆ Save {active.name}</button>
        )}
      </div>

      {message && !open && <p className="hint">{message}</p>}

      {saved.length > 0 && (
        <div className="chips" aria-label="Saved locations">
          {saved.map((l) => (
            <span key={l.id} className={active?.id === l.id ? 'chip active' : 'chip'}>
              <button className="chip-name" onClick={() => onSelect(l)}>★ {l.name}</button>
              <button
                className="chip-x"
                aria-label={`Remove ${l.name}`}
                onClick={() => confirm(`Remove ${l.name} and its alert rules?`) && onRemove(l.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
