import React from 'react';

export const NeoBadge = ({
  children,
  variant = 'yellow',
  size = 'md',
  isPill = true,
  dot = false,
  className = '',
  icon: Icon
}) => {
  const variantStyles = {
    yellow: 'bg-[#FFE600] text-black border-black',
    green: 'bg-[#D1FADF] text-[#027A48] border-black',
    greenSolid: 'bg-[#34A853] text-white border-black',
    blue: 'bg-[#D1E9FF] text-[#175CD3] border-black',
    blueSolid: 'bg-[#4285F4] text-white border-black',
    red: 'bg-[#FEE4E2] text-[#B42318] border-black',
    redSolid: 'bg-[#EA4335] text-white border-black',
    purple: 'bg-[#F4EBFF] text-[#6941C6] border-black',
    orange: 'bg-[#FEF0C7] text-[#B54708] border-black',
    white: 'bg-white text-black border-black',
    dark: 'bg-black text-white border-black',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 border-[1.5px]',
    sm: 'text-xs px-2.5 py-1 border-[2px]',
    md: 'text-xs sm:text-sm px-3 py-1 border-[2px]',
    lg: 'text-sm sm:text-base px-4 py-1.5 border-[2.5px]',
  };

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase tracking-wider select-none shrink-0
        ${isPill ? 'rounded-full' : 'rounded-lg'}
        ${variantStyles[variant] || variantStyles.yellow}
        ${sizeStyles[size] || sizeStyles.sm}
        ${className}
      `}
    >
      {dot && (
        <span className="w-2 h-2 rounded-full mr-1.5 animate-pulse bg-current"></span>
      )}
      {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
      {children}
    </span>
  );
};
