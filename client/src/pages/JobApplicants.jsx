import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

const STATUS_TABS = ['all', 'applied', 'shortlisted', 'interview', 'hired', 'rejected'];

export default function JobApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const res = await applicationService.forJob(id);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const updateStatus = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = useMemo(() => {
    if (!data?.applications) return [];
    if (filter === 'all') return data.applications;
    return data.applications.filter((a) => a.status === filter);
  }, [data, filter]);

  const counts = useMemo(() => {
    const base = { applied: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0 };
    data?.applications?.forEach((a) => {
      if (base[a.status] !== undefined) base[a.status] += 1;
    });
    return base;
  }, [data]);

  if (loading) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading applicants...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={user?.role}>
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
        <Button className="mt-4" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Layout>
    );
  }

  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.candidate?.name}</p>
          <p className="text-xs text-slate-500">{row.candidate?.email}</p>
          {row.candidate?.skills?.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {row.candidate.skills.slice(0, 3).join(', ')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (row) => row.candidate?.experience || '—',
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
    {
      key: 'profile',
      label: 'Profile',
      render: (row) =>
        row.candidate?._id ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/candidates/${row.candidate._id}`)}
          >
            View
          </Button>
        ) : (
          '—'
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.status !== 'shortlisted' && row.status !== 'hired' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateStatus(row._id, 'shortlisted')}
            >
              Shortlist
            </Button>
          )}
          {row.status !== 'interview' && row.status !== 'hired' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateStatus(row._id, 'interview')}
            >
              Interview
            </Button>
          )}
          {row.status !== 'hired' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => updateStatus(row._id, 'hired')}
            >
              Hire
            </Button>
          )}
          {row.status !== 'rejected' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => updateStatus(row._id, 'rejected')}
            >
              Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalApps = data.applications?.length || 0;

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Applicants for: {data.job?.title}
          </h1>
          <p className="text-slate-500 mt-1">
            {totalApps} total applicant{totalApps === 1 ? '' : 's'}
          </p>
        </div>
        <Badge status={data.job?.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <StatCard label="Applied" value={counts.applied} icon="📄" color="blue" />
        <StatCard label="Shortlisted" value={counts.shortlisted} icon="⭐" color="amber" />
        <StatCard label="Interview" value={counts.interview} icon="🎤" color="purple" />
        <StatCard label="Hired" value={counts.hired} icon="✅" color="green" />
        <StatCard label="Rejected" value={counts.rejected} icon="❌" color="blue" />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
              filter === t
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t}
            {t !== 'all' && (
              <span className="ml-1 text-xs text-slate-400">
                ({counts[t] ?? 0})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="mt-4">
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={
            filter === 'all'
              ? 'No applicants yet.'
              : `No applicants with status "${filter}".`
          }
        />
      </Card>
    </Layout>
  );
}