import React, { useState } from 'react';
import { Upload, RotateCcw, Check, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface CbeLogoModalProps {
  onClose: () => void;
  currentLogoUrl?: string;
  onUpdateLogo: (newUrl: string) => void;
}

export const CbeLogoModal: React.FC<CbeLogoModalProps> = ({
  onClose,
  currentLogoUrl,
  onUpdateLogo,
}) => {
  const defaultLogo = '/cbe_logo.png';
  const [logoInput, setLogoInput] = useState(currentLogoUrl || defaultLogo);
  const [preview, setPreview] = useState(currentLogoUrl || defaultLogo);
  const [urlInput, setUrlInput] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveQrTab] = useState<'upload' | 'url'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setLogoInput(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      setLogoInput(urlInput.trim());
    }
  };

  const handleSave = () => {
    onUpdateLogo(logoInput);
    localStorage.setItem('cbe_custom_logo_url', logoInput);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleResetDefault = () => {
    setLogoInput(defaultLogo);
    setPreview(defaultLogo);
    onUpdateLogo(defaultLogo);
    localStorage.removeItem('cbe_custom_logo_url');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 text-center">
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'upload' ? 'የሎጎ መቀየሪያ (Change Logo)' : 'በሊንክ ቀይር (Logo by URL)'}
          </h3>
          <p className="text-[11px] text-slate-500">
            በካርዱ ላይ የሚታየውን ሎጎ መቀየር ይችላሉ። የራስዎን ፎቶ ወይም ሊንክ ያስገቡ።
          </p>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-purple-200">
          <div className="relative group">
             {preview ? (
              <img
                src={preview}
                alt="CBE Logo Preview"
                className="w-24 h-24 object-contain shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultLogo;
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 text-[#74117c] flex items-center justify-center">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-purple-600 mt-2 uppercase tracking-widest">የሎጎ እይታ (Preview)</span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveQrTab('upload')}
            className={`py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            UPLOAD
          </button>
          <button
            onClick={() => setActiveQrTab('url')}
            className={`py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'url' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            URL
          </button>
        </div>

        {/* Dynamic Inputs */}
        <div className="min-h-[60px] flex items-center">
          {activeTab === 'upload' ? (
            <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-[#74117c] font-bold cursor-pointer transition-colors shadow-sm text-xs">
              <Upload className="w-4 h-4" />
              <span>ፎቶ ምረጥ (Choose Image)</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          ) : (
            <div className="flex w-full gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleUrlApply}
                className="px-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 px-4 bg-[#74117c] hover:bg-[#600e67] text-white font-bold rounded-2xl text-xs shadow-md shadow-[#74117c]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {success ? <Check className="w-4 h-4 text-emerald-300" /> : <Check className="w-4 h-4" />}
            <span>{success ? 'ሎጎው ተቀምጧል!' : 'ለውጡን አጽድቅ (Save Logo)'}</span>
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetDefault}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ወደ ነባሪ መልስ (Reset)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
