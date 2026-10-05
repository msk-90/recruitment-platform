import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const data = await jobService.list(params);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await jobService.remove(id);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        {user?.role === 'recruiter' && (
          <Button onClick={() => navigate('/jobs/create')}>+ Create Job</Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-6">
        {loading && <p className="text-slate-500">Loading jobs...</p>}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No jobs yet. {user?.role === 'recruiter' && 'Create your first job!'}
          </div>
        )}
        <div className="space-y-4">
          {jobs.map((j) => (
            <JobCard
              key={j._id}
              job={{
                ...j,
                applicants: j.applicantsCount || 0,
              }}
              role={user?.role}
              onEdit={() => navigate(`/jobs/${j._id}`)}
              onDelete={() => handleDelete(j._id)}
              onView={() => navigate(`/jobs/${j._id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}