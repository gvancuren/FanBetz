"use client";

import { useState } from "react";

interface CreatorSubscriptionFormProps {
  currentWeeklyPrice?: number;
  currentMonthlyPrice?: number;
  onSuccess?: () => void;
}

export default function CreatorSubscriptionForm({
  currentWeeklyPrice = 0,
  currentMonthlyPrice = 0,
  onSuccess,
}: CreatorSubscriptionFormProps) {
  const [weeklyPrice, setWeeklyPrice] = useState(currentWeeklyPrice / 100);
  const [monthlyPrice, setMonthlyPrice] = useState(currentMonthlyPrice / 100);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await fetch("/api/update-subscription-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyPrice: Math.round(weeklyPrice * 100),
        monthlyPrice: Math.round(monthlyPrice * 100),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold">Set Your Subscription Prices</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Weekly Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={weeklyPrice}
            onChange={(e) => setWeeklyPrice(parseFloat(e.target.value))}
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Monthly Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save Subscription Prices"}
        </button>

        {success && <p className="text-green-400">✅ Prices updated successfully!</p>}
      </div>
    </form>
  );
}
