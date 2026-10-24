import React from 'react';

export const NeoButton = ({
  children,
  onClick,
  variant = 'yellow',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const variantStyles = {
    yellow: 'bg-[#FFE600] text-black hover:bg-[#FFD000]',
    blue: 'bg-[#4285F4] text-white hover:bg-[#3367D6]',
    green: 'bg-[#34A853] text-white hover:bg-[#2D9249]',
    red: 'bg-[#EA4335] text-white hover:bg-[#D33828]',
    dark: 'bg-[#111111] text-white hover:bg-[#222222]',
    white: 'bg-white text-black hover:bg-[#F3F4F6]',
    ghost: 'bg-transparent text-black border-2 border-dashed border-black/40 hover:border-black hover:bg-black/5 shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm sm:text-base px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base sm:text-lg px-6 py-3.5 rounded-xl gap-2.5 font-black',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        neo-btn inline-flex items-center justify-center font-bold tracking-tight
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[2px_2px_0px_0px_#000]
        ${variantStyles[variant] || variantStyles.yellow}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
