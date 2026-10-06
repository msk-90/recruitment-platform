import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { applicationService } from '../services/applicationService';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await userService.getCandidate(id);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidate');
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
      load(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading candidate profile...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={user?.role}>
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
        <Button className="mt-4" onClick={() => navigate('/candidates')}>
          Back
        </Button>
      </Layout>
    );
  }

  const { candidate, applications, stats } = data;

  const columns = [
    {
      key: 'job',
      label: 'Job',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.job?.title || '—'}</p>
          <p className="text-xs text-slate-500">{row.job?.company || ''}</p>
        </div>
      ),
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
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.status !== 'shortlisted' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateStatus(row._id, 'shortlisted')}
            >
              Shortlist
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

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back to candidates
      </button>

      {/* Header */}
      <Card>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {candidate.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              {candidate.name}
            </h1>
            <p className="text-slate-500 mt-1">{candidate.email}</p>
            {candidate.phone && (
              <p className="text-sm text-slate-500 mt-1">
                📞 {candidate.phone}
              </p>
            )}
            {candidate.experience && (
              <p className="text-sm text-slate-500 mt-1">
                💼 {candidate.experience}
              </p>
            )}
          </div>
        </div>

        {candidate.bio && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-800 mb-2">About</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {candidate.bio}
            </p>
          </div>
        )}

        {candidate.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-800 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.resume && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-800 mb-2">Resume</h2>
            <a
              href={candidate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              📄 Open Resume
            </a>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Applications" value={stats.total} icon="📄" color="blue" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon="⭐" color="amber" />
        <StatCard label="Interviews" value={stats.interview} icon="🎤" color="purple" />
        <StatCard label="Hired" value={stats.hired} icon="✅" color="green" />
      </div>

      {/* Applications */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Applications ({applications.length})
        </h2>
        <DataTable
          columns={columns}
          data={applications}
          emptyMessage="This candidate hasn't applied to any jobs yet."
        />
      </Card>
    </Layout>
  );
}