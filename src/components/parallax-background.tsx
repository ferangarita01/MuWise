
'use client';

import { useEffect } from 'react';

export function ParallaxBackground() {
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const scrollVel = (y - ((window as any).lastY || 0)) * 0.12;
      (window as any).lastY = y;
      
      const blobA = document.getElementById('blobA');
      const blobB = document.getElementById('blobB');
      const t = y * 0.06;
      
      if (blobA) blobA.style.transform = `translateY(${t}px) rotate(${t * 0.08}deg)`;
      if (blobB) blobB.style.transform = `translateY(${t * -0.6}px) rotate(${t * -0.06}deg)`;
    };

    (window as any).lastY = window.scrollY;
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
     <div className="fixed inset-0 -z-10 pointer-events-none">
      <div id="blobA" className="parallax absolute -top-32 -left-20 h-[42rem] w-[42rem] rounded-full blur-3xl opacity-40" style={{background: 'radial-gradient(60% 60% at 50% 50%, #7c3aed 0%, #1e3a8a 40%, transparent 70%)', filter: 'blur(64px)'}}></div>
      <div id="blobB" className="parallax absolute top-24 right-[-8rem] h-[36rem] w-[36rem] rounded-full blur-3xl opacity-40" style={{background: 'radial-gradient(60% 60% at 50% 50%, #06b6d4 0%, #2563eb 45%, transparent 75%)', filter: 'blur(72px)'}}></div>
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:56px_56px]"></div>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{backgroundImage:"url('https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/img_bg.avif?alt=media&token=42db5a3d-4c15-4721-8255-b472e3452445')"}} data-ai-hint="music production"></div>
    </div>
  )
}
