import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children, role = 'recruiter' }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role={role} />

      <div className="flex">
        <Sidebar role={role} collapsed={sidebarCollapsed} />

        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <footer className="text-center text-xs text-slate-400 py-6">
            © {new Date().getFullYear()} HireHub · Built with MERN + Tailwind
          </footer>
        </main>
      </div>
    </div>
  );
}