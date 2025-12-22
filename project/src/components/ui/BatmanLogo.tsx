import React from 'react';

interface BatmanLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  color?: string;
}

const BatmanLogo: React.FC<BatmanLogoProps> = ({ 
  size = 'medium', 
  className = '', 
  color = '#FFD700' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Batman Logo SVG */}
        <path
          d="M50 10 C30 10, 15 25, 15 35 C15 45, 25 50, 35 55 C40 57, 45 58, 50 60 C55 58, 60 57, 65 55 C75 50, 85 45, 85 35 C85 25, 70 10, 50 10 Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
        <path
          d="M50 60 C45 65, 35 70, 30 80 C25 85, 30 90, 35 85 C40 80, 45 75, 50 70 C55 75, 60 80, 65 85 C70 90, 75 85, 70 80 C65 70, 55 65, 50 60 Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
        {/* Eyes */}
        <circle cx="42" cy="35" r="3" fill="#000" />
        <circle cx="58" cy="35" r="3" fill="#000" />
        {/* Bat ears */}
        <path
          d="M35 25 C30 15, 25 20, 30 30 Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
        <path
          d="M65 25 C70 15, 75 20, 70 30 Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

// Alternative Batman Symbol Component
export const BatmanSymbol: React.FC<BatmanLogoProps> = ({ 
  size = 'medium', 
  className = '', 
  color = '#FFD700' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Classic Batman Symbol */}
        <path
          d="M50 5 C35 5, 20 15, 15 25 C10 35, 20 40, 30 38 C35 37, 40 35, 45 30 L50 25 L55 30 C60 35, 65 37, 70 38 C80 40, 90 35, 85 25 C80 15, 65 5, 50 5 Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
        <path
          d="M30 38 C25 42, 20 45, 25 48 C30 45, 35 42, 40 38 L50 35 L60 38 C65 42, 70 45, 75 48 C80 45, 75 42, 70 38"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default BatmanLogo;