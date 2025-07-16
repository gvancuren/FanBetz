'use client';

export async function subscribeToCreator(creatorId: number, plan: 'weekly' | 'monthly') {
  try {
    const res = await fetch('/api/user-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, plan }),
    });

    const data = await res.json();

    if (res.ok && data.url) {
      window.location.href = data.url; // redirect to Stripe checkout
    } else {
      alert(data.error || 'Something went wrong.');
    }
  } catch (error) {
    console.error(error);
    alert('An unexpected error occurred.');
  }
}
