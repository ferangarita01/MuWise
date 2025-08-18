
'use client';

import { InteractiveAuthBackground } from '@/components/interactive-auth-background';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // dynamically add lucide icons script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';
    script.async = true;
    document.body.appendChild(script);

    // after script is loaded, create icons
    script.onload = () => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    };
    
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div 
      className="font-inter bg-gray-950 min-h-screen flex items-center justify-center antialiased"
      suppressHydrationWarning={true}
    >
      <InteractiveAuthBackground />
      <div 
        className="login-container w-full max-w-md px-6 z-10"
        id="login-container"
      >
        {children}
      </div>
    </div>
  );
}
