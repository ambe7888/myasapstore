import React, { useEffect, useState } from 'react';

export default function StickyBottomBar({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  // Small delay to animate in after load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed bar */}
      <div className="h-28 w-full" aria-hidden="true" />
      
      {/* Fixed bottom bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-lg p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-gray-200 flex gap-3 transition-transform duration-500 ease-out md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:max-w-[90vw] md:rounded-2xl md:border md:shadow-2xl ${
          isVisible ? 'translate-y-0' : 'translate-y-full md:translate-y-[150%]'
        }`}
      >
        {children}
      </div>
    </>
  );
}
