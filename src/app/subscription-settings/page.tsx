'use client';

import { useState } from 'react';

export default function SubscriptionSettingsPage() {
  const [weeklyPrice, setWeeklyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/set-subscription', {
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
    <div className="max-w-md mx-auto mt-10 text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Set Your Subscription Prices</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Weekly Price (e.g., 9.99)"
          value={weeklyPrice}
          onChange={(e) => setWeeklyPrice(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Monthly Price (e.g., 29.99)"
          value={monthlyPrice}
          onChange={(e) => setMonthlyPrice(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-300"
        >
          Save Prices
        </button>
        {message && <p className="text-green-400">{message}</p>}
      </form>
    </div>
  );
}
