import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { mockJobs } from '../data/mockData';

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout role={user.role}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        {user.role === 'recruiter' && (
          <Button onClick={() => navigate('/jobs/create')}>+ Create Job</Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {mockJobs.map((j) => (
          <JobCard
            key={j.id}
            job={j}
            role={user.role}
            onEdit={() => navigate(`/jobs/${j.id}`)}
            onDelete={() => alert('Delete coming Day 6+')}
            onView={() => navigate(`/jobs/${j.id}`)}
          />
        ))}
      </div>
    </Layout>
  );
}