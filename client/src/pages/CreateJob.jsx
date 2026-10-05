import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [form, setForm] = useState({
    title: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    skills: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.location) newErrors.location = 'Location is required';
    if (!form.type) newErrors.type = 'Type is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setLoading(true);
    setServerError('');

    try {
      await jobService.create({
        ...form,
        skills: form.skills
          ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      navigate('/jobs');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to create job'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role={user?.role}>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Create Job</h1>

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
              placeholder="Remote / On-site"
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

          <Input
            label="Salary Range"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="$60k–80k"
          />

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
            placeholder="Describe the role..."
          />

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>
              Create Job
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