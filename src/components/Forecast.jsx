import { weatherInfo } from '../utils/weatherCodes.js';
import { fmtTemp, fmtWind, weekday, hhmm } from '../utils/units.js';
import ForecastChart from './ForecastChart.jsx';

export default function Forecast({ weather, settings, location }) {
  const { tempUnit, windUnit } = settings;

  // Range across the week, used to draw each day's temperature bar.
  const lo = Math.min(...weather.daily.map((d) => d.min));
  const hi = Math.max(...weather.daily.map((d) => d.max));
  const span = hi - lo || 1;

  return (
    <div className="forecast">
      <section className="card">
        <h3>Next 48 hours · {location.name}</h3>
        <div className="hourly" role="list">
          {weather.hourly.map((h, i) => {
            const info = weatherInfo(h.code, h.isDay);
            const newDay = i > 0 && h.time.slice(11, 13) === '00';
            return (
              <div key={h.time} className={newDay ? 'hour new-day' : 'hour'} role="listitem" title={info.label}>
                <div className="hour-time">{i === 0 ? 'Now' : newDay ? weekday(h.time.slice(0, 10)) : hhmm(h.time)}</div>
                <div className="hour-icon" aria-hidden="true">{info.icon}</div>
                <div className="hour-temp">{fmtTemp(h.temp, tempUnit)}</div>
                <div className="hour-rain">💧 {h.rainProb ?? 0}%</div>
                <div className="hour-wind">{fmtWind(h.wind, windUnit)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Temperature & rain chance</h3>
        <ForecastChart hourly={weather.hourly} tempUnit={tempUnit} dark={settings.theme === 'dark'} />
      </section>

      <section className="card">
        <h3>7-day forecast</h3>
        <ul className="daily">
          {weather.daily.map((d, i) => {
            const info = weatherInfo(d.code, true);
            return (
              <li key={d.date}>
                <span className="day-name">{weekday(d.date, i)}</span>
                <span className="day-icon" title={info.label} aria-hidden="true">{info.icon}</span>
                <span className="day-label">{info.label}</span>
                <span className="day-rain">💧 {d.rainProb ?? 0}%</span>
                <span className="day-min">{fmtTemp(d.min, tempUnit)}</span>
                <span className="day-bar">
                  <span
                    className="day-bar-fill"
                    style={{ left: `${((d.min - lo) / span) * 100}%`, width: `${Math.max(((d.max - d.min) / span) * 100, 4)}%` }}
                  />
                </span>
                <span className="day-max">{fmtTemp(d.max, tempUnit)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
