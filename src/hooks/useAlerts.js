import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { uid } from '../utils/storage.js';
import { fmtTemp, fmtWind } from '../utils/units.js';

/**
 * Alert metrics. `get` reads the value from a location's weather data.
 * Thresholds are stored in metric units (°C, km/h).
 * To add a new alert type, add an entry here.
 */
export const METRICS = {
  temp: { label: 'Temperature', kind: 'temp', get: (w) => w.current.temp },
  rain: { label: 'Rain chance (next 12h)', kind: 'percent', get: (w) => w.current.rainProbNext12 },
  wind: { label: 'Wind speed', kind: 'wind', get: (w) => w.current.wind },
  aqi: { label: 'Air quality (US AQI)', kind: 'number', get: (w) => w.aqi?.value },
  uv: { label: 'UV index', kind: 'number', get: (w) => w.current.uv },
};

/** Format a metric value in the user's chosen units. */
export function formatMetric(metric, value, settings) {
  if (value == null) return '—';
  const kind = METRICS[metric].kind;
  if (kind === 'temp') return fmtTemp(value, settings.tempUnit, 1);
  if (kind === 'wind') return fmtWind(value, settings.windUnit);
  if (kind === 'percent') return `${Math.round(value)}%`;
  return `${Math.round(value * 10) / 10}`;
}

/** Returns the current value if the rule is triggered, otherwise null. */
function evaluate(rule, weather) {
  const value = METRICS[rule.metric]?.get(weather);
  if (value == null) return null;
  const hit = rule.op === 'above' ? value > rule.value : value < rule.value;
  return hit ? value : null;
}

const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

export function useAlerts(locations, store, settings) {
  const [rules, setRules] = useLocalStorage('skywatch.rules', []);
  const [log, setLog] = useLocalStorage('skywatch.alertLog', []);
  const [notified, setNotified] = useLocalStorage('skywatch.notified', {});
  const [permission, setPermission] = useState(
    notificationsSupported ? Notification.permission : 'unsupported'
  );

  const describe = (rule, value) => {
    const loc = locations.find((l) => l.id === rule.locationId);
    const m = METRICS[rule.metric];
    return `${loc?.name || 'Location'}: ${m.label} is ${formatMetric(rule.metric, value, settings)} (${rule.op} ${formatMetric(rule.metric, rule.value, settings)})`;
  };

  // Rules that are triggered right now, based on the latest data.
  const active = useMemo(
    () =>
      rules
        .filter((r) => r.enabled)
        .flatMap((rule) => {
          const w = store[rule.locationId]?.data;
          if (!w) return [];
          const value = evaluate(rule, w);
          return value == null ? [] : [{ rule, value }];
        }),
    [rules, store]
  );

  // Log + notify each triggered rule at most once per day.
  const today = new Date().toDateString();
  const activeKey = active.map((a) => a.rule.id).join('|') + today;
  useEffect(() => {
    const fresh = active.filter((a) => notified[a.rule.id] !== today);
    if (!fresh.length) return;

    const entries = fresh.map((a) => ({
      id: uid(),
      ruleId: a.rule.id,
      locationId: a.rule.locationId,
      message: describe(a.rule, a.value),
      at: new Date().toISOString(),
    }));

    if (permission === 'granted') {
      entries.forEach((e) => {
        try {
          new Notification('⚠️ SkyWatch alert', { body: e.message, icon: '/favicon.svg', tag: e.ruleId });
        } catch {
          /* some mobile browsers block this */
        }
      });
    }

    setLog((l) => [...entries, ...l].slice(0, 200)); // keep the latest 200
    setNotified((n) => ({ ...n, ...Object.fromEntries(fresh.map((a) => [a.rule.id, today])) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, permission]);

  const addRule = (rule) => setRules((rs) => [...rs, { ...rule, id: uid(), enabled: true }]);
  const toggleRule = (id) => setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  const deleteRule = (id) => setRules((rs) => rs.filter((r) => r.id !== id));
  const removeRulesFor = (locationId) => setRules((rs) => rs.filter((r) => r.locationId !== locationId));
  const clearLog = () => setLog([]);

  const enableNotifications = async () => {
    if (!notificationsSupported) return;
    setPermission(await Notification.requestPermission());
  };

  return {
    rules, active, log, permission, describe,
    addRule, toggleRule, deleteRule, removeRulesFor, clearLog, enableNotifications,
  };
}
