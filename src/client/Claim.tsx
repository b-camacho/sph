import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { WorkSale } from './types';
import { useApi } from './api';
import { WorkCard } from './components/WorkCard';

const Claim = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  const navigate = useNavigate();
  const [workDetail, setWork] = useState<WorkSale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useApi();

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await fetchWithAuth(`/api/claim?key=${key}`);

        if (!response.ok) {
          throw new Error('Failed to fetch work details');
        }

        const data: WorkSale = await response.json();
        setWork(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchWork();
    } else {
      setError('No claim key provided');
      setLoading(false);
    }
  }, [key]);

  const handleClaim = async () => {
    console.log('Claiming work:', workDetail);
    try {
      const response = await fetchWithAuth(`/api/claim/confirm?key=${key}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to claim work');
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim work');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!workDetail) return <div>No work details found</div>;

  const priceFmt = workDetail.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Finalize Purchase</h2>
      <WorkCard work={workDetail} />
      <div className="mt-6 text-center">
        <p className="mb-4">You are about to buy {workDetail.title} by {workDetail.author_name} for ${priceFmt}</p>
        <p></p>
        <button 
          onClick={handleClaim}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Confirm purchase for ${priceFmt}
        </button>
      </div>
    </div>
  );
} 

export default Claim;