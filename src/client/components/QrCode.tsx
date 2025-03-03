import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  url: string;
}

export default function QrCode({ url }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const generateQR = async () => {
      try {
        const size = 300; // Fixed square size
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
  }, [url]);

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 m-8 max-w-[900px] w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-center">Scan QR Code</h3>
            <div className="flex justify-center w-[300px] h-[300px] mx-auto">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>
          <div className="hidden lg:block w-px bg-gray-200 self-stretch mx-8"></div>
          <div className="flex-1 mt-8 lg:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center">Or Copy Link</h3>
            <div className="flex flex-col items-center">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full p-3 border rounded mb-4 bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(url)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Copy Transfer Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
