import { useEffect, useState } from 'react';

/**
 * Debounced search input.
 * Calls onChange(value) after `delay` ms of no typing.
 */
export default function SearchBar({
  placeholder = 'Search...',
  value = '',
  onChange,
  delay = 400,
  className = '',
}) {
  const [local, setLocal] = useState(value);

  // Sync when parent changes value externally
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange?.(local);
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [local]);

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}