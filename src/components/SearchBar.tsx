'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    { type: string; name: string; id: number; profileImage?: string; followerCount?: number }[] | null
  >(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults(null);
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        console.log('Fetched results:', data.results);
        setResults(data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
        setResults(null);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (result: {
    type: string;
    name: string;
    id: number;
    profileImage?: string;
  }) => {
    setQuery('');
    setShowDropdown(false);

    if (result.type === 'creator') {
      router.push(`/creator/${result.name}`);
    } else if (result.type === 'post') {
      router.push(`/creator/${result.name}#post-${result.id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setShowDropdown(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:w-[300px]">
      <input
        type="text"
        placeholder="Search creators or posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      {showDropdown && results && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result, i) => (
            <button
              type="button"
              key={i}
              onClick={() => handleSelect(result)}
              className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-zinc-800 text-sm"
            >
              {result.type === 'creator' ? (
                <>
                  <img
                    src={result.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-yellow-400"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">{result.name}</span>
                    <span className="text-gray-400 text-xs">
                      {result.followerCount ?? 0} followers
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-white">📄 {result.name}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
