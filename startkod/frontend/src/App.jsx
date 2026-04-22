import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [message, setMessage] = useState('Laddar...');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message || 'Okänt'))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Fel: {error}</p>;
  return (
    <div>
      <h1>Komplettering – Fullstack</h1>
      <p>API svarar: {message}</p>
    </div>
  );
}
