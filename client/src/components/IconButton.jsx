export default function IconButton({ icon, label, onClick, variant = 'ghost' }) {
  const variants = {
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'text-red-600 hover:bg-red-50',
    primary: 'text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${variants[variant]}`}
    >
      {icon}
    </button>
  );
}