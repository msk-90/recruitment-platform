import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await applicationService.mine();
      setApps(data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const confirmWithdraw = async () => {
    if (!withdrawing) return;
    setWithdrawLoading(true);
    try {
      await applicationService.withdraw(withdrawing._id);
      setApps((prev) => prev.filter((a) => a._id !== withdrawing._id));
      setWithdrawing(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Withdraw failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const stats = {
    total: apps.length,
    shortlisted: apps.filter((a) => a.status === 'shortlisted').length,
    interview: apps.filter((a) => a.status === 'interview').length,
    hired: apps.filter((a) => a.status === 'hired').length,
  };

  return (
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Applications
          </h1>
          <p className="text-slate-500 mt-1">
            Track the status of every job you've applied to.
          </p>
        </div>
        <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total" value={stats.total} icon="📄" color="blue" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon="⭐" color="amber" />
        <StatCard label="Interviews" value={stats.interview} icon="🎤" color="purple" />
        <StatCard label="Hired" value={stats.hired} icon="✅" color="green" />
      </div>

      {/* List */}
      <div className="mt-6">
        {loading && <p className="text-slate-500">Loading applications...</p>}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {!loading && apps.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">
              You haven't applied to any jobs yet.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Browse open positions and submit your first application.
            </p>
            <Button className="mt-5" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </Card>
        )}

        <div className="space-y-3">
          {apps.map((a) => (
            <Card key={a._id}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {a.job?.title || 'Job removed'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {a.job?.company} · {a.job?.location} · {a.job?.type}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Applied on{' '}
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge status={a.status} />
                  {a.job?._id && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/jobs/${a.job._id}`)}
                    >
                      View Job
                    </Button>
                  )}
                  {a.status === 'applied' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setWithdrawing(a)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>

              {a.coverLetter && (
                <details className="mt-3">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                    View cover letter
                  </summary>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-line bg-slate-50 p-3 rounded">
                    {a.coverLetter}
                  </p>
                </details>
              )}
            </Card>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(withdrawing)}
        title="Withdraw this application?"
        message={`You're about to withdraw your application for "${
          withdrawing?.job?.title || 'this job'
        }". You can reapply later.`}
        confirmText="Withdraw"
        variant="danger"
        loading={withdrawLoading}
        onCancel={() => setWithdrawing(null)}
        onConfirm={confirmWithdraw}
      />
    </Layout>
  );
}