import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    jobs: 0,
    applicants: 0,
    shortlisted: 0,
    hired: 0,
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'recruiter') {
          const { jobs } = await jobService.myJobs();
          const totalApplicants = jobs.reduce(
            (sum, j) => sum + (j.applicantsCount || 0),
            0
          );
          setStats({
            jobs: jobs.length,
            applicants: totalApplicants,
            shortlisted: 0,
            hired: 0,
          });
        } else {
          const { applications } = await applicationService.mine();
          setStats({
            jobs: applications.length,
            applicants: applications.filter((a) => a.status === 'shortlisted')
              .length,
            shortlisted: applications.filter((a) => a.status === 'interview')
              .length,
            hired: applications.filter((a) => a.status === 'hired').length,
          });
          setRecent(applications.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) load();
  }, [user]);

  const statCards =
    user?.role === 'recruiter'
      ? [
          { label: 'My Jobs', value: stats.jobs, icon: '💼', color: 'blue' },
          { label: 'Total Applicants', value: stats.applicants, icon: '👥', color: 'green' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: '⭐', color: 'amber' },
          { label: 'Hired', value: stats.hired, icon: '✅', color: 'purple' },
        ]
      : [
          { label: 'Applications', value: stats.jobs, icon: '📄', color: 'blue' },
          { label: 'Shortlisted', value: stats.applicants, icon: '⭐', color: 'amber' },
          { label: 'Interview', value: stats.shortlisted, icon: '🎤', color: 'purple' },
          { label: 'Hired', value: stats.hired, icon: '✅', color: 'green' },
        ];

  const columns = [
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
    <Layout role={user?.role}>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user?.name} 👋
      </h1>
      <p className="text-slate-500 mt-1">
        {user?.role === 'recruiter'
          ? "Here's what's happening with your hiring pipeline."
          : 'Track your job applications here.'}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {user?.role === 'candidate' && recent.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Applications
          </h2>
          <DataTable columns={columns} data={recent} />
        </Card>
      )}
    </Layout>
  );
}