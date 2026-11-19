// All calls to Open-Meteo live here. No API key is needed.
// Responses are cached in localStorage for 10 minutes. If the network fails,
// the last cached copy is returned (marked `stale`) so the app still works offline.

import { load, save } from './storage.js';

const CACHE_PREFIX = 'skywatch.cache:';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // delete cached entries older than a day

async function fetchJSON(url, { force = false } = {}) {
  const key = CACHE_PREFIX + url;
  const cached = load(key, null);

  if (!force && cached && Date.now() - cached.at < CACHE_TTL) {
    return { data: cached.data, at: cached.at, stale: false };
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather service error (${res.status})`);
    const data = await res.json();
    if (data.error) throw new Error(data.reason || 'Weather service error');
    const at = Date.now();
    save(key, { at, data });
    return { data, at, stale: false };
  } catch (err) {
    if (cached) return { data: cached.data, at: cached.at, stale: true };
    throw new Error(navigator.onLine ? err.message : 'You are offline and there is no saved data for this location yet.');
  }
}

/** Remove old cache entries so localStorage doesn't fill up. Called once on start. */
export function pruneCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => {
        const entry = load(k, null);
        if (!entry || Date.now() - entry.at > CACHE_MAX_AGE) localStorage.removeItem(k);
      });
  } catch {
    /* ignore */
  }
}

/** Build a stable id for a location from its coordinates. */
export const locationId = (lat, lon) => `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;

/** City search (Open-Meteo geocoding API). */
export async function searchCities(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const { data } = await fetchJSON(url);
  return (data.results || []).map((r) => ({
    id: locationId(r.latitude, r.longitude),
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }));
}

const CURRENT_VARS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation',
  'weather_code', 'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'uv_index', 'visibility',
].join(',');
const HOURLY_VARS = ['temperature_2m', 'precipitation_probability', 'weather_code', 'wind_speed_10m', 'uv_index', 'is_day'].join(',');
const DAILY_VARS = ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max', 'sunrise', 'sunset', 'uv_index_max'].join(',');

/**
 * Fetch forecast + air quality for one location and reshape it into
 * { current, hourly[48], daily[7], aqi, updatedAt, stale }.
 */
export async function getWeather(loc, { force = false } = {}) {
  const base = `latitude=${loc.lat}&longitude=${loc.lon}&timezone=auto`;
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?${base}&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}&forecast_days=7&wind_speed_unit=kmh`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${base}&current=us_aqi,pm2_5,pm10`;

  const [forecast, air] = await Promise.all([
    fetchJSON(forecastUrl, { force }),
    fetchJSON(airUrl, { force }).catch(() => null), // air quality is optional
  ]);

  return { ...normalize(forecast.data, air?.data), updatedAt: forecast.at, stale: forecast.stale };
}

function normalize(f, aq) {
  const c = f.current;
  const h = f.hourly;
  const d = f.daily;

  // Hourly data starts at midnight; find the current hour and take the next 48.
  const nowHour = c.time.slice(0, 13); // "2026-11-19T15"
  let start = h.time.findIndex((t) => t.slice(0, 13) >= nowHour);
  if (start < 0) start = 0;

  const hourly = h.time.slice(start, start + 48).map((time, i) => {
    const j = start + i;
    return {
      time,
      temp: h.temperature_2m[j],
      rainProb: h.precipitation_probability[j],
      code: h.weather_code[j],
      wind: h.wind_speed_10m[j],
      uv: h.uv_index[j],
      isDay: h.is_day[j] === 1,
    };
  });

  const daily = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i],
    max: d.temperature_2m_max[i],
    min: d.temperature_2m_min[i],
    rainProb: d.precipitation_probability_max[i],
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    uvMax: d.uv_index_max[i],
  }));

  const current = {
    time: c.time,
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    windDir: c.wind_direction_10m,
    pressure: c.surface_pressure,
    uv: c.uv_index ?? hourly[0]?.uv,
    visibility: c.visibility, // metres
    precip: c.precipitation, // mm
    code: c.weather_code,
    isDay: c.is_day === 1,
    sunrise: daily[0]?.sunrise,
    sunset: daily[0]?.sunset,
    // Highest chance of rain over the next 12 hours (used by alerts)
    rainProbNext12: Math.max(0, ...hourly.slice(0, 12).map((x) => x.rainProb ?? 0)),
  };

  const aqi = aq?.current
    ? { value: aq.current.us_aqi, pm25: aq.current.pm2_5, pm10: aq.current.pm10 }
    : null;

  return { current, hourly, daily, aqi, timezone: f.timezone };
}
