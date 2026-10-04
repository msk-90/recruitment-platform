import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Jobs', value: 12, icon: '💼', color: 'blue' },
    { label: 'Total Applicants', value: 48, icon: '👥', color: 'green' },
    { label: 'Shortlisted', value: 15, icon: '⭐', color: 'amber' },
    { label: 'Hired', value: 5, icon: '✅', color: 'purple' },
  ];

  const recent = [
    { name: 'Ali Khan', job: 'Frontend Developer', status: 'shortlisted' },
    { name: 'Sara Ahmed', job: 'Backend Engineer', status: 'applied' },
    { name: 'Bilal Raza', job: 'UI Designer', status: 'interview' },
  ];

  return (
    <Layout role={user.role}>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user.name} 👋
      </h1>
      <p className="text-slate-500 mt-1">
        Here's what's happening with your hiring pipeline.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Applications
        </h2>
        <div className="divide-y divide-slate-100">
          {recent.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-800">{r.name}</p>
                <p className="text-sm text-slate-500">{r.job}</p>
              </div>
              <Badge status={r.status} />
            </div>
          ))}
        </div>
      </Card>
    </Layout>
  );
}