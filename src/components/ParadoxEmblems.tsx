import React from 'react';
import { PRX_BACKGROUND_IMAGE } from '../data/paradoxData';

/**
 * PRX Emblem inspired by the user's attached fractured ice PRX monogram.
 * Supports custom logo URLs and click-to-swap when Admin / Ctrl+E edit mode is active.
 */
export function PrxLogoEmblem({
  className = 'w-9 h-9',
  src = PRX_BACKGROUND_IMAGE,
  editEnabled = false,
  onSwapImage,
}: {
  className?: string;
  src?: string;
  editEnabled?: boolean;
  onSwapImage?: () => void;
}) {
  const isCustom = src !== PRX_BACKGROUND_IMAGE;

  const handleClick = (e: React.MouseEvent) => {
    if (editEnabled && onSwapImage) {
      e.preventDefault();
      e.stopPropagation();
      onSwapImage();
    }
  };

  return (
    <div
      onClick={handleClick}
      title={editEnabled ? 'Click to swap logo image' : undefined}
      className={`relative overflow-hidden rounded-xl border border-[#93C5FD]/45 bg-[#0B1736] shadow-[0_0_16px_rgba(96,165,250,0.28)] shrink-0 ${className} ${
        editEnabled
          ? 'outline-1 outline-dashed outline-[#7DD3FC]/75 hover:outline-[#BAE6FD] cursor-pointer'
          : ''
      }`}
    >
      <img
        src={src || PRX_BACKGROUND_IMAGE}
        alt="PRX Emblem"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${
          isCustom ? 'object-center' : 'scale-[1.85] object-[50%_38%]'
        }`}
      />
    </div>
  );
}

/**
 * Crisp Y3K Ice-Chrome 4-point star accent
 */
export function Y3KIceStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 2C17.4 11.2 20.8 14.6 30 16C20.8 17.4 17.4 20.8 16 30C14.6 20.8 11.2 17.4 2 16C11.2 14.6 14.6 11.2 16 2Z"
        fill="url(#y3k-star-grad)"
      />
      <defs>
        <linearGradient id="y3k-star-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
