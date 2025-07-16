import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SubscriptionPricingForm() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<'weekly' | 'monthly'>('weekly');
  const [price, setPrice] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/set-subscription-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, price: parseFloat(price) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  if (!session) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800 p-6 rounded-xl shadow space-y-4 max-w-md mx-auto"
    >
      <h3 className="text-lg font-semibold text-yellow-400">
        Set Your Subscription Price
      </h3>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="weekly"
            checked={plan === 'weekly'}
            onChange={() => setPlan('weekly')}
            className="accent-yellow-400"
          />
          Weekly
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="monthly"
            checked={plan === 'monthly'}
            onChange={() => setPlan('monthly')}
            className="accent-yellow-400"
          />
          Monthly
        </label>
      </div>

      <input
        type="number"
        placeholder="Enter price in $"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 bg-zinc-700 rounded text-white"
        required
        min="1"
      />

      <button
        type="submit"
        className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300"
      >
        Save Subscription
      </button>

      {success && (
        <p className="text-green-400 font-semibold">
          Subscription price saved successfully!
        </p>
      )}

      {error && (
        <p className="text-red-500 font-semibold">Error: {error}</p>
      )}
    </form>
  );
}
