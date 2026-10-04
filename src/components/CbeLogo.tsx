import React from 'react';

interface CbeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customUrl?: string;
  isDarkBg?: boolean;
  onClick?: () => void;
}

export const CbeLogo: React.FC<CbeLogoProps> = ({
  className = '',
  size = 'md',
  customUrl,
  isDarkBg = false,
  onClick,
}) => {
  // Use official transparent PNG by default
  const defaultLogo = '/cbe_logo.png';
  const activeUrl = customUrl || localStorage.getItem('cbe_custom_logo_url') || defaultLogo;

  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-28 h-28',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeClass} ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
    >
      <img
        src={activeUrl}
        alt="Commercial Bank of Ethiopia Official Logo"
        className="w-full h-full object-contain"
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
};
