import Layout from '../components/Layout';
import ApplicantCard from '../components/ApplicantCard';
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
          <ApplicantCard
            key={c.email}
            applicant={c}
            onShortlist={() => alert('Shortlisted')}
            onReject={() => alert('Rejected')}
            onView={() => alert('View')}
          />
        ))}
      </div>
    </Layout>
  );
}