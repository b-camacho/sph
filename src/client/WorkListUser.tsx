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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Held for ${diffDays} days`;
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
    <div className="relative overflow-hidden">
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {works.map((work) => (
          <div className="flex-none w-full snap-center p-4" key={work.id}>
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
            {showPriceDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4">
                  <h2 className="text-xl font-bold mb-4 text-center">Show the buyer this code</h2>
                  <QrCode url={claimUrl} />
                  <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">expires in 10 minutes</p>
                    <button
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                      onClick={() => setShowQr(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}