import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();

  const jobs = [
    {
      title: 'Frontend Developer',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60k–80k',
      status: 'open',
      applicants: 14,
    },
    {
      title: 'Backend Engineer',
      location: 'On-site',
      type: 'Full-time',
      salary: '$70k–90k',
      status: 'closed',
      applicants: 22,
    },
  ];

  return (
    <Layout role={user.role}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        {user.role === 'recruiter' && <Button>+ Create Job</Button>}
      </div>

      <div className="mt-6 space-y-4">
        {jobs.map((j) => (
          <JobCard
            key={j.title}
            job={j}
            role={user.role}
            onEdit={() => alert('Edit')}
            onDelete={() => alert('Delete')}
            onView={() => alert('View')}
          />
        ))}
      </div>
    </Layout>
  );
}