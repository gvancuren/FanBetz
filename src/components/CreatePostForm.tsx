'use client';

import { useState } from 'react';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState<number | undefined>();
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const sports = ['', 'NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer', 'Golf', 'NCAA']; // '' = no category

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const priceInCents = price ? price * 100 : 0;

    const res = await fetch('/api/create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        price: priceInCents,
        imageUrl,
        category: category || null,
      }),
    });

    setLoading(false);
    setSuccess(res.ok);

    if (res.ok) {
      setTitle('');
      setContent('');
      setPrice(undefined);
      setImageUrl('');
      setCategory('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-gray-300 font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-300 font-semibold">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your content here..."
          className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 h-40 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-300 font-semibold">Price ($)</label>
        <input
          type="number"
          value={price ?? ''}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          placeholder="Optional price (leave empty for free)"
          className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-300 font-semibold">Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Optional image URL"
          className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-300 font-semibold">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:ring-yellow-500"
        >
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport === '' ? 'No Category' : sport}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>

      {success && (
        <p className="text-green-400 text-center mt-2">✅ Post created successfully!</p>
      )}
    </form>
  );
}
