import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = {
  applied: '#3B82F6',
  shortlisted: '#F59E0B',
  interview: '#8B5CF6',
  hired: '#10B981',
  rejected: '#EF4444',
};

export default function FunnelChart({ funnel }) {
  const data = Object.entries(funnel).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[name],
  }));

  if (data.every((d) => d.value === 0)) {
    return (
      <p className="text-slate-400 text-sm py-12 text-center">
        No application data yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748B' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          allowDecimals={false}
        />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}