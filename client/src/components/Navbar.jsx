import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ role = 'recruiter' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const recruiterLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Candidates', to: '/candidates' },
  ];

  const candidateLinks = [
    { label: 'Jobs', to: '/jobs' },
    { label: 'My Applications', to: '/applications' },
  ];

  const links = role === 'recruiter' ? recruiterLinks : candidateLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🧑‍💼</span>
            <span className="text-lg font-bold text-slate-900">HireHub</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === l.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
            >
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                S
              </span>
              <span className="text-sm font-medium text-slate-700 hidden lg:inline">
                Saad
              </span>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === l.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}