import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  onClick?: () => void;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  onClick,
  loading = 'lazy',
  fetchPriority,
  width,
  height,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-[#F2E9E1] text-[#7D6B61] p-6 text-center select-none ${className}`}
      >
        <Sparkles className="w-6 h-6 text-[#B6766C] mb-2 opacity-75" />
        <span className="font-serif-display text-sm italic text-[#4A3B33]">
          {fallbackLabel || alt || 'Mikkimama Handmade Piece'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      onClick={onClick}
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
