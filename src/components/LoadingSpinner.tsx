'use client';

export default function LoadingSpinner() {
  return (
    <div className="relative w-16 h-16 mx-auto">
      <div className="absolute inset-0 border-4 border-[var(--synthetic-quartz)] rounded-full" />
      <div className="absolute inset-0 border-4 border-t-[var(--cell-green)] rounded-full animate-spin" />
      <div className="absolute inset-2 border-4 border-[var(--synthetic-quartz)] rounded-full" />
      <div className="absolute inset-2 border-4 border-t-[var(--coniferous-green)] rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
      <div className="absolute inset-4 border-4 border-[var(--synthetic-quartz)] rounded-full" />
      <div className="absolute inset-4 border-4 border-t-[var(--acrylic-blue)] rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
    </div>
  );
}
