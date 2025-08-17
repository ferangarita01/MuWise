
'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export function InteractiveAuthBackground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const physicsLettersRef = useRef(new Map());

  useEffect(() => {
    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events,
      Body = Matter.Body,
      Runner = Matter.Runner;

    const engine = engineRef.current;
    engine.world.gravity.y = 0.4;
    engine.world.gravity.x = 0;

    const scene = sceneRef.current;
    if (!scene) return;

    // Create invisible walls
    const walls = [
      Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, label: 'ground' }),
      Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'leftWall' }),
      Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'rightWall' }),
    ];
    World.add(engine.world, walls);

    const loginBox = document.getElementById('login-box');
    let loginBoxBody: Matter.Body | null = null;

    const setupLoginBoxCollision = () => {
      if (loginBox) {
        const rect = loginBox.getBoundingClientRect();
        loginBoxBody = Bodies.rectangle(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          rect.width,
          rect.height,
          { isStatic: true, restitution: 0.6, friction: 0.3, label: 'loginBox' }
        );
        World.add(engine.world, loginBoxBody);
      }
    };
    
    setupLoginBoxCollision();

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
                y: letterBody.velocity.y - Math.random() * 2 - 1,
              });
            }
          }
        }
      });
    });

    Runner.run(engine);

    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterInterval = setInterval(() => {
      const letter = document.createElement('div');
      letter.className = 'matrix-letter';
      letter.textContent = characters[Math.floor(Math.random() * characters.length)];
      letter.style.left = Math.random() * window.innerWidth + 'px';
      letter.style.top = '-20px';
      
      scene.appendChild(letter);
      
      if (Math.random() < 0.2) { // 20% chance for physics
        const physicsBody = Bodies.circle(parseFloat(letter.style.left), -20, 8, {
          restitution: 0.7, friction: 0.1, density: 0.001, label: 'matrixLetter'
        });
        Body.setVelocity(physicsBody, { x: (Math.random() - 0.5) * 2, y: Math.random() * 3 + 1 });
        World.add(engine.world, physicsBody);
        physicsLettersRef.current.set(physicsBody.id, letter);
      } else {
        letter.classList.add('falling');
        letter.style.animationDuration = (Math.random() * 3 + 5) + 's';
        letter.style.animationDelay = Math.random() * 3 + 's';
        setTimeout(() => letter.remove(), 9000);
      }
    }, 150);

    const updateRender = () => {
      physicsLettersRef.current.forEach((element, bodyId) => {
        const body = engine.world.bodies.find(b => b.id === bodyId);
        if (body) {
          element.style.left = body.position.x + 'px';
          element.style.top = body.position.y + 'px';
          element.style.transform = `rotate(${body.angle}rad)`;
          
          if (body.position.y > window.innerHeight + 100) {
            World.remove(engine.world, body);
            element.remove();
            physicsLettersRef.current.delete(bodyId);
          }
        }
      });
      requestAnimationFrame(updateRender);
    };
    updateRender();

    const handleResize = () => {
      // update walls
      // update login box
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(letterInterval);
      window.removeEventListener('resize', handleResize);
      World.clear(engine.world, false);
      Engine.clear(engine);
      scene.innerHTML = '';
    };
  }, []);

  return (
    <>
        <div ref={sceneRef} id="matrix-rain" className="matrix-rain"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-950 opacity-40"></div>
    </>
  );
}
