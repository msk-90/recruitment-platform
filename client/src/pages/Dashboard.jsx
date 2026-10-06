import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import TrendChart from '../components/TrendChart';
import FunnelChart from '../components/FunnelChart';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { dashboardService } from '../services/dashboardService';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'recruiter') {
          const [a, d] = await Promise.all([
            analyticsService.recruiter(days),
            dashboardService.recruiter(),
          ]);
          setAnalytics(a);
          setRecent(d.recentApplications || []);
        } else {
          const d = await dashboardService.candidate();
          setAnalytics({ metrics: d.stats, funnel: d.pipeline });
          setRecent(d.recentApplications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user, days]);

  if (loading || !analytics) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading analytics...</p>
      </Layout>
    );
  }

  const m = analytics.metrics || {};

  const statCards =
    user.role === 'recruiter'
      ? [
          { label: 'Total Jobs', value: m.totalJobs ?? 0, icon: '💼', color: 'blue' },
          { label: 'Applications', value: m.totalApplications ?? 0, icon: '📄', color: 'green' },
          { label: 'Hired', value: m.totalHired ?? 0, icon: '✅', color: 'amber' },
          { label: 'Hire Rate', value: `${m.hireRate ?? 0}%`, icon: '📈', color: 'purple' },
        ]
      : [
          { label: 'Applications', value: m.totalApplications ?? 0, icon: '📄', color: 'blue' },
          { label: 'Shortlisted', value: analytics.funnel?.shortlisted ?? 0, icon: '⭐', color: 'amber' },
          { label: 'Interview', value: analytics.funnel?.interview ?? 0, icon: '🎤', color: 'purple' },
          { label: 'Hired', value: m.totalHired ?? 0, icon: '✅', color: 'green' },
        ];

  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.candidate?.name}</p>
          <p className="text-xs text-slate-500">{row.candidate?.email}</p>
        </div>
      ),
    },
    { key: 'job', label: 'Job', render: (row) => row.job?.title || '—' },
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
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {user.role === 'recruiter'
              ? 'Your hiring pipeline at a glance.'
              : 'Track your job search progress.'}
          </p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Applications Over Time
          </h2>
          <TrendChart
            data={analytics.appsPerDay || []}
            label="Applications"
            color="#2563EB"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Hiring Funnel
          </h2>
          <FunnelChart funnel={analytics.funnel || {}} />
        </Card>
      </div>

      {/* Top jobs (recruiter) */}
      {user.role === 'recruiter' && analytics.topJobs?.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Top Jobs by Applications
          </h2>
          <div className="space-y-3">
            {analytics.topJobs.map((j) => (
              <div key={j.jobId} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{j.title}</p>
                  <p className="text-xs text-slate-500">
                    {j.hired} hired · {j.rejected} rejected
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {j.total} app{j.total === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Applications
        </h2>
        <DataTable
          columns={columns}
          data={recent}
          emptyMessage="No applications yet."
        />
      </Card>
    </Layout>
  );
}