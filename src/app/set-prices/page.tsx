'use client';

import { useState } from 'react';

export default function SetPricesPage() {
  const [weeklyPrice, setWeeklyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/set-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyPrice: parseFloat(weeklyPrice),
        monthlyPrice: parseFloat(monthlyPrice),
      }),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Set Your Subscription Prices</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl shadow-lg">
        <div>
          <label className="block mb-2 text-sm font-medium">Weekly Subscription Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={weeklyPrice}
            onChange={(e) => setWeeklyPrice(e.target.value)}
            className="w-full p-3 rounded text-white"
            placeholder="e.g. 9.99"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Monthly Subscription Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
            className="w-full p-3 rounded text-white"
            placeholder="e.g. 29.99"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-300"
        >
          Save Prices
        </button>

        {message && <p className="text-green-400 mt-4">{message}</p>}
      </form>
    </div>
  );
}
