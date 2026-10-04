import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  Check,
  Receipt,
  Share2,
} from 'lucide-react';
import { CbeLogo } from './CbeLogo';
import { Language, Transaction } from '../types/banking';
import { formatEnglishNameOnly } from '../utils/userDatabase';

// Authentic CBE Viewfinder Screenshot Icon (4 corner brackets + center lens circle matching IMG_20261001_132739_360.jpg)
const ScreenshotViewfinderIcon: React.FC<{ className?: string }> = ({ className = "w-4.5 h-4.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M 4 8 L 4 5 C 4 4.4 4.4 4 5 4 L 8 4" />
    <path d="M 16 4 L 19 4 C 19.6 4 20 4.4 20 5 L 20 8" />
    <path d="M 20 16 L 20 19 C 20 19.6 19.6 20 19 20 L 16 20" />
    <path d="M 8 20 L 5 20 C 4.4 20 4 19.6 4 19 L 4 16" />
    <circle cx="12" cy="12" r="3.2" strokeWidth="2.3" />
  </svg>
);

interface CbeSuccessScreenProps {
  transaction: Transaction;
  currentLang: Language;
  onClose: () => void;
  onOpenReceiptDetails: () => void;
}

export const CbeSuccessScreen: React.FC<CbeSuccessScreenProps> = ({
  transaction,
  currentLang,
  onClose,
  onOpenReceiptDetails,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);

  const serviceCharge = 1.00;
  const vat = 0.15;
  const disasterRecovery = 0.05;
  const totalDebited = (transaction.amount || 2130) + serviceCharge + vat + disasterRecovery;

  // Format date like: "Aug 15, 2026 05:46 PM" matching IMG_20261001_132739_360.jpg
  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const senderDisplayName = transaction.senderName;
  const senderAccountDisplay = transaction.senderAccount;
  const receiverDisplayName = transaction.receiverName;
  
  // Helper to mask account for display (e.g. 1*********8612)
  const maskAccountDisplay = (acc: string) => {
    const digits = acc.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `${digits[0]}*********${digits.slice(-4)}`;
    }
    return acc.startsWith('ETB-') ? acc : `ETB-${acc.slice(-4)}`;
  };
  
  const receiverAccountDisplay = maskAccountDisplay(transaction.receiverAccount);

  useEffect(() => {
    const qrPayload = JSON.stringify({
      bank: 'Commercial Bank of Ethiopia',
      id: transaction.referenceNumber || 'FT262277V0S0',
      amount: `${transaction.amount || 2130} ETB`,
      from: `${senderDisplayName} ${senderAccountDisplay}`,
      to: `${receiverDisplayName} ${receiverAccountDisplay}`,
      time: transaction.timestamp,
      hash: transaction.hash,
      status: 'VERIFIED_SUCCESS_CBE'
    });

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation failed', err));
  }, [transaction, senderDisplayName, senderAccountDisplay, receiverDisplayName, receiverAccountDisplay]);

  const handleShare = () => {
    const text = `CBE Transaction: ETB ${(transaction.amount || 2130).toFixed(2)} debited from ${senderDisplayName} for ${receiverDisplayName}. Transaction ID: ${transaction.referenceNumber || 'FT262277V0S0'}`;
    if (navigator.share) {
      navigator.share({ title: 'CBE Transaction Slip', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setToastMessage('Transaction summary copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleScreenshot = async () => {
    // 1. Shutter camera flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 260);

    // 2. High-res canvas capture of the receipt
    try {
      if (receiptCardRef.current) {
        const canvas = await html2canvas(receiptCardRef.current, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#f8f9fa',
          logging: false,
        });

        const imageUri = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `CBE_Transaction_${transaction.referenceNumber || 'FT262277V0S0'}.png`;
        link.href = imageUri;
        link.click();

        setToastMessage(
          currentLang === 'am'
            ? 'ስክሪንሾት በተሳካ ሁኔታ ተነስቶ ተቀምጧል! (Screenshot saved)'
            : 'Screenshot captured and downloaded successfully!'
        );
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Screenshot capture fallback', err);
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-800 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-x-hidden font-sans pb-4">
      {/* Camera Shutter Flash Overlay */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white/95 pointer-events-none animate-out fade-out duration-250" />
      )}

      {/* Top Purple Banner (Exact matching IMG_20261001_132739_360.jpg) */}
      <div className="bg-[#74117c] text-white pt-6 pb-14 px-5 relative rounded-b-[40px] shadow-md shrink-0">
        <div className="flex items-center justify-between">
          {/* White Shield with Purple Checkmark + Thank you / Success */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 5.2V11.2C4 16.2 7.4 20.8 12 22C16.6 20.8 20 16.2 20 11.2V5.2L12 2Z"
                  fill="white"
                />
                <path
                  d="M8.5 11.8L11 14.3L15.5 9.8"
                  stroke="#74117c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white tracking-wide leading-tight font-sans">
                Thank you
              </h1>
              <p className="text-[12.5px] text-white/90 font-medium leading-tight">
                Success
              </p>
            </div>
          </div>

          {/* Top-Right Viewfinder Screenshot Icon */}
          <button
            onClick={handleScreenshot}
            className="p-1.5 text-white hover:text-purple-100 transition-colors cursor-pointer"
            title="Screenshot"
          >
            <ScreenshotViewfinderIcon className="w-6 h-6 text-white stroke-[2.2]" />
          </button>
        </div>

        {/* Big Floating Circular Checkmark Badge with White Ring (Fully Visible, Overlapping Header) */}
        <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 z-20">
          <div className="w-22 h-22 rounded-full bg-white p-2 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#74117c] flex items-center justify-center text-white shadow-inner">
              <Check className="w-11 h-11 stroke-[4]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Exact matching IMG_20261001_132739_360.jpg) */}
      <div className="px-4 pt-14 pb-2 space-y-4 flex-1 overflow-y-auto">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-[12.5px] font-medium text-slate-600 tracking-tight font-sans">
            Transaction Completed Successfully!
          </h2>
        </div>

        {/* Transaction Summary Card (Captured by Screenshot - Exact matching IMG_20261001_132739_360.jpg) */}
        <div
          ref={receiptCardRef}
          className="bg-[#f8f9fa] rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 space-y-4 text-left"
        >
          <div className="text-xs font-normal text-slate-400 tracking-wide">
            {currentLang === 'am' ? 'የትራንዛክሽን ማጠቃለያ' : 'Transaction Summary'}
          </div>

          {/* Exact CBE Summary Paragraph with Precise Bold/Regular Typography Matching IMG_20261001_132739_360.jpg */}
          <div className="space-y-3.5 text-[12.5px] leading-[1.65] text-slate-900 font-sans">
            <p>
              ETB{' '}
              <strong className="font-bold text-slate-950">
                {(transaction.amount || 2130).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>{' '}
              has been debited from{' '}
              <strong className="font-bold text-slate-950">
                {senderDisplayName}
              </strong>{' '}
              <span className="font-normal text-slate-600">
                {senderAccountDisplay}
              </span>{' '}
              for{' '}
              <strong className="font-bold text-slate-950">
                {receiverDisplayName}
              </strong>{' '}
              <span className="font-normal text-slate-600">
                {receiverAccountDisplay}
              </span>{' '}
              on{' '}
              <strong className="font-bold text-slate-950">
                {formattedDate}
              </strong>{' '}
              with transaction ID:{' '}
              <strong className="font-bold text-slate-950">
                {transaction.referenceNumber || 'FT262277V0S0'}
              </strong>
              . Reason:{' '}
              <span className="font-normal text-slate-900">
                {transaction.note || 'MB Transfer'}
              </span>
            </p>

            <p className="text-[12px] text-slate-800 font-normal leading-relaxed">
              Total Amount Debited: ETB{totalDebited.toFixed(2)} with Service Charge of ETB{serviceCharge.toFixed(2)}, VAT (15%) of ETB{vat.toFixed(2)} and Disaster Recovery (5%) of ETB{disasterRecovery.toFixed(2)}.
            </p>
          </div>

          {/* Large Clean Centered Borderless QR Code (Exact matching IMG_20261001_132739_360.jpg) */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="CBE Verification QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain select-none"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100/60 rounded-lg animate-pulse" />
            )}

            {/* Official CBE Footer under QR code (Exact matching IMG_20261001_132739_360.jpg) */}
            <div className="flex items-center gap-3 pt-1">
              <CbeLogo size="sm" className="w-10 h-10 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-serif leading-tight">
                  Commercial Bank of Ethiopia
                </h4>
                <p className="text-[9.5px] text-slate-500 font-mono tracking-tight">
                  The bank you can always rely on!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="p-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl text-center shadow-lg animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* 3 Action Buttons Row: Receipt, Screenshot, Share (Exact matching IMG_20261001_132739_360.jpg) */}
        <div className="flex items-center justify-around gap-2 px-2 py-1">
          <button
            onClick={onOpenReceiptDetails}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-[#74117c] hover:bg-white transition-all cursor-pointer"
          >
            <Receipt className="w-4.5 h-4.5 text-slate-900 stroke-[2.2]" />
            <span>Receipt</span>
          </button>

          <button
            onClick={handleScreenshot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-[#74117c] hover:bg-white transition-all cursor-pointer"
          >
            <ScreenshotViewfinderIcon className="w-4.5 h-4.5 text-slate-900" />
            <span>Screenshot</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-[#74117c] hover:bg-white transition-all cursor-pointer"
          >
            <Share2 className="w-4.5 h-4.5 text-slate-900 stroke-[2.2]" />
            <span>Share</span>
          </button>
        </div>

        {/* Gray Close Button (Exact matching IMG_20261001_132739_360.jpg) */}
        <div className="pt-1 pb-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#e6e8eb] hover:bg-[#d8dade] active:scale-[0.99] text-slate-700 font-bold text-sm transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
