import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';

export default function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // if present → edit mode
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    skills: '',
    status: 'open',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [serverError, setServerError] = useState('');

  // If editing → load the job first
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const job = await jobService.getById(id);

        // Ownership check
        if (job.recruiter?._id !== user._id) {
          setServerError('You are not authorized to edit this job.');
          setFetching(false);
          return;
        }

        setForm({
          title: job.title || '',
          location: job.location || '',
          type: job.type || '',
          salary: job.salary || '',
          description: job.description || '',
          skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
          status: job.status || 'open',
        });
      } catch (err) {
        setServerError(err.response?.data?.message || 'Failed to load job');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit, user._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.type) e.type = 'Type is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const payload = {
      ...form,
      skills: form.skills
        ? form.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (isEdit) {
        await jobService.update(id, payload);
      } else {
        await jobService.create(payload);
      }
      navigate('/jobs');
    } catch (err) {
      setServerError(
        err.response?.data?.message || (isEdit ? 'Update failed' : 'Create failed')
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout role={user?.role}>
        <p className="text-slate-500">Loading job...</p>
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

      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit Job' : 'Create Job'}
      </h1>

      <Card className="mt-6 max-w-2xl">
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Job Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g. Frontend Developer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="Remote / On-site / Hybrid"
            />
            <Select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              error={errors.type}
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Internship', label: 'Internship' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Salary Range"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="$60k–80k"
            />
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>

          <Input
            label="Skills (comma-separated)"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React, Node, MongoDB"
          />

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Describe the role, responsibilities, and requirements..."
          />

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>
              {isEdit ? 'Save Changes' : 'Create Job'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}