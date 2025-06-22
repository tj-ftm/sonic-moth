import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MothGameProps {
  onScoreUpdate: (points: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle extends GameObject {
  speedX: number;
  type: 'wind';
}

interface Projectile extends GameObject {
  speedX: number;
}

const MothGame: React.FC<MothGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [hitTint, setHitTint] = useState(false);

  const gameStateRef = useRef({
    moth: { x: 400, y: 250, width: 50, height: 35, velocityY: 0 },
    obstacles: [] as Obstacle[],
    projectiles: [] as Projectile[],
    keys: { up: false, down: false, space: false },
    lastObstacleSpawn: 0,
    invulnerable: 0,
    continuousScore: 0,
    lastScoreTime: 0,
    lastProjectileTime: 0
  });

  const resetGame = () => {
    setLives(3);
    setScore(0);
    setLevel(1);
    setIsShaking(false);
    setHitTint(false);
    gameStateRef.current = {
      moth: { x: 400, y: 250, width: 50, height: 35, velocityY: 0 },
      obstacles: [],
      projectiles: [],
      keys: { up: false, down: false, space: false },
      lastObstacleSpawn: 0,
      invulnerable: 0,
      continuousScore: 0,
      lastScoreTime: 0,
      lastProjectileTime: 0
    };
  };

  const checkCollision = (rect1: GameObject, rect2: GameObject): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const drawGlowingRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, glowColor: string) => {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  };

  const drawMoth = (ctx: CanvasRenderingContext2D, moth: GameObject, time: number, isHit: boolean) => {
    ctx.save();
    
    const flapOffset = Math.sin(time * 0.008) * 3;
    const color = isHit ? '#FF0000' : '#F97316';
    const glowColor = isHit ? '#FF0000' : '#FB923C';
    const glowIntensity = isHit ? 30 : 15;
    
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.fillRect(moth.x + 15, moth.y + 12, 20, 8);
    
    // Wings with animation
    ctx.fillStyle = isHit ? '#FF4444' : '#FB7185';
    
    // Left wing
    ctx.beginPath();
    ctx.ellipse(moth.x + 12, moth.y + 8 + flapOffset, 15, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(moth.x + 38, moth.y + 8 - flapOffset, 15, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawSunGlow = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.save();
    
    const glowIntensity = 30 + Math.sin(time * 0.003) * 10;
    
    // Create radial gradient for sun effect
    const gradient = ctx.createRadialGradient(800, 250, 0, 800, 250, 200);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(600, 50, 400, 400);
    
    // Add sun rays
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 + time * 0.001;
      const x1 = 800 + Math.cos(angle) * 100;
      const y1 = 250 + Math.sin(angle) * 100;
      const x2 = 800 + Math.cos(angle) * 150;
      const y2 = 250 + Math.sin(angle) * 150;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, time: number) => {
    ctx.save();
    
    // Blue rotating wind obstacle
    const rotation = time * 0.005;
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(rotation);
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3B82F6';
    
    // Draw rotating spiral pattern
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * 20;
      const y = Math.sin(angle) * 20;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile) => {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2, projectile.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const triggerHitEffect = () => {
    setIsShaking(true);
    setHitTint(true);
    setTimeout(() => setIsShaking(false), 200);
    setTimeout(() => setHitTint(false), 300);
  };

  const gameLoop = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = hitTint ? 'rgba(255, 0, 0, 0.3)' : '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sun glow on the right side
    drawSunGlow(ctx, currentTime);
    
    // Update moth position (only up/down movement)
    const speed = 6;
    if (state.keys.up && state.moth.y > 0) state.moth.y -= speed;
    if (state.keys.down && state.moth.y < canvas.height - state.moth.height) state.moth.y += speed;
    
    // Handle shooting
    if (state.keys.space && currentTime - state.lastProjectileTime > 200) {
      state.projectiles.push({
        x: state.moth.x + state.moth.width,
        y: state.moth.y + state.moth.height / 2 - 3,
        width: 6,
        height: 6,
        speedX: 8
      });
      state.lastProjectileTime = currentTime;
    }
    
    // Continuous scoring
    if (currentTime - state.lastScoreTime > 200) {
      state.continuousScore += 1;
      setScore(state.continuousScore);
      state.lastScoreTime = currentTime;
    }
    
    // Spawn obstacles (only blue rotating wind)
    if (currentTime - state.lastObstacleSpawn > Math.max(1500 - (level * 100), 800)) {
      const numObstacles = Math.random() < 0.3 ? 2 : 1;
      
      for (let i = 0; i < numObstacles; i++) {
        state.obstacles.push({
          x: canvas.width + i * 150,
          y: Math.random() * (canvas.height - 100) + 50,
          width: 60,
          height: 60,
          speedX: -4 - (level * 0.5),
          type: 'wind'
        });
      }
      state.lastObstacleSpawn = currentTime;
    }
    
    // Update obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x += obstacle.speedX;
      return obstacle.x + obstacle.width > 0;
    });
    
    // Update projectiles
    state.projectiles = state.projectiles.filter(projectile => {
      projectile.x += projectile.speedX;
      return projectile.x < canvas.width;
    });
    
    // Check projectile-obstacle collisions
    state.projectiles.forEach((projectile, pIndex) => {
      state.obstacles.forEach((obstacle, oIndex) => {
        if (checkCollision(projectile, obstacle)) {
          state.projectiles.splice(pIndex, 1);
          state.obstacles.splice(oIndex, 1);
          state.continuousScore += 10;
          setScore(state.continuousScore);
        }
      });
    });
    
    // Check moth-obstacle collisions
    let isHit = false;
    if (state.invulnerable <= 0) {
      for (const obstacle of state.obstacles) {
        if (checkCollision(state.moth, obstacle)) {
          state.continuousScore = Math.max(0, state.continuousScore - 50);
          setScore(state.continuousScore);
          
          triggerHitEffect();
          
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              onScoreUpdate(state.continuousScore);
            }
            return newLives;
          });
          state.invulnerable = 120;
          isHit = true;
          break;
        }
      }
    } else {
      state.invulnerable--;
      isHit = state.invulnerable > 60;
    }
    
    // Level progression
    if (state.continuousScore > 0 && state.continuousScore % 500 === 0) {
      setLevel(prev => prev + 1);
    }
    
    // Draw everything
    drawMoth(ctx, state.moth, currentTime, isHit);
    
    state.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle, currentTime);
    });
    
    state.projectiles.forEach(projectile => {
      drawProjectile(ctx, projectile);
    });
    
    // Draw UI
    ctx.fillStyle = '#FFD700';
    ctx.font = '18px Arial';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(`Score: ${state.continuousScore}`, 20, 30);
    ctx.fillText(`Level: ${level}`, 20, 55);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, lives, level, onScoreUpdate, hitTint]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          state.keys.up = true;
          break;
        case 'arrowdown':
        case 's':
          state.keys.down = true;
          break;
        case ' ':
          e.preventDefault();
          state.keys.space = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          state.keys.up = false;
          break;
        case 'arrowdown':
        case 's':
          state.keys.down = false;
          break;
        case ' ':
          e.preventDefault();
          state.keys.space = false;
          break;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const state = gameStateRef.current;
      
      // Right side of screen for shooting
      if (x > canvas.width / 2) {
        state.keys.space = true;
      } else {
        // Left side for movement
        if (y < canvas.height / 2) {
          state.keys.up = true;
        } else {
          state.keys.down = true;
        }
      }
    };

    const handleTouchEnd = () => {
      const state = gameStateRef.current;
      state.keys.up = false;
      state.keys.down = false;
      state.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <motion.h2 
        className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))', 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.7))', 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))']
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Moth to the Light
      </motion.h2>

      <div className="relative">
        <motion.canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-orange-500/30 rounded-lg shadow-2xl shadow-orange-500/20"
          animate={isShaking ? { 
            x: [0, -5, 5, -5, 5, 0],
            y: [0, -2, 2, -2, 2, 0]
          } : {}}
          transition={{ duration: 0.2 }}
        />
        
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg shadow-orange-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🦋 Start Game
              </motion.button>
              <p className="text-orange-200 mt-4 text-sm">
                Use WASD/Arrow Keys to move up/down, SPACE to shoot!
              </p>
              <p className="text-orange-300 mt-2 text-xs">
                Mobile: Touch left side to move, right side to shoot
              </p>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Game Over!</h3>
              <p className="text-xl text-orange-200 mb-4">Final Score: {score}</p>
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg shadow-orange-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🦋 Play Again
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className={`text-3xl ${index < lives ? 'text-red-400' : 'text-gray-600'}`}
            animate={index < lives ? { 
              filter: ['drop-shadow(0 0 8px rgba(248, 113, 113, 0.8))', 'drop-shadow(0 0 12px rgba(248, 113, 113, 1))', 'drop-shadow(0 0 8px rgba(248, 113, 113, 0.8))']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ❤️
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MothGame;