import { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    position: user?.position || '',
    bio: user?.bio || '',
    experience: user?.experience || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    resume: user?.resume || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Convert comma-separated skills back to array
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      const updated = await userService.updateMe(payload);

      // Keep local auth in sync
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const merged = {
        ...stored,
        name: updated.name,
        email: updated.email,
      };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const isCandidate = user?.role === 'candidate';
  const isRecruiter = user?.role === 'recruiter';

  return (
    <Layout role={user?.role}>
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <Card className="mt-6 max-w-2xl">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Avatar header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 capitalize">
              {user?.role}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handle}
            />
            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handle}
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handle}
              placeholder="+92 300 1234567"
            />

            {isRecruiter && (
              <>
                <Input
                  label="Company"
                  name="company"
                  value={form.company}
                  onChange={handle}
                />
                <Input
                  label="Position"
                  name="position"
                  value={form.position}
                  onChange={handle}
                  placeholder="Engineering Manager"
                />
              </>
            )}

            {isCandidate && (
              <>
                <Input
                  label="Experience"
                  name="experience"
                  value={form.experience}
                  onChange={handle}
                  placeholder="3 yrs"
                />
                <Input
                  label="Skills (comma-separated)"
                  name="skills"
                  value={form.skills}
                  onChange={handle}
                  placeholder="React, Node, MongoDB"
                />
              </>
            )}
          </div>

          {/* Bio (candidate) */}
          {isCandidate && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handle}
                rows={3}
                maxLength={500}
                placeholder="Tell recruiters about yourself..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.bio.length}/500 characters
              </p>
            </div>
          )}

          {/* Resume upload (candidate only) */}
          {isCandidate && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Resume / CV
              </h3>

              {form.resume && (
                <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>📄</span>
                    <a
                      href={`http://127.0.0.1:5000${form.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {form.resume.split('/').pop()}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, resume: '' })}
                    className="text-xs text-red-600 hover:text-red-700 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              <FileUpload
                label={form.resume ? 'Upload new resume' : 'Upload resume'}
                onUploaded={(file) => {
                  setForm((prev) => ({ ...prev, resume: file.path }));
                  setSuccess('Resume uploaded. Click Save Changes to apply.');
                }}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}