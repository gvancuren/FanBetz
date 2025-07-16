'use client';

export default function StripeConnectButton() {
  const handleConnect = async () => {
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Stripe Connect error:', data);
        alert(`Stripe error: ${data.error || 'Unknown error'}`);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('No onboarding URL received.');
      }
    } catch (err) {
      console.error('Unhandled Stripe connect error:', err);
      alert('Something went wrong while connecting to Stripe.');
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Connect with Stripe
    </button>
  );
}
