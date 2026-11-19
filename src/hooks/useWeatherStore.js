import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather } from '../utils/api.js';

const AUTO_REFRESH = 15 * 60 * 1000; // 15 minutes

/**
 * Loads and keeps weather for a list of locations.
 * Returns store = { [locationId]: { data, loading, error } }.
 */
export function useWeatherStore(locations, online) {
  const [store, setStore] = useState({});
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  const fetchOne = useCallback(async (loc, force = false) => {
    setStore((s) => ({ ...s, [loc.id]: { ...s[loc.id], loading: true, error: null } }));
    try {
      const data = await getWeather(loc, { force });
      setStore((s) => ({ ...s, [loc.id]: { data, loading: false, error: null } }));
    } catch (err) {
      setStore((s) => ({
        ...s,
        [loc.id]: { ...s[loc.id], loading: false, error: err.message || 'Could not load weather.' },
      }));
    }
  }, []);

  const refreshAll = useCallback(
    (force = false) => locationsRef.current.forEach((l) => fetchOne(l, force)),
    [fetchOne]
  );

  // Load any location we haven't fetched yet (e.g. a newly added city).
  const ids = locations.map((l) => l.id).join('|');
  useEffect(() => {
    locations.forEach((l) => {
      if (!store[l.id]) fetchOne(l);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  // Auto-refresh every 15 minutes.
  useEffect(() => {
    const timer = setInterval(() => refreshAll(true), AUTO_REFRESH);
    return () => clearInterval(timer);
  }, [refreshAll]);

  // When the connection comes back, refresh everything.
  useEffect(() => {
    if (online) refreshAll();
  }, [online, refreshAll]);

  return { store, refresh: fetchOne, refreshAll };
}
