import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

interface ApiResponse {
  message: string;
}

const API_URL = 'http://localhost:3200';

function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async (): Promise<void> => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <>
      <div className="card">
        <h2>Backend Response:</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {message && (
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>
            {message}
          </p>
        )}
      </div>
      <p className="read-the-docs">
        Fetching data from backend at {API_URL}
      </p>
    </>
  );
}

export default App;
