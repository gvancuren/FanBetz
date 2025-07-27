import { useState } from 'react';

export default function PickForm() {
  const [sport, setSport] = useState('');
  const [teams, setTeams] = useState('');
  const [market, setMarket] = useState('');
  const [prediction, setPrediction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sport, teams, market, prediction }),
    });

    if (res.ok) {
      console.log('Pick submitted!');
      setSport('');
      setTeams('');
      setMarket('');
      setPrediction('');
    } else {
      console.error('Submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form inputs go here, for example: */}
      <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Sport" />
      <input value={teams} onChange={(e) => setTeams(e.target.value)} placeholder="Teams" />
      <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Market" />
      <input value={prediction} onChange={(e) => setPrediction(e.target.value)} placeholder="Prediction" />
      <button type="submit">Submit Pick</button>
    </form>
  );
}
