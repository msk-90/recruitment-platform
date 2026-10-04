import { NavLink } from 'react-router-dom';

export default function Sidebar({ role = 'recruiter', collapsed = false }) {
  const recruiterLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    { label: 'Jobs', to: '/jobs', icon: '💼' },
    { label: 'Candidates', to: '/candidates', icon: '👥' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ];

  const candidateLinks = [
    { label: 'Jobs', to: '/jobs', icon: '💼' },
    { label: 'My Applications', to: '/applications', icon: '📄' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ];

  const links = role === 'recruiter' ? recruiterLinks : candidateLinks;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] transition-all ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
            title={collapsed ? l.label : ''}
          >
            <span className="text-lg">{l.icon}</span>
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}