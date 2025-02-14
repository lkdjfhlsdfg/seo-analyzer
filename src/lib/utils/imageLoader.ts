import { ImageLoader } from 'next/image';

export const customImageLoader: ImageLoader = ({ src, width, quality = 75 }) => {
  // For external images (Google, etc)
  if (src.startsWith('http')) {
    return `${src}?w=${width}&q=${quality}`;
  }
  
  // For local images
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
};

// Preload critical images
export const preloadCriticalImages = (images: string[]) => {
  if (typeof window === 'undefined') return;
  
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}; 