import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { WorkSale } from './types';
import { useApi } from './api';
import { WorkCard } from './components/WorkCard';
import Plot from 'react-plotly.js';

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
  
  // Calculate payment breakdown
  const buyerAmount = workDetail.price * 0.85;
  const artistRoyalties = workDetail.price * 0.10;
  const platformCommission = workDetail.price * 0.05;

  // Format amounts for display
  const buyerFmt = buyerAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const artistFmt = artistRoyalties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const commissionFmt = platformCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Sankey diagram data
  const sankeyData = {
    type: "sankey" as const,
    orientation: "h" as const,
    node: {
      pad: 15,
      thickness: 30,
      line: { color: "black", width: 0.5 },
      label: [
        `You Pay $${priceFmt}`,
        `Buyer Receives $${buyerFmt}`,
        `Artist Royalties $${artistFmt}`,
        `Platform Commission $${commissionFmt}`
      ],
      color: ["#4F46E5", "#4F46E5", "#4F46E5", "#4F46E5"]
    },
    link: {
      source: [0, 0, 0],
      target: [1, 2, 3],
      value: [buyerAmount, artistRoyalties, platformCommission],
      color: ["rgba(79, 70, 229, 0.2)", "rgba(79, 70, 229, 0.2)", "rgba(79, 70, 229, 0.2)"]
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50">
      <div className="w-full max-w-2xl p-8 my-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Finalize Purchase</h2>
        <WorkCard work={workDetail} />
        
        <div className="mt-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Payment Breakdown</h3>
          <div className="w-full overflow-x-auto">
            <Plot
              data={[sankeyData]}
              layout={{
                width: undefined,
                height: 300,
                margin: { t: 20, l: 20, r: 20, b: 20 },
                font: { size: 10 },
                hovermode: false,
                autosize: true
              }}
              config={{ 
                displayModeBar: false,
                staticPlot: true,
                responsive: true
              }}
              style={{ width: '100%', minHeight: '300px' }}
              useResizeHandler={true}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="mb-4 text-lg">
            You are about to buy <span className="font-semibold">{workDetail.title}</span> by{' '}
            <span className="font-semibold">{workDetail.author_name}</span> for{' '}
            <span className="font-semibold">${priceFmt}</span>
          </p>
          <p></p>
          <button 
            onClick={handleClaim}
            className="bg-blue-600 text-white px-8 py-3 text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Confirm purchase for ${priceFmt}
          </button>
        </div>
      </div>
    </div>
  );
} 

export default Claim;