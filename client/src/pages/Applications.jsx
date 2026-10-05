import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

export default function Applications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await applicationService.mine();
      setApps(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await applicationService.withdraw(id);
      setApps(apps.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Withdraw failed');
    }
  };

  const columns = [
    {
      key: 'job',
      label: 'Job',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.job?.title}</p>
          <p className="text-xs text-slate-500">{row.job?.company}</p>
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
      label: '',
      render: (row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleWithdraw(row._id)}
        >
          Withdraw
        </Button>
      ),
    },
  ];

  return (
    <Layout role={user?.role}>
      <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
      <p className="text-slate-500 mt-1">
        Track the status of every job you've applied to.
      </p>

      <Card className="mt-6">
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            data={apps}
            emptyMessage="You haven't applied to any jobs yet."
          />
        )}
      </Card>
    </Layout>
  );
}