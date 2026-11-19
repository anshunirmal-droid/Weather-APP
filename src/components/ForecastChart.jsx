import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { toTemp } from '../utils/units.js';

/** 48-hour line chart: temperature (left axis) and rain chance (right axis). */
export default function ForecastChart({ hourly, tempUnit, dark }) {
  const axis = dark ? '#94a3b8' : '#64748b';
  const grid = dark ? '#334155' : '#e2e8f0';

  // `i` gives every hour a unique x position (times like "15:00" repeat across two days).
  const data = hourly.map((h, i) => {
    const d = new Date(h.time);
    return {
      i,
      label: h.time.slice(11, 16),
      full: `${d.toLocaleDateString(undefined, { weekday: 'short' })} ${h.time.slice(11, 16)}`,
      temp: Math.round(toTemp(h.temp, tempUnit) * 10) / 10,
      rain: h.rainProb ?? 0,
    };
  });

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="i" tickFormatter={(i) => data[i]?.label ?? ''} interval="preserveStartEnd" minTickGap={28} tick={{ fontSize: 12, fill: axis }} stroke={grid} />
          <YAxis yAxisId="t" tick={{ fontSize: 12, fill: axis }} stroke={grid} unit="°" domain={['auto', 'auto']} />
          <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: axis }} stroke={grid} unit="%" />
          <Tooltip
            labelFormatter={(_, payload) => payload?.[0]?.payload.full}
            contentStyle={{
              background: dark ? '#1e293b' : '#fff',
              border: `1px solid ${grid}`,
              borderRadius: 8,
              color: dark ? '#e2e8f0' : '#0f172a',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line yAxisId="t" type="monotone" dataKey="temp" name={`Temperature (°${tempUnit})`} stroke="#f97316" strokeWidth={2.5} dot={false} />
          <Line yAxisId="r" type="monotone" dataKey="rain" name="Rain chance (%)" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
