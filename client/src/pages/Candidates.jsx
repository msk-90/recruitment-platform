import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .listCandidates()
      .then((data) => setCandidates(data.candidates || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout role={user?.role}>
      <h1 className="text-2xl font-bold text-slate-900">All Candidates</h1>
      <p className="text-slate-500 mt-1">
        Browse candidates registered on the platform.
      </p>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading...</p>
      ) : candidates.length === 0 ? (
        <p className="mt-6 text-slate-400">No candidates yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {candidates.map((c) => (
            <Card key={c._id}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {c.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.email}</p>
                  {c.skills?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.skills.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}