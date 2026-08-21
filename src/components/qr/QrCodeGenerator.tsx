import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error("Error rendering QR code:", err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono ${className}`}
      >
        جاري إنشاء QR...
      </div>
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt="QR Code" 
      width={size} 
      height={size} 
      className={`rounded-xl border border-slate-200 shadow-sm ${className}`} 
    />
  );
};
