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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ resume: '', coverLetter: '' });

  useEffect(() => {
    jobService
      .getById(id)
      .then(setJob)
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.resume.trim()) {
      setError('Please provide a resume link');
      return;
    }

    setSubmitting(true);
    try {
      await applicationService.apply({
        jobId: id,
        resume: form.resume.trim(),
        coverLetter: form.coverLetter.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading job...</p>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout role={user?.role}>
        <p className="text-red-600">{error || 'Job not found'}</p>
        <Button className="mt-4" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Layout>
    );
  }

  // Success state
  if (submitted) {
    return (
      <Layout role={user?.role}>
        <Card className="max-w-lg mx-auto text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-slate-900">
            Application Submitted!
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            You applied to <strong>{job.title}</strong>
            {job.company && ` at ${job.company}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            The recruiter will review your application shortly.
          </p>

          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => navigate('/applications')}>
              View My Applications
            </Button>
            <Button variant="secondary" onClick={() => navigate('/jobs')}>
              Browse More Jobs
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  // Already applied?
  const alreadyClosed = job.status !== 'open';

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
        <p className="text-sm text-slate-500 mt-1">
          {job.company} · {job.location} · {job.type}
        </p>

        {alreadyClosed && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-md">
            This job is closed — applications are no longer accepted.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md text-slate-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md text-slate-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resume Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.resume}
              onChange={(e) =>
                setForm({ ...form, resume: e.target.value })
              }
              placeholder="https://drive.google.com/your-cv.pdf"
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Paste a link to your resume (Google Drive, Dropbox, personal site).
            </p>
          </div>

          <Textarea
            label="Cover Letter"
            value={form.coverLetter}
            onChange={(e) =>
              setForm({ ...form, coverLetter: e.target.value })
            }
            placeholder="Tell the recruiter why you're a great fit for this role..."
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={submitting}
              disabled={alreadyClosed}
            >
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