import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white/10 dark:bg-white/5 backdrop-filter backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 dark:border-white/10 ${className}`}>
    {children}
  </div>
);

export default GlassCard; 