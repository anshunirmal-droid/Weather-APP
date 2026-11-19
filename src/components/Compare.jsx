import { weatherInfo, summary } from '../utils/weatherCodes.js';
import { aqiLevel } from '../utils/aqi.js';
import { fmtTemp, fmtWind, clock } from '../utils/units.js';
import StatusMessage from './StatusMessage.jsx';

/** Side-by-side current conditions for every saved location. */
export default function Compare({ saved, store, settings, onOpen, onRetry }) {
  if (!saved.length) {
    return (
      <StatusMessage
        icon="🗺️"
        title="Nothing to compare yet"
        text="Save two or more locations (☆ Save) to compare them side by side."
      />
    );
  }

  return (
    <div className="compare">
      {saved.map((loc) => {
        const entry = store[loc.id];
        const w = entry?.data;

        if (!w) {
          return (
            <div key={loc.id} className="card compare-card">
              <h3>{loc.name}</h3>
              {entry?.error ? (
                <>
                  <p className="error">{entry.error}</p>
                  <button className="btn small" onClick={() => onRetry(loc)}>Try again</button>
                </>
              ) : (
                <div className="spinner small" aria-label="Loading" />
              )}
            </div>
          );
        }

        const c = w.current;
        const info = weatherInfo(c.code, c.isDay);
        const aqi = aqiLevel(w.aqi?.value);

        return (
          <button key={loc.id} className={`card compare-card sky-${c.isDay ? info.sky : 'night'}`} onClick={() => onOpen(loc)}>
            <div className="compare-top">
              <div>
                <h3>{loc.name}</h3>
                <div className="muted small">{loc.region}</div>
              </div>
              <span className="compare-icon" aria-hidden="true">{info.icon}</span>
            </div>
            <div className="compare-temp">{fmtTemp(c.temp, settings.tempUnit)}</div>
            <div className="compare-summary">{summary(c.code, c.wind)}</div>
            <dl className="compare-stats">
              <div><dt>Feels like</dt><dd>{fmtTemp(c.feelsLike, settings.tempUnit)}</dd></div>
              <div><dt>Humidity</dt><dd>{c.humidity}%</dd></div>
              <div><dt>Wind</dt><dd>{fmtWind(c.wind, settings.windUnit)}</dd></div>
              <div><dt>Rain (12h)</dt><dd>{c.rainProbNext12}%</dd></div>
              <div><dt>UV</dt><dd>{c.uv != null ? c.uv.toFixed(1) : '—'}</dd></div>
              <div>
                <dt>AQI</dt>
                <dd><span className={`aqi-dot tone-${aqi.tone}`} /> {w.aqi?.value ?? '—'}</dd>
              </div>
            </dl>
            <div className="muted small">Updated {clock(w.updatedAt)}{w.stale ? ' · saved copy' : ''}</div>
          </button>
        );
      })}
    </div>
  );
}
