'use client';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = 'w-24 h-24' }: LoadingSpinnerProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Single elegant ring */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-200/10" />
      <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" style={{ animationDuration: '1s' }} />
      
      {/* Pulsing center */}
      <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
    </div>
  );
}
