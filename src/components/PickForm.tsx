const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sport, teams, market, prediction }),
    })
  
    if (res.ok) {
      console.log('Pick submitted!')
      setSport('')
      setTeams('')
      setMarket('')
      setPrediction('')
    } else {
      console.error('Submission failed.')
    }
  }
  