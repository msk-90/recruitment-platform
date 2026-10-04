import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
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
    { name: 'Ali Khan', job: 'Frontend Developer', status: 'shortlisted', date: '2025-01-12' },
    { name: 'Sara Ahmed', job: 'Backend Engineer', status: 'applied', date: '2025-01-11' },
    { name: 'Bilal Raza', job: 'UI Designer', status: 'interview', date: '2025-01-10' },
  ];

  const columns = [
    { key: 'name', label: 'Candidate' },
    { key: 'job', label: 'Job' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    { key: 'date', label: 'Applied' },
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
        <DataTable columns={columns} data={recent} />
      </Card>
    </Layout>
  );
}