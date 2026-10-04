const styles = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

export default function Badge({ status = 'applied', children }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || styles.applied
      }`}
    >
      {children || status}
    </span>
  );
}