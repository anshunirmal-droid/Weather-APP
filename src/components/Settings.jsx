/** Units, theme, default location and data reset. */
function Segmented({ value, options, onChange, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          className={value === v ? 'seg active' : 'seg'}
          onClick={() => onChange(v)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function Settings({ settings, setSettings, saved }) {
  const update = (patch) => setSettings({ ...settings, ...patch });

  const resetAll = () => {
    if (!confirm('Delete all saved locations, alert rules, history and settings?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('skywatch.'))
      .forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  return (
    <div className="settings card">
      <h2>Settings</h2>

      <div className="setting">
        <div>
          <strong>Temperature</strong>
          <p className="muted small">Alert thresholds convert automatically.</p>
        </div>
        <Segmented label="Temperature unit" value={settings.tempUnit} onChange={(v) => update({ tempUnit: v })} options={[['C', '°C'], ['F', '°F']]} />
      </div>

      <div className="setting">
        <strong>Wind speed</strong>
        <Segmented label="Wind unit" value={settings.windUnit} onChange={(v) => update({ windUnit: v })} options={[['kmh', 'km/h'], ['mph', 'mph']]} />
      </div>

      <div className="setting">
        <strong>Theme</strong>
        <Segmented label="Theme" value={settings.theme} onChange={(v) => update({ theme: v })} options={[['light', '☀️ Light'], ['dark', '🌙 Dark']]} />
      </div>

      <div className="setting">
        <div>
          <strong>Default location</strong>
          <p className="muted small">Opens automatically when you start the app.</p>
        </div>
        <select
          value={settings.defaultId || ''}
          onChange={(e) => update({ defaultId: e.target.value || null })}
          disabled={!saved.length}
        >
          <option value="">{saved.length ? 'Last viewed location' : 'Save a location first'}</option>
          {saved.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="setting">
        <div>
          <strong>Reset app</strong>
          <p className="muted small">Your data is stored only in this browser on this device.</p>
        </div>
        <button className="btn danger" onClick={resetAll}>Delete all data</button>
      </div>
    </div>
  );
}
