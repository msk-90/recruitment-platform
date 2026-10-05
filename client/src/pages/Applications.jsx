import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { mockApplications } from '../data/mockData';

export default function Applications() {
  const { user } = useAuth();

  const columns = [
    { key: 'jobTitle', label: 'Job' },
    { key: 'company', label: 'Company' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    { key: 'appliedAt', label: 'Applied' },
  ];

  return (
    <Layout role={user.role}>
      <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
      <p className="text-slate-500 mt-1">
        Track the status of every job you've applied to.
      </p>

      <Card className="mt-6">
        <DataTable
          columns={columns}
          data={mockApplications}
          emptyMessage="You haven't applied to any jobs yet."
        />
      </Card>
    </Layout>
  );
}