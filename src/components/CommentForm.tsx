'use client';

import { useState } from 'react';

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/create-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content }),
    });

    if (res.ok) {
      setContent('');
      window.location.reload();
    } else {
      alert('Failed to post comment');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
        rows={3}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500"
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
