import { useEffect, useState } from 'react';
import { WorkUser } from './types';
import { useApi } from './api';
import QrCode from './components/QrCode';
import CurrencyInput from 'react-currency-input-field';
import { WorkCard } from './components/WorkCard';

export default function WorkList() {
  const [works, setWorks] = useState<WorkUser[]>([]);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [showPriceDialog, setShowPriceDialog] = useState<boolean>(false);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState<boolean>(false);
  const { fetchWithAuth } = useApi(); 

  useEffect(() => {
    fetchWithAuth('/api/works')
      .then(res => {
        if (!res.ok) {
          console.log('Error response:', res);
          throw new Error('Failed to fetch works');
        }
        return res.json();
      })
      .then(data => {
        setWorks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });

  }, []);

  const heldFor = (work: WorkUser):string => {
    const created = new Date(work.tx_created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = diffDays / 30.44; // Average month length
    const diffYears = diffDays / 365.25; // Account for leap years

    if (diffHours < 1) {
      return "New arrival";
    } else if (diffHours < 24) {
      return "Owned for a couple hours";
    } else if (diffDays < 2) {
      return "Owned for 1 day";
    } else if (diffDays < 30) {
      return `Owned for ${Math.floor(diffDays)} days`;
    } else if (diffMonths < 12) {
      const months = Math.floor(diffMonths);
      return `Owned for ${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffYears);
      return `Owned for ${years} ${years === 1 ? 'year' : 'years'}`;
    }
  }

  const handleTransferClick = (workId: number) => {
    setSelectedWorkId(workId);
    setShowPriceDialog(true);
  };

  const getClaimUrl = () => {
    if (!selectedWorkId) return;
    
    fetchWithAuth(`/api/works/claim/new?work=${selectedWorkId}&price=${price}`).then(response => {
      if (response.ok) {
        setShowPriceDialog(false);
        response.json().then(data => {
          console.log('claim url:', data.url);
          setClaimUrl(data.url);
          setShowQr(true);
        });
      } 
    });
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="lg:pl-[240px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {works.length === 0 ? (
          <div className="p-4">
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-600">No Works Yet</h3>
              <p className="text-gray-500 mt-2">Your collection will appear here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {works.map((work) => (
              <div key={work.id} className="flex flex-col">
                <WorkCard work={work} />
                <div className="bg-white rounded-lg p-4 mt-2">
                  <h3>{heldFor(work)}</h3>
                </div>
                <div>
                  <button
                    className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={() => handleTransferClick(work.id)}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPriceDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full lg:ml-[120px]">
              <h2 className="text-xl font-bold mb-4">Set Transfer Price</h2>
              <CurrencyInput
                id="price-input"
                name="price-input"
                placeholder="Enter price in USD"
                defaultValue={price}
                decimalsLimit={2}
                prefix="$"
                onValueChange={(value) => setPrice(value ? parseFloat(value) : 0)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setShowPriceDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={getClaimUrl}
                >
                  Generate QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        {showQr && claimUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 lg:ml-[120px]">
              <h2 className="text-xl font-bold mb-4 text-center">Ask the buyer to scan this code, or send them a transfer link</h2>
              <QrCode url={claimUrl} />
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">expires in 10 minutes</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    onClick={() => setShowQr(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}