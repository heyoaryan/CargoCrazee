import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animated = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24'
  };

  const LogoComponent = () => (
    <motion.img 
      src="/logo.png"
      alt="CargoCrazee Logo"
      className={`${sizeClasses[size]} object-contain object-center ${className}`}
      style={{
        aspectRatio: '1 / 1',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
      animate={animated ? { 
        x: [0, 2, 0],
        scale: [1, 1.02, 1]
      } : {}}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    />
  );

  return <LogoComponent />;
};

export default Logo; 