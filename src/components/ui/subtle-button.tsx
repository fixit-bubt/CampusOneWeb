'use client'
import React, { useState } from 'react'

export interface BorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export default function BorderButton({
  children = "Get Started",
  className = "",
  onClick,
  ...props
}: BorderButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button 
      className={`group relative border-2 flex justify-center items-center gap-3 border-white/70 rounded-full w-[9.6rem] h-12 
                 transition-all duration-500 ease-out hover:border-white hover:shadow-lg hover:shadow-white/20 
                 hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm cursor-pointer
                 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
                 before:via-white/5 before:to-transparent before:translate-x-[-100%] 
                 hover:before:translate-x-[100%] before:transition-transform before:duration-700 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      {...props}
    >
      {/* Subtle glow effect */}
      <div className='absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400/15 to-emerald-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
      
      {/* Text */}
      <span className='text-white font-semibold tracking-wide text-sm transition-all duration-300 
                       group-hover:text-emerald-50 relative z-10'>
        {children}
      </span>
      
      {/* Animated dot */}
      <span className={`relative z-10 w-3.5 h-3.5 bg-emerald-400 rounded-full transition-all duration-500 ease-out
                       ${isHovered ? 'bg-emerald-300 shadow-lg shadow-emerald-400/50 scale-110' : ''}
                       ${isPressed ? 'scale-90' : ''}
                       before:absolute before:inset-0 before:bg-emerald-400 before:rounded-full 
                       before:animate-pulse before:opacity-0 group-hover:before:opacity-30`}>
        {/* Ripple effect */}
        <div className='absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-0 group-hover:opacity-75'
             style={{ animationDuration: '2s' }}></div>
      </span>
      
      {/* Hover state border animation */}
      <div className='absolute inset-0 rounded-full border-2 border-emerald-400/0 
                      group-hover:border-emerald-400/35 transition-all duration-500 
                      animate-pulse opacity-0 group-hover:opacity-100'></div>
    </button>
  )
}
