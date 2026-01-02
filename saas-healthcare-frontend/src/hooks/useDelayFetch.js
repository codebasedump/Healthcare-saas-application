import { useEffect, useState } from 'react';

export default function useDelayFetch(fetchFunction, delay = 3000) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await fetchFunction();
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [fetchFunction, delay]);

  return loading;
}