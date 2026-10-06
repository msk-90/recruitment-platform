import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * data: [{ _id: '2025-01-15', count: 3 }, ...]
 * label: e.g. 'Applications'
 * color: hex
 */
export default function TrendChart({
  data = [],
  label = 'Count',
  color = '#2563EB',
}) {
  if (!data.length) {
    return (
      <p className="text-slate-400 text-sm py-12 text-center">
        No data for this period.
      </p>
    );
  }

  // Fill missing days with 0 for smooth line
  const days = [];
  const first = new Date(data[0]._id);
  const last = new Date(data[data.length - 1]._id);
  const map = {};
  data.forEach((d) => (map[d._id] = d.count));

  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    days.push({ _id: key, count: map[key] || 0 });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={days}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="_id"
          tick={{ fontSize: 11, fill: '#64748B' }}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          allowDecimals={false}
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="count"
          name={label}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}