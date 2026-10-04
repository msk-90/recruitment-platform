import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Candidates() {
  const { user } = useAuth();

  const candidates = [
    { name: 'Ali Khan', email: 'ali@mail.com', skills: 'React, Node · 3 yrs' },
    { name: 'Sara Ahmed', email: 'sara@mail.com', skills: 'Vue, Python · 2 yrs' },
  ];

  return (
    <Layout role={user.role}>
      <h1 className="text-2xl font-bold text-slate-900">
        Applicants for: Frontend Developer
      </h1>

      <div className="mt-6 space-y-4">
        {candidates.map((c) => (
          <Card key={c.email}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.skills}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Shortlist</Button>
                <Button variant="danger" size="sm">Reject</Button>
                <Button size="sm">View</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}