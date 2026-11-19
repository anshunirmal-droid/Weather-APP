// Open-Meteo returns WMO weather codes. This maps each code to a label, an icon
// and a "sky" category used to tint the page background.
// Full list: https://open-meteo.com/en/docs (section "WMO Weather interpretation codes")

const CODES = {
  0: { label: 'Clear sky', day: '☀️', night: '🌙', sky: 'clear' },
  1: { label: 'Mainly clear', day: '🌤️', night: '🌙', sky: 'clear' },
  2: { label: 'Partly cloudy', day: '⛅', night: '☁️', sky: 'cloudy' },
  3: { label: 'Overcast', day: '☁️', night: '☁️', sky: 'cloudy' },
  45: { label: 'Fog', day: '🌫️', night: '🌫️', sky: 'fog' },
  48: { label: 'Freezing fog', day: '🌫️', night: '🌫️', sky: 'fog' },
  51: { label: 'Light drizzle', day: '🌦️', night: '🌧️', sky: 'rain' },
  53: { label: 'Drizzle', day: '🌦️', night: '🌧️', sky: 'rain' },
  55: { label: 'Heavy drizzle', day: '🌧️', night: '🌧️', sky: 'rain' },
  56: { label: 'Freezing drizzle', day: '🌧️', night: '🌧️', sky: 'rain' },
  57: { label: 'Heavy freezing drizzle', day: '🌧️', night: '🌧️', sky: 'rain' },
  61: { label: 'Light rain', day: '🌦️', night: '🌧️', sky: 'rain' },
  63: { label: 'Rain', day: '🌧️', night: '🌧️', sky: 'rain' },
  65: { label: 'Heavy rain', day: '🌧️', night: '🌧️', sky: 'rain' },
  66: { label: 'Freezing rain', day: '🌧️', night: '🌧️', sky: 'rain' },
  67: { label: 'Heavy freezing rain', day: '🌧️', night: '🌧️', sky: 'rain' },
  71: { label: 'Light snow', day: '🌨️', night: '🌨️', sky: 'snow' },
  73: { label: 'Snow', day: '❄️', night: '❄️', sky: 'snow' },
  75: { label: 'Heavy snow', day: '❄️', night: '❄️', sky: 'snow' },
  77: { label: 'Snow grains', day: '🌨️', night: '🌨️', sky: 'snow' },
  80: { label: 'Light showers', day: '🌦️', night: '🌧️', sky: 'rain' },
  81: { label: 'Showers', day: '🌧️', night: '🌧️', sky: 'rain' },
  82: { label: 'Violent showers', day: '⛈️', night: '⛈️', sky: 'storm' },
  85: { label: 'Snow showers', day: '🌨️', night: '🌨️', sky: 'snow' },
  86: { label: 'Heavy snow showers', day: '❄️', night: '❄️', sky: 'snow' },
  95: { label: 'Thunderstorm', day: '⛈️', night: '⛈️', sky: 'storm' },
  96: { label: 'Thunderstorm with hail', day: '⛈️', night: '⛈️', sky: 'storm' },
  99: { label: 'Severe thunderstorm with hail', day: '⛈️', night: '⛈️', sky: 'storm' },
};

const UNKNOWN = { label: 'Unknown', day: '🌡️', night: '🌡️', sky: 'cloudy' };

/** Returns { label, icon, sky } for a weather code. */
export function weatherInfo(code, isDay = true) {
  const c = CODES[code] || UNKNOWN;
  return { label: c.label, icon: isDay ? c.day : c.night, sky: c.sky };
}

/** Plain-language summary, e.g. "Light rain, breezy". Wind is in km/h. */
export function summary(code, windKmh) {
  let text = weatherInfo(code).label;
  if (windKmh >= 50) text += ', very windy';
  else if (windKmh >= 30) text += ', windy';
  else if (windKmh >= 18) text += ', breezy';
  return text;
}
