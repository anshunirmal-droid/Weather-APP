// The app always fetches data in metric units (°C, km/h) and converts for display.
// Alert thresholds are also stored in metric, so switching units never breaks a rule.

export const toTemp = (c, unit) => (unit === 'F' ? (c * 9) / 5 + 32 : c);
export const fromTemp = (v, unit) => (unit === 'F' ? ((v - 32) * 5) / 9 : v);
export const fmtTemp = (c, unit, digits = 0) =>
  c == null ? '—' : `${toTemp(c, unit).toFixed(digits)}°${unit}`;

export const toWind = (kmh, unit) => (unit === 'mph' ? kmh * 0.621371 : kmh);
export const fromWind = (v, unit) => (unit === 'mph' ? v / 0.621371 : v);
export const windLabel = (unit) => (unit === 'mph' ? 'mph' : 'km/h');
export const fmtWind = (kmh, unit) =>
  kmh == null ? '—' : `${Math.round(toWind(kmh, unit))} ${windLabel(unit)}`;

const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
/** Degrees → compass direction, e.g. 225 → "SW" */
export const compass = (deg) => (deg == null ? '' : POINTS[Math.round(deg / 22.5) % 16]);

/** UV index → label */
export function uvLevel(uv) {
  if (uv == null) return { label: '—', tone: 'muted' };
  if (uv < 3) return { label: 'Low', tone: 'good' };
  if (uv < 6) return { label: 'Moderate', tone: 'moderate' };
  if (uv < 8) return { label: 'High', tone: 'usg' };
  if (uv < 11) return { label: 'Very high', tone: 'unhealthy' };
  return { label: 'Extreme', tone: 'very-unhealthy' };
}

/** "2026-11-19T06:21" (location-local time from the API) → "06:21" */
export const hhmm = (s) => (s ? s.slice(11, 16) : '—');

/** "2026-11-19" → "Thu" (or "Today") */
export function weekday(dateStr, index) {
  if (index === 0) return 'Today';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
}

/** Timestamp (ms) → "3:45 PM" in the viewer's own time */
export const clock = (ms) =>
  new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const dateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
