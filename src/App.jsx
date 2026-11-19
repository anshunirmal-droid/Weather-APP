import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useOnline } from './hooks/useOnline.js';
import { useWeatherStore } from './hooks/useWeatherStore.js';
import { useAlerts } from './hooks/useAlerts.js';
import { pruneCache } from './utils/api.js';
import { weatherInfo } from './utils/weatherCodes.js';
import LocationBar from './components/LocationBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Forecast from './components/Forecast.jsx';
import Alerts from './components/Alerts.jsx';
import Compare from './components/Compare.jsx';
import Settings from './components/Settings.jsx';
import StatusMessage from './components/StatusMessage.jsx';

const VIEWS = ['Dashboard', 'Forecast', 'Alerts', 'Compare', 'Settings'];

const DEFAULT_SETTINGS = { tempUnit: 'C', windUnit: 'kmh', theme: 'light', defaultId: null };

export default function App() {
  const [saved, setSaved] = useLocalStorage('skywatch.locations', []);
  const [rawSettings, setSettings] = useLocalStorage('skywatch.settings', DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...rawSettings };
  const [active, setActive] = useLocalStorage('skywatch.active', null);
  const [view, setView] = useState('Dashboard');
  const online = useOnline();

  // On start: tidy the cache and open the default location (if one is set).
  useEffect(() => {
    pruneCache();
    const def = saved.find((l) => l.id === settings.defaultId);
    if (def) setActive(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Weather is loaded for every saved location plus the one being viewed.
  const watched = useMemo(() => {
    const list = [...saved];
    if (active && !saved.some((l) => l.id === active.id)) list.push(active);
    return list;
  }, [saved, active]);

  const { store, refresh } = useWeatherStore(watched, online);
  const alerts = useAlerts(saved, store, settings);

  const entry = active ? store[active.id] : null;
  const weather = entry?.data;

  // Theme (light/dark) and background tint based on current conditions.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    let sky = 'default';
    if (weather) sky = weather.current.isDay ? weatherInfo(weather.current.code).sky : 'night';
    document.body.dataset.sky = sky;
  }, [weather]);

  const isSaved = !!active && saved.some((l) => l.id === active.id);

  const saveLocation = (loc) => {
    if (!saved.some((l) => l.id === loc.id)) setSaved((s) => [...s, loc]);
  };

  const removeLocation = (id) => {
    setSaved((s) => s.filter((l) => l.id !== id));
    alerts.removeRulesFor(id);
    if (settings.defaultId === id) setSettings({ ...settings, defaultId: null });
  };

  const openLocation = (loc) => {
    setActive(loc);
    if (view === 'Settings' || view === 'Compare' || view === 'Alerts') setView('Dashboard');
  };

  // Shared rendering for views that need a selected location with data.
  const needsWeather = (render) => {
    if (!active) {
      return (
        <StatusMessage
          icon="🌍"
          title="Welcome to SkyWatch"
          text="Search for a city above or tap “Use my location” to see live weather."
        />
      );
    }
    if (!weather && entry?.error) {
      return (
        <StatusMessage
          icon="⚠️"
          title="Couldn't load the weather"
          text={entry.error}
          action={{ label: 'Try again', onClick: () => refresh(active, true) }}
        />
      );
    }
    if (!weather) return <StatusMessage loading title={`Loading weather for ${active.name}…`} />;
    return render(weather);
  };

  const alertCount = alerts.active.length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/favicon.svg" alt="" width="30" height="30" />
          <span>SkyWatch</span>
        </div>
        <nav className="tabs" aria-label="Main">
          {VIEWS.map((v) => (
            <button key={v} className={view === v ? 'tab active' : 'tab'} onClick={() => setView(v)}>
              {v}
              {v === 'Alerts' && alertCount > 0 && <span className="badge">{alertCount}</span>}
            </button>
          ))}
        </nav>
      </header>

      {!online && (
        <div className="banner offline">📴 You're offline — showing the last saved data. It will refresh when you reconnect.</div>
      )}

      <main className="content">
        {view !== 'Settings' && (
          <LocationBar
            active={active}
            saved={saved}
            isSaved={isSaved}
            onSelect={openLocation}
            onSave={saveLocation}
            onRemove={removeLocation}
          />
        )}

        {view === 'Dashboard' &&
          needsWeather((w) => (
            <Dashboard
              location={active}
              weather={w}
              loading={entry?.loading}
              error={entry?.error}
              settings={settings}
              activeAlerts={alerts.active.filter((a) => a.rule.locationId === active.id)}
              describe={alerts.describe}
              onRefresh={() => refresh(active, true)}
            />
          ))}

        {view === 'Forecast' && needsWeather((w) => <Forecast weather={w} settings={settings} location={active} />)}

        {view === 'Alerts' && <Alerts alerts={alerts} saved={saved} settings={settings} />}

        {view === 'Compare' && (
          <Compare saved={saved} store={store} settings={settings} onOpen={openLocation} onRetry={(l) => refresh(l, true)} />
        )}

        {view === 'Settings' && (
          <Settings settings={settings} setSettings={setSettings} saved={saved} />
        )}
      </main>

      <footer className="footer">
        Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>
      </footer>
    </div>
  );
}
