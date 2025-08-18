
'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export function InteractiveAuthBackground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const physicsLettersRef = useRef<Map<number, HTMLElement>>(new Map());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sceneRef.current) return;

    const { Engine, World, Bodies, Events, Body, Runner } = Matter;
    engineRef.current = Engine.create();
    const engine = engineRef.current;
    
    engine.world.gravity.y = 0.8;
    engine.world.gravity.x = 0;
    const scene = sceneRef.current;

    const walls = [
      Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, label: 'ground' }),
      Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'leftWall' }),
      Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'rightWall' }),
    ];
    World.add(engine.world, walls);

    let loginBoxBody: Matter.Body | null = null;
    const setupLoginBoxCollision = () => {
      const loginBox = document.getElementById('login-box');
      if (loginBox) {
        const rect = loginBox.getBoundingClientRect();
        if (rect.width > 0) {
          if (loginBoxBody) World.remove(engine.world, loginBoxBody);
          loginBoxBody = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            { isStatic: true, restitution: 0.8, friction: 0.3, label: 'loginBox' }
          );
          World.add(engine.world, loginBoxBody);
        }
      }
    };
    
    const timer = setTimeout(setupLoginBoxCollision, 100);
    window.addEventListener('resize', setupLoginBoxCollision);

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'loginBox' || bodyB.label === 'loginBox') {
          const letterBody = bodyA.label === 'matrixLetter' ? bodyA : bodyB;
          if (letterBody.label === 'matrixLetter') {
            const letterElement = physicsLettersRef.current.get(letterBody.id);
            if (letterElement) {
              letterElement.classList.add('physics-active');
              const loginContainer = document.getElementById('login-container');
              if (loginContainer) {
                loginContainer.classList.add('protected');
                setTimeout(() => loginContainer.classList.remove('protected'), 1500);
              }
              Body.setVelocity(letterBody, {
                x: letterBody.velocity.x + (Math.random() - 0.5) * 5,
                y: letterBody.velocity.y - Math.random() * 3,
              });
            }
          }
        }
      });
    });

    const runner = Runner.run(engine);

    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterInterval = setInterval(() => {
      if(document.hidden) return; // Pause if tab is not active
      const letter = document.createElement('div');
      letter.className = 'matrix-letter';
      letter.textContent = characters[Math.floor(Math.random() * characters.length)];
      const startX = Math.random() * window.innerWidth;
      letter.style.left = startX + 'px';
      letter.style.top = '-20px';
      scene.appendChild(letter);
      
      if (Math.random() < 0.3) {
        const physicsBody = Bodies.circle(startX, -20, 8, {
          restitution: 0.7, friction: 0.1, frictionAir: 0.01, density: 0.001, label: 'matrixLetter'
        });
        Body.setVelocity(physicsBody, { x: (Math.random() - 0.5) * 2, y: Math.random() * 3 + 2 });
        World.add(engine.world, physicsBody);
        physicsLettersRef.current.set(physicsBody.id, letter);
      } else {
        letter.classList.add('falling');
        letter.style.animationDuration = (Math.random() * 3 + 4) + 's';
        letter.style.animationDelay = Math.random() * 2 + 's';
        setTimeout(() => letter.remove(), 8000);
      }
    }, 200);

    let frameId: number;
    const updateRender = () => {
      if (engineRef.current) {
          physicsLettersRef.current.forEach((element, bodyId) => {
            const body = engineRef.current!.world.bodies.find(b => b.id === bodyId);
            if (body) {
              element.style.transform = `translate(${body.position.x - parseFloat(element.style.left || '0')}px, ${body.position.y - parseFloat(element.style.top || '0')}px) rotate(${body.angle}rad)`;
              if (body.position.y > window.innerHeight + 100) {
                World.remove(engineRef.current!.world, body);
                element.remove();
                physicsLettersRef.current.delete(bodyId);
              }
            } else {
              physicsLettersRef.current.delete(bodyId);
              element.remove();
            }
          });
      }
      frameId = requestAnimationFrame(updateRender);
    };
    frameId = requestAnimationFrame(updateRender);

    return () => {
      clearTimeout(timer);
      clearInterval(letterInterval);
      window.removeEventListener('resize', setupLoginBoxCollision);
      cancelAnimationFrame(frameId);
      if (engineRef.current) {
        Runner.stop(runner);
        World.clear(engineRef.current.world, false);
        Engine.clear(engineRef.current);
      }
      if (sceneRef.current) {
        sceneRef.current.innerHTML = '';
      }
      physicsLettersRef.current.clear();
    };
  }, [isMounted]);
  
  return (
    <>
      <style>{`
        .matrix-rain { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: hidden; }
        .matrix-letter { position: absolute; color: rgba(255, 255, 255, 0.5); font-family: 'Inter', monospace; font-weight: 600; font-size: 14px; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); user-select: none; pointer-events: none; transition: color 0.3s ease; }
        .matrix-letter.physics-active { color: rgba(99, 102, 241, 0.9); text-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(99, 102, 241, 0.4); animation: physicsGlow 2s ease-out forwards; }
        .matrix-letter.falling { animation: fall linear infinite; opacity: 0; }
        @keyframes fall { 0% { transform: translateY(-100px); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes physicsGlow { 0% { filter: brightness(1); } 50% { filter: brightness(1.5); } 100% { filter: brightness(0.7); opacity: 0.6; } }
        .login-container::before { content: ''; position: absolute; inset: -20px; border: 2px solid transparent; border-radius: 24px; background: linear-gradient(45deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3)) border-box; mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
        .login-container.protected::before { opacity: 1; animation: shieldPulse 1s ease-out; }
        @keyframes shieldPulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 1; } }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.6s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .ripple { position: relative; overflow: hidden; }
        .ripple::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.2); transform: translate(-50%, -50%); transition: width 0.6s, height 0.6s; }
        .ripple:active::after { width: 300px; height: 300px; }
        .floating { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .glow { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2); }
        .input-focus { transition: all 0.3s ease; }
        .input-focus:focus { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 0 8px 25px -5px rgba(0, 0, 0, 0.4); }
        .security-indicator { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; font-size: 11px; font-weight: 500; color: rgb(74 222 128); }
      `}</style>
      <div ref={sceneRef} id="matrix-rain" className="matrix-rain" suppressHydrationWarning={true}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-950 opacity-40"></div>
    </>
  );
}

    