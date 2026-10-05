import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await jobService.getById(id);
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Job not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Layout>
    );
  }

  const isOwner = user?._id === job.recruiter?._id;

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-slate-600 mt-1">
              {job.company || job.recruiter?.company}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {job.location} · {job.type}
              {job.salary && ` · ${job.salary}`}
            </p>
          </div>
          <Badge status={job.status} />
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-slate-800 mb-2">Description</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-800 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
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

        {user?.role === 'candidate' && job.status === 'open' && (
          <div className="mt-8">
            <Button onClick={() => navigate(`/apply/${job._id}`)}>
              Apply Now
            </Button>
          </div>
        )}

        {user?.role === 'recruiter' && isOwner && (
          <div className="mt-8 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/jobs/${job._id}/applicants`)}
            >
              View Applicants ({job.applicantsCount})
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm('Delete this job?')) return;
                await jobService.remove(job._id);
                navigate('/jobs');
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </Card>
    </Layout>
  );
}