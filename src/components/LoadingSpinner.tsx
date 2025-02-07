'use client';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = 'w-24 h-24' }: LoadingSpinnerProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
      <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" style={{ animationDuration: '1s' }} />
      
      {/* Middle ring */}
      <div className="absolute inset-4 rounded-full border-4 border-white/5" />
      <div className="absolute inset-4 rounded-full border-4 border-t-secondary animate-spin" style={{ animationDuration: '1.5s' }} />
      
      {/* Inner ring */}
      <div className="absolute inset-8 rounded-full border-4 border-white/5" />
      <div className="absolute inset-8 rounded-full border-4 border-t-primary animate-spin" style={{ animationDuration: '2s' }} />
      
      {/* Center dot */}
      <div className="absolute inset-[14px] rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse-slow" />
    </div>
  );
}
