
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
  type: 'web' | 'wind';
}

const MothGame: React.FC<MothGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const gameStateRef = useRef({
    moth: { x: 50, y: 250, width: 30, height: 20, velocityY: 0 },
    lamp: { x: 750, y: 250, width: 40, height: 60 },
    obstacles: [] as Obstacle[],
    keys: { up: false, down: false, left: false, right: false },
    lastObstacleSpawn: 0,
    invulnerable: 0
  });

  const resetGame = () => {
    setLives(3);
    setScore(0);
    setLevel(1);
    gameStateRef.current = {
      moth: { x: 50, y: 250, width: 30, height: 20, velocityY: 0 },
      lamp: { x: 750, y: 250, width: 40, height: 60 },
      obstacles: [],
      keys: { up: false, down: false, left: false, right: false },
      lastObstacleSpawn: 0,
      invulnerable: 0
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
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  };

  const drawMoth = (ctx: CanvasRenderingContext2D, moth: GameObject, time: number) => {
    ctx.save();
    
    // Flapping animation
    const flapOffset = Math.sin(time * 0.01) * 3;
    
    // Moth body (glowing)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#A855F7';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(moth.x + 10, moth.y + 8, 10, 4);
    
    // Wings with flapping animation
    ctx.fillStyle = '#E879F9';
    ctx.shadowColor = '#E879F9';
    
    // Left wing
    ctx.beginPath();
    ctx.ellipse(moth.x + 8, moth.y + 5 + flapOffset, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(moth.x + 22, moth.y + 5 - flapOffset, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawLamp = (ctx: CanvasRenderingContext2D, lamp: GameObject, time: number) => {
    ctx.save();
    
    // Pulsating glow effect
    const glowIntensity = 30 + Math.sin(time * 0.005) * 10;
    
    // Lamp base
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = '#FEF08A';
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(lamp.x, lamp.y + 40, lamp.width, 20);
    
    // Lamp bulb (glowing)
    ctx.shadowColor = '#FBBF24';
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(lamp.x + 20, lamp.y + 20, 18, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Light rays
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayLength = 40 + Math.sin(time * 0.01 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(lamp.x + 20, lamp.y + 20);
      ctx.lineTo(
        lamp.x + 20 + Math.cos(angle) * rayLength,
        lamp.y + 20 + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, time: number) => {
    ctx.save();
    
    if (obstacle.type === 'web') {
      // Spider web with shimmer effect
      const shimmer = Math.sin(time * 0.008) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(156, 163, 175, ${shimmer})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#9CA3AF';
      
      // Draw web pattern
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + i * 10);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + i * 10);
        ctx.stroke();
      }
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(obstacle.x + i * 15, obstacle.y);
        ctx.lineTo(obstacle.x + i * 15, obstacle.y + obstacle.height);
        ctx.stroke();
      }
    } else {
      // Wind gust with particle effect
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3B82F6';
      
      // Draw swirling wind pattern
      for (let i = 0; i < 10; i++) {
        const swirl = Math.sin(time * 0.01 + i) * 5;
        ctx.beginPath();
        ctx.arc(
          obstacle.x + 10 + (i * 5) + swirl,
          obstacle.y + 20 + Math.sin(time * 0.005 + i) * 10,
          3, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }
    
    ctx.restore();
  };

  const gameLoop = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update moth position based on input
    const speed = 4;
    if (state.keys.up && state.moth.y > 0) state.moth.y -= speed;
    if (state.keys.down && state.moth.y < canvas.height - state.moth.height) state.moth.y += speed;
    if (state.keys.left && state.moth.x > 0) state.moth.x -= speed;
    if (state.keys.right && state.moth.x < canvas.width - state.moth.width) state.moth.x += speed;
    
    // Spawn obstacles
    if (currentTime - state.lastObstacleSpawn > 2000 - (level * 100)) {
      const obstacleType = Math.random() < 0.5 ? 'web' : 'wind';
      state.obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 100) + 50,
        width: obstacleType === 'web' ? 50 : 60,
        height: obstacleType === 'web' ? 40 : 30,
        speedX: -3 - (level * 0.5),
        type: obstacleType
      });
      state.lastObstacleSpawn = currentTime;
    }
    
    // Update obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x += obstacle.speedX;
      return obstacle.x + obstacle.width > 0;
    });
    
    // Check collisions with obstacles
    if (state.invulnerable <= 0) {
      for (const obstacle of state.obstacles) {
        if (checkCollision(state.moth, obstacle)) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              onScoreUpdate(score);
            }
            return newLives;
          });
          state.invulnerable = 120; // 2 seconds of invulnerability
          break;
        }
      }
    } else {
      state.invulnerable--;
    }
    
    // Check if moth reached lamp
    if (checkCollision(state.moth, state.lamp)) {
      const levelBonus = level * 50;
      const livesBonus = lives * 25;
      const totalPoints = 100 + levelBonus + livesBonus;
      
      setScore(prev => prev + totalPoints);
      setLevel(prev => prev + 1);
      
      // Reset moth position
      state.moth.x = 50;
      state.moth.y = 250;
      
      // Clear obstacles for next level
      state.obstacles = [];
    }
    
    // Draw everything
    drawMoth(ctx, state.moth, currentTime);
    drawLamp(ctx, state.lamp, currentTime);
    
    state.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle, currentTime);
    });
    
    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Lives: ${lives}`, 20, 30);
    ctx.fillText(`Score: ${score}`, 20, 60);
    ctx.fillText(`Level: ${level}`, 20, 90);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, lives, score, level, onScoreUpdate]);

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
        case 'ar_left':
        case 'a':
          state.keys.left = true;
          break;
        case 'arrowright':
        case 'd':
          state.keys.right = true;
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
        case 'arrowleft':
        case 'a':
          state.keys.left = false;
          break;
        case 'arrowright':
        case 'd':
          state.keys.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <motion.h2 
        className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))', 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))', 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Moth to the Lamp
      </motion.h2>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-purple-500/30 rounded-lg bg-gradient-to-br from-slate-900 to-purple-900/20"
        />
        
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg shadow-purple-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🦋 Start Game
              </motion.button>
              <p className="text-purple-200 mt-4 text-sm">
                Use WASD or Arrow Keys to navigate the moth to the lamp!
              </p>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Game Over!</h3>
              <p className="text-xl text-purple-200 mb-4">Final Score: {score}</p>
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg shadow-purple-500/25"
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
            className={`text-2xl ${index < lives ? 'text-red-400' : 'text-gray-600'}`}
            animate={index < lives ? { 
              filter: ['drop-shadow(0 0 5px rgba(248, 113, 113, 0.8))', 'drop-shadow(0 0 15px rgba(248, 113, 113, 1))', 'drop-shadow(0 0 5px rgba(248, 113, 113, 0.8))']
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ❤️
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MothGame;
