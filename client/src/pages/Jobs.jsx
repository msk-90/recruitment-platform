import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
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
          <Card key={j.title}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {j.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {j.location} · {j.type} · {j.salary}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {j.applicants} applicants
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={j.status} />
                {user.role === 'recruiter' ? (
                  <>
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="danger" size="sm">Delete</Button>
                  </>
                ) : (
                  <Button size="sm">View Details</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}