'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface AnimatedButtonProps {
  initialText: string;
  targetText: string;
  icon: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  initialText, 
  targetText, 
  icon
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isHovered) {
      let index = 0;
      const interval = setInterval(() => {
        setText(prev => 
          targetText.slice(0, index) + 
          prev.slice(index)
        );
        index++;
        if (index > targetText.length) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setText(initialText);
    }
  }, [isHovered, initialText, targetText]);

  return (
    <Button
      className="group relative overflow-hidden font-medium transition-all duration-300 ease-in-out whitespace-nowrap rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isHovered ? targetText : initialText}
    >
      <span className="relative z-10 flex items-center justify-center">
        <span className="inline-flex justify-start w-[9ch]">
          {text && text.split('').map((char, index) => (
            <span 
              key={index} 
              className={`inline-block transition-all duration-300 ease-in-out ${char === ' ' ? 'w-[0.25em]' : ''}`}
              style={{ 
                transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                opacity: isHovered ? 0 : 1,
                transitionDelay: `${index * 50}ms`
              }}
            >
              {char}
            </span>
          ))}
        </span>
        {icon}
      </span>
      <span 
        className="absolute inset-0 left-4 z-0 flex items-center justify-start opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
        aria-hidden="true"
      >
        <span className="inline-flex">
          {targetText.split('').map((char, index) => (
            <span 
              key={index} 
              className={`inline-block transition-all duration-300 ease-in-out ${char === ' ' ? 'w-[0.25em]' : ''}`}
              style={{ 
                transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                opacity: isHovered ? 1 : 0,
                transitionDelay: `${index * 50}ms`
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </span>
    </Button>
  );
};

export default AnimatedButton;