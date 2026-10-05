import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';

const PIE_COLORS = {
  applied: '#3B82F6',
  shortlisted: '#F59E0B',
  interview: '#8B5CF6',
  hired: '#10B981',
  rejected: '#EF4444',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res =
          user.role === 'recruiter'
            ? await dashboardService.recruiter()
            : await dashboardService.candidate();
        setData(res);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading dashboard...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={user?.role}>
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      </Layout>
    );
  }

  const { stats = {}, pipeline = {}, appsPerDay = [], recentApplications = [] } =
    data || {};

  // Recruiter view
  if (user.role === 'recruiter') {
    const statCards = [
      {
        label: 'Total Jobs',
        value: stats.totalJobs ?? 0,
        icon: '💼',
        color: 'blue',
      },
      {
        label: 'Applications',
        value: stats.totalApplications ?? 0,
        icon: '📄',
        color: 'green',
      },
      {
        label: 'Candidates',
        value: stats.uniqueCandidates ?? 0,
        icon: '👥',
        color: 'amber',
      },
      {
        label: 'Hired',
        value: stats.hired ?? 0,
        icon: '✅',
        color: 'purple',
      },
    ];

    const pieData = Object.entries(pipeline)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    const columns = [
      {
        key: 'candidate',
        label: 'Candidate',
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800">
              {row.candidate?.name || '—'}
            </p>
            <p className="text-xs text-slate-500">
              {row.candidate?.email || ''}
            </p>
          </div>
        ),
      },
      {
        key: 'job',
        label: 'Job',
        render: (row) => row.job?.title || '—',
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <Badge status={row.status} />,
      },
      {
        key: 'createdAt',
        label: 'Applied',
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
    ];

    return (
      <Layout role={user.role}>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your hiring pipeline.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Applications (last 30 days)
            </h2>
            {appsPerDay.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">
                No applications yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={appsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Pipeline Breakdown
            </h2>
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">
                No data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[entry.name] || '#94A3B8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Recent applications */}
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Applications
          </h2>
          <DataTable
            columns={columns}
            data={recentApplications}
            emptyMessage="No applications yet."
          />
        </Card>
      </Layout>
    );
  }

  // Candidate view
  const candidateStats = [
    {
      label: 'Applications',
      value: stats.totalApplications ?? 0,
      icon: '📄',
      color: 'blue',
    },
    {
      label: 'Shortlisted',
      value: stats.shortlisted ?? 0,
      icon: '⭐',
      color: 'amber',
    },
    {
      label: 'Interviews',
      value: stats.interview ?? 0,
      icon: '🎤',
      color: 'purple',
    },
    {
      label: 'Hired',
      value: stats.hired ?? 0,
      icon: '✅',
      color: 'green',
    },
  ];

  const candidateColumns = [
    {
      key: 'job',
      label: 'Job',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.job?.title || '—'}</p>
          <p className="text-xs text-slate-500">{row.job?.company || ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Applied',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout role={user.role}>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user.name} 👋
      </h1>
      <p className="text-slate-500 mt-1">Track your job applications here.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {candidateStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Applications
        </h2>
        <DataTable
          columns={candidateColumns}
          data={recentApplications}
          emptyMessage="You haven't applied to any jobs yet."
        />
      </Card>
    </Layout>
  );
}