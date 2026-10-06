import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [mine, setMine] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      let data;
      if (mine && user?.role === 'recruiter') {
        data = await jobService.myJobs();
      } else {
        const params = search ? { search } : {};
        data = await jobService.list(params);
      }

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
  }, [mine]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await jobService.remove(deleting._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleting._id));
      setDeleting(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingLoading(false);
    }
  };

  const isMine = (job) => job.recruiter?._id === user?._id;

  return (
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        {user?.role === 'recruiter' && (
          <Button onClick={() => navigate('/jobs/create')}>+ Create Job</Button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            disabled={mine}
          />
          <Button type="submit" variant="secondary" disabled={mine}>
            Search
          </Button>
        </form>

        {user?.role === 'recruiter' && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={mine}
              onChange={(e) => setMine(e.target.checked)}
              className="rounded"
            />
            Only my jobs
          </label>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {loading && <p className="text-slate-500">Loading jobs...</p>}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            {mine
              ? "You haven't created any jobs yet."
              : 'No jobs found.'}
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((j) => {
            const owner = isMine(j);
            return (
              <JobCard
                key={j._id}
                job={{
                  ...j,
                  applicants: j.applicantsCount || 0,
                }}
                role={user?.role}
                isOwner={owner}
                onEdit={
                  owner ? () => navigate(`/jobs/${j._id}/edit`) : undefined
                }
                onDelete={owner ? () => setDeleting(j) : undefined}
                onView={() => navigate(`/jobs/${j._id}`)}
              />
            );
          })}
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this job?"
        message={`"${deleting?.title}" and all its applications will be permanently removed.`}
        confirmText="Delete"
        variant="danger"
        loading={deletingLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
}