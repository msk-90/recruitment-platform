import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ coverLetter: '', resume: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    jobService
      .getById(id)
      .then(setJob)
      .catch(() => setError('Job not found'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resume) {
      setError('Resume link is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await applicationService.apply({
        jobId: id,
        resume: form.resume,
        coverLetter: form.coverLetter,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading...</p>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout role={user?.role}>
        <Card className="max-w-lg mx-auto text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-slate-900">
            Application Submitted!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            You applied to {job.title} at {job.company}.
          </p>
          <Button className="mt-6" onClick={() => navigate('/applications')}>
            View My Applications
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <Card className="max-w-2xl">
        <h1 className="text-xl font-bold text-slate-900">
          Apply for {job.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{job.company}</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resume URL (paste a link)
            </label>
            <input
              type="text"
              value={form.resume}
              onChange={(e) =>
                setForm({ ...form, resume: e.target.value })
              }
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Textarea
            label="Cover Letter"
            value={form.coverLetter}
            onChange={(e) =>
              setForm({ ...form, coverLetter: e.target.value })
            }
            placeholder="Tell the recruiter why you're a great fit..."
          />

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>
              Submit Application
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}