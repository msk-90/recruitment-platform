import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { useAuth } from '../context/AuthContext';
import { mockJobs } from '../data/mockData';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = mockJobs.find((j) => j.id === id);

  const [form, setForm] = useState({ coverLetter: '', resume: null });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  if (!job) {
    return (
      <Layout role={user.role}>
        <p>Job not found.</p>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout role={user.role}>
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
    <Layout role={user.role}>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Full Name"
            name="name"
            defaultValue={user.name}
            readOnly
          />
          <Input
            label="Email"
            name="email"
            defaultValue={user.email}
            readOnly
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resume (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setForm({ ...form, resume: e.target.files[0] })
              }
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100"
            />
          </div>

          <Textarea
            label="Cover Letter"
            name="coverLetter"
            value={form.coverLetter}
            onChange={handleChange}
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