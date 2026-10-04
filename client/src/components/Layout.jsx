import Navbar from './Navbar';

export default function Layout({ children, role = 'recruiter' }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role={role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="text-center text-xs text-slate-400 py-6">
        © {new Date().getFullYear()} HireHub · Built with MERN + Tailwind
      </footer>
    </div>
  );
}