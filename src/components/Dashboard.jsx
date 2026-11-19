import { weatherInfo, summary } from '../utils/weatherCodes.js';
import { aqiLevel } from '../utils/aqi.js';
import { fmtTemp, fmtWind, compass, uvLevel, hhmm, clock } from '../utils/units.js';

function Tile({ label, value, sub, tone, children }) {
  return (
    <div className={`tile ${tone ? `tone-${tone}` : ''}`}>
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {sub && <div className="tile-sub">{sub}</div>}
      {children}
    </div>
  );
}

export default function Dashboard({ location, weather, loading, error, settings, activeAlerts, describe, onRefresh }) {
  const c = weather.current;
  const today = weather.daily[0];
  const info = weatherInfo(c.code, c.isDay);
  const aqi = aqiLevel(weather.aqi?.value);
  const uv = uvLevel(c.uv);
  const { tempUnit, windUnit } = settings;

  return (
    <div className="dashboard">
      {activeAlerts.length > 0 && (
        <div className="banner alert">
          <strong>⚠️ Active alerts</strong>
          <ul>
            {activeAlerts.map((a) => (
              <li key={a.rule.id}>{describe(a.rule, a.value)}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="hero card">
        <div className="hero-main">
          <div className="hero-icon" aria-hidden="true">{info.icon}</div>
          <div>
            <h1 className="place">
              {location.name}
              {location.region && <span className="region">{location.region}</span>}
            </h1>
            <div className="hero-temp">{fmtTemp(c.temp, tempUnit)}</div>
            <div className="hero-summary">{summary(c.code, c.wind)}</div>
            <div className="hero-sub">
              Feels like {fmtTemp(c.feelsLike, tempUnit)} · H {fmtTemp(today?.max, tempUnit)} · L {fmtTemp(today?.min, tempUnit)}
            </div>
          </div>
        </div>
        <div className="hero-meta">
          <span>
            Last updated {clock(weather.updatedAt)}
            {weather.stale && <span className="stale"> · saved copy</span>}
          </span>
          <button className="btn small" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
          <span className="muted">Auto-refreshes every 15 min</span>
        </div>
        {error && <p className="error">Latest refresh failed: {error}</p>}
      </section>

      <section className="tiles">
        <Tile label="Air quality (US AQI)" value={weather.aqi?.value ?? '—'} sub={aqi.label} tone={aqi.tone}>
          {weather.aqi && (
            <div className="tile-foot">
              PM2.5 {Math.round(weather.aqi.pm25 ?? 0)} · PM10 {Math.round(weather.aqi.pm10 ?? 0)} µg/m³
            </div>
          )}
        </Tile>
        <Tile label="Feels like" value={fmtTemp(c.feelsLike, tempUnit)} />
        <Tile label="Humidity" value={`${c.humidity ?? '—'}%`} />
        <Tile
          label="Wind"
          value={fmtWind(c.wind, windUnit)}
          sub={
            <span>
              <span className="wind-arrow" style={{ transform: `rotate(${(c.windDir ?? 0) + 180}deg)` }} aria-hidden="true">↑</span>{' '}
              from {compass(c.windDir)}
            </span>
          }
        />
        <Tile label="Pressure" value={c.pressure != null ? `${Math.round(c.pressure)} hPa` : '—'} />
        <Tile label="UV index" value={c.uv != null ? c.uv.toFixed(1) : '—'} sub={uv.label} tone={uv.tone} />
        <Tile
          label="Visibility"
          value={c.visibility != null ? `${(c.visibility / 1000).toFixed(c.visibility < 10000 ? 1 : 0)} km` : '—'}
        />
        <Tile label="Rainfall (now)" value={`${c.precip ?? 0} mm`} sub={`${c.rainProbNext12}% chance in next 12h`} />
        <Tile label="Sunrise" value={hhmm(c.sunrise)} sub="🌅" />
        <Tile label="Sunset" value={hhmm(c.sunset)} sub="🌇" />
      </section>

      {weather.aqi && <p className="hint">{aqi.advice}</p>}
    </div>
  );
}
