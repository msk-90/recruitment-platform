import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

const JOB_TYPES = ['', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const STATUS_OPTIONS = ['', 'open', 'closed'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'applicants', label: 'Most applicants' },
  { value: 'title', label: 'Title A–Z' },
];

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    status: '',
    sort: 'newest',
  });
  const [mine, setMine] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      let data;
      if (mine && user?.role === 'recruiter') {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;
        data = await jobService.myJobs(params);
      } else {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.location) params.location = filters.location;
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort;
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
  }, [filters, mine]);

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

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      status: '',
      sort: 'newest',
    });
  };

  const isMine = (job) => job.recruiter?._id === user?._id;
  const activeFilterCount = [
    filters.location,
    filters.type,
    filters.status,
  ].filter(Boolean).length;

  return (
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        {user?.role === 'recruiter' && (
          <Button onClick={() => navigate('/jobs/create')}>+ Create Job</Button>
        )}
      </div>

      {/* Search + filter toggle */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search jobs by title, company, skill..."
          value={filters.search}
          onChange={(v) => setFilters({ ...filters, search: v })}
          className="flex-1 min-w-[240px]"
        />

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

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

      {/* Expanded filter panel */}
      {showFilters && (
        <Card className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                placeholder="Remote, On-site..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t || 'Any'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s || 'Any'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

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
            {filters.search || activeFilterCount > 0
              ? 'No jobs match your search.'
              : mine
              ? "You haven't created any jobs yet."
              : 'No jobs available.'}
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