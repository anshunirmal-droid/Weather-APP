import { useState } from 'react';
import { METRICS, formatMetric } from '../hooks/useAlerts.js';
import { fromTemp, fromWind, windLabel, dateTime } from '../utils/units.js';
import StatusMessage from './StatusMessage.jsx';

/** Unit shown next to the threshold input for each metric type. */
function unitFor(metric, settings) {
  const kind = METRICS[metric].kind;
  if (kind === 'temp') return `°${settings.tempUnit}`;
  if (kind === 'wind') return windLabel(settings.windUnit);
  if (kind === 'percent') return '%';
  return '';
}

/** Convert the number typed by the user into metric units for storage. */
function toStored(metric, value, settings) {
  const kind = METRICS[metric].kind;
  if (kind === 'temp') return fromTemp(value, settings.tempUnit);
  if (kind === 'wind') return fromWind(value, settings.windUnit);
  return value;
}

export default function Alerts({ alerts, saved, settings }) {
  const [form, setForm] = useState({ locationId: '', metric: 'temp', op: 'above', value: '' });
  const [error, setError] = useState('');

  const locationName = (id) => saved.find((l) => l.id === id)?.name || 'Removed location';

  const submit = (e) => {
    e.preventDefault();
    const locationId = form.locationId || saved[0]?.id;
    const num = parseFloat(form.value);
    if (!locationId) return setError('Save a location first.');
    if (Number.isNaN(num)) return setError('Enter a number for the threshold.');
    alerts.addRule({
      locationId,
      metric: form.metric,
      op: form.op,
      value: toStored(form.metric, num, settings),
    });
    setForm({ ...form, value: '' });
    setError('');
  };

  if (!saved.length) {
    return (
      <StatusMessage
        icon="🔔"
        title="Save a location to set alerts"
        text="Search for a city above, open it, and press “☆ Save”. Then come back here to create alert rules."
      />
    );
  }

  return (
    <div className="alerts">
      <section className="card">
        <div className="card-head">
          <h3>🔔 Active alerts</h3>
          {alerts.permission === 'granted' ? (
            <span className="pill ok">Browser notifications on</span>
          ) : alerts.permission === 'unsupported' ? (
            <span className="pill">Notifications not supported in this browser</span>
          ) : alerts.permission === 'denied' ? (
            <span className="pill warn">Notifications blocked in browser settings</span>
          ) : (
            <button className="btn small primary" onClick={alerts.enableNotifications}>Enable notifications</button>
          )}
        </div>
        {alerts.active.length ? (
          <ul className="alert-list">
            {alerts.active.map((a) => (
              <li key={a.rule.id} className="alert-item">⚠️ {alerts.describe(a.rule, a.value)}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No alerts triggered right now.</p>
        )}
      </section>

      <section className="card">
        <h3>Create an alert rule</h3>
        <form className="rule-form" onSubmit={submit}>
          <label>
            <span>Location</span>
            <select value={form.locationId || saved[0].id} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              {saved.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>When</span>
            <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
              {Object.entries(METRICS).map(([k, m]) => (
                <option key={k} value={k}>{m.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Is</span>
            <select value={form.op} onChange={(e) => setForm({ ...form, op: e.target.value })}>
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
          </label>
          <label>
            <span>Threshold {unitFor(form.metric, settings) && `(${unitFor(form.metric, settings)})`}</span>
            <input
              type="number"
              step="any"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 35"
            />
          </label>
          <button className="btn primary" type="submit">Add rule</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="hint">Rules are checked every time the weather refreshes (every 15 minutes while the app is open).</p>
      </section>

      <section className="card">
        <h3>Your rules ({alerts.rules.length})</h3>
        {alerts.rules.length ? (
          <ul className="rule-list">
            {alerts.rules.map((r) => {
              const triggered = alerts.active.some((a) => a.rule.id === r.id);
              return (
                <li key={r.id} className={r.enabled ? '' : 'disabled'}>
                  <span className={triggered ? 'dot on' : 'dot'} title={triggered ? 'Triggered' : 'Not triggered'} />
                  <span className="rule-text">
                    <strong>{locationName(r.locationId)}</strong>: {METRICS[r.metric].label} {r.op}{' '}
                    {formatMetric(r.metric, r.value, settings)}
                  </span>
                  <label className="switch">
                    <input type="checkbox" checked={r.enabled} onChange={() => alerts.toggleRule(r.id)} />
                    <span>{r.enabled ? 'On' : 'Off'}</span>
                  </label>
                  <button className="btn small ghost danger" onClick={() => alerts.deleteRule(r.id)}>Delete</button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">No rules yet. Create one above.</p>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Alert history</h3>
          {alerts.log.length > 0 && (
            <button className="btn small ghost" onClick={() => confirm('Clear alert history?') && alerts.clearLog()}>
              Clear
            </button>
          )}
        </div>
        {alerts.log.length ? (
          <ul className="history">
            {alerts.log.map((e) => (
              <li key={e.id}>
                <span>{e.message}</span>
                <time>{dateTime(e.at)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Triggered alerts will be listed here (once per rule per day).</p>
        )}
      </section>
    </div>
  );
}
