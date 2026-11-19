// US AQI scale (0–500), the one returned by Open-Meteo's `us_aqi` field.

const LEVELS = [
  { max: 50, label: 'Good', tone: 'good', advice: 'Air quality is satisfactory.' },
  { max: 100, label: 'Moderate', tone: 'moderate', advice: 'Acceptable; very sensitive people should take care.' },
  { max: 150, label: 'Unhealthy for sensitive groups', tone: 'usg', advice: 'Sensitive groups should limit long outdoor exertion.' },
  { max: 200, label: 'Unhealthy', tone: 'unhealthy', advice: 'Everyone may begin to feel effects; limit outdoor activity.' },
  { max: 300, label: 'Very unhealthy', tone: 'very-unhealthy', advice: 'Health alert: avoid prolonged outdoor activity.' },
  { max: Infinity, label: 'Hazardous', tone: 'hazardous', advice: 'Emergency conditions: stay indoors.' },
];

export function aqiLevel(value) {
  if (value == null) return { label: 'Not available', tone: 'muted', advice: '' };
  return LEVELS.find((l) => value <= l.max);
}
