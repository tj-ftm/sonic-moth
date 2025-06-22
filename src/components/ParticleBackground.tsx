
import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
      glowSize: number;
    }> = [];

    // Create particles with orange/red colors
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.8 + 0.3,
        hue: Math.random() * 60 + 10, // Orange to red range (10-70)
        glowSize: Math.random() * 30 + 20
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Pulse opacity and glow
        const time = Date.now() * 0.001;
        particle.opacity = 0.3 + Math.sin(time + index) * 0.4;
        particle.glowSize = 20 + Math.sin(time * 2 + index) * 15;

        // Draw particle with enhanced glow
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Multiple glow layers for better effect
        for (let i = 0; i < 3; i++) {
          ctx.shadowBlur = particle.glowSize * (i + 1);
          ctx.shadowColor = `hsl(${particle.hue}, 90%, ${60 + i * 10}%)`;
          ctx.fillStyle = `hsl(${particle.hue}, 85%, ${70 - i * 10}%)`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size - i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ParticleBackground;
