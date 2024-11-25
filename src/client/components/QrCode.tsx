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
        await QRCode.toCanvas(canvasRef.current, url, {
          width: window.innerWidth * 0.8,
          margin: 1,
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
    <div className="bg-white rounded-lg m-8">
      <canvas ref={canvasRef} />
    </div>
  );
}
