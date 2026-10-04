import { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    company: '',
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Layout role={user.role}>
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <Card className="mt-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            {user.name[0]}
          </div>
          <Button variant="secondary" size="sm">Upload Photo</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={form.name} onChange={handle} />
          <Input label="Email" name="email" value={form.email} onChange={handle} />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handle}
            placeholder="+92 300 1234567"
          />
          {user.role === 'recruiter' && (
            <Input
              label="Company"
              name="company"
              value={form.company}
              onChange={handle}
            />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button>Save Changes</Button>
          <Button variant="secondary">Change Password</Button>
        </div>
      </Card>
    </Layout>
  );
}