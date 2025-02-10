'use client';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--coniferous-green)]" />
    </div>
  );
}
