import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'applications', label: 'Most applications' },
];

export default function Candidates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    experience: '',
    sort: 'recent',
    minApplications: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.skill) params.skill = filters.skill;
      if (filters.experience) params.experience = filters.experience;
      if (filters.minApplications)
        params.minApplications = filters.minApplications;
      if (filters.sort !== 'recent') params.sort = filters.sort;

      const data = await userService.listCandidates(params);
      setCandidates(data.candidates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [filters]);

  const resetFilters = () =>
    setFilters({
      search: '',
      skill: '',
      experience: '',
      sort: 'recent',
      minApplications: '',
    });

  const activeFilterCount = [
    filters.skill,
    filters.experience,
    filters.minApplications,
  ].filter(Boolean).length;

  return (
    <Layout role={user?.role}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
        <p className="text-slate-500 mt-1">
          {candidates.length} candidate{candidates.length === 1 ? '' : 's'} found
        </p>
      </div>

      {/* Search + filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search by name, email, or bio..."
          value={filters.search}
          onChange={(v) => setFilters({ ...filters, search: v })}
          className="flex-1 min-w-[240px]"
        />

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {showFilters && (
        <Card className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Skill
              </label>
              <input
                type="text"
                value={filters.skill}
                onChange={(e) =>
                  setFilters({ ...filters, skill: e.target.value })
                }
                placeholder="e.g. React"
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Experience
              </label>
              <input
                type="text"
                value={filters.experience}
                onChange={(e) =>
                  setFilters({ ...filters, experience: e.target.value })
                }
                placeholder="e.g. 3 yrs"
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min applications
              </label>
              <input
                type="number"
                min="0"
                value={filters.minApplications}
                onChange={(e) =>
                  setFilters({ ...filters, minApplications: e.target.value })
                }
                placeholder="e.g. 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

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
            {filters.search || activeFilterCount > 0
              ? 'No candidates match your filters.'
              : 'No candidates registered yet.'}
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