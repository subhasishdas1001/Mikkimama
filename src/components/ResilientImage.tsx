import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F5EBE6] via-[#EFE5DC] to-[#E6D7CC] text-[#6E5D55] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 text-[#B6766C] mb-2 opacity-80" />
        <span className="font-serif-display text-sm italic text-[#2C221E] line-clamp-2">
          {fallbackLabel || alt || 'Mikkimama Handcrafted Piece'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
