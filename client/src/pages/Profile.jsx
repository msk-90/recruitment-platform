import { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const updated = await userService.updateMe(form);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const merged = { ...stored, name: updated.name, email: updated.email };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="text-sm text-slate-500">
            {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
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
            {user?.role === 'recruiter' && (
              <Input
                label="Company"
                name="company"
                value={form.company}
                onChange={handle}
              />
            )}
          </div>

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