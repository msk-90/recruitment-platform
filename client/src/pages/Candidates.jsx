import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Candidates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [sort, setSort] = useState('recent');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (sort !== 'recent') params.sort = sort;

      const data = await userService.listCandidates(params);
      setCandidates(data.candidates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCandidates();
  };

  return (
    <Layout role={user?.role}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-1">
            Browse candidates registered on the platform.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, email, or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="Skill (e.g. React)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
          <div className="md:col-span-4 flex gap-2">
            <Button type="submit">Apply Filters</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch('');
                setSkill('');
                setSort('recent');
                setTimeout(loadCandidates, 0);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <div className="mt-6">
        {loading && <p className="text-slate-500">Loading candidates...</p>}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No candidates found.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <Card key={c._id}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {c.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{c.email}</p>

                  {c.experience && (
                    <p className="text-xs text-slate-500 mt-1">
                      💼 {c.experience}
                    </p>
                  )}

                  {c.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 4 && (
                        <span className="text-xs text-slate-400">
                          +{c.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {c.bio && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {c.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>📄 {c.applicationsCount ?? 0} applications</span>
                    {(c.hiredCount ?? 0) > 0 && (
                      <span className="text-green-600">
                        ✅ {c.hiredCount} hired
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => navigate(`/candidates/${c._id}`)}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}