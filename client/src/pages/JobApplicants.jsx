import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

export default function JobApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      // Refresh list
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={user?.role}>
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
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
              {row.candidate.skills.join(', ')}
            </p>
          )}
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
        <div className="flex flex-wrap gap-1">
          {row.status !== 'shortlisted' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateStatus(row._id, 'shortlisted')}
            >
              Shortlist
            </Button>
          )}
          {row.status !== 'interview' && (
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

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">
        Applicants for: {data.job?.title}
      </h1>
      <p className="text-slate-500 mt-1">
        {data.count} applicant{data.count === 1 ? '' : 's'}
      </p>

      <Card className="mt-6">
        <DataTable
          columns={columns}
          data={data.applications}
          emptyMessage="No applicants yet."
        />
      </Card>
    </Layout>
  );
}