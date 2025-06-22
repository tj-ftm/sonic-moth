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
    invulnerable: 0,
    continuousScore: 0,
    lastScoreTime: 0
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
      invulnerable: 0,
      continuousScore: 0,
      lastScoreTime: 0
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
    ctx.shadowBlur = 15; // Reduced glow for performance
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  };

  const drawMoth = (ctx: CanvasRenderingContext2D, moth: GameObject, time: number, isHit: boolean) => {
    ctx.save();
    
    const flapOffset = Math.sin(time * 0.008) * 2; // Reduced animation frequency
    const color = isHit ? '#FF0000' : '#F97316';
    const glowColor = isHit ? '#FF0000' : '#FB923C';
    const glowIntensity = isHit ? 30 : 10; // Reduced glow for performance
    
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.fillRect(moth.x + 10, moth.y + 8, 10, 4);
    
    // Wings with simplified animation
    ctx.fillStyle = isHit ? '#FF4444' : '#FB7185';
    
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
    
    const glowIntensity = 20 + Math.sin(time * 0.003) * 5; // Reduced animation
    
    // Simplified gradient without banding
    const gradient = ctx.createRadialGradient(lamp.x + 20, lamp.y + 20, 0, lamp.x + 20, lamp.y + 20, 50);
    gradient.addColorStop(0, '#FED7AA');
    gradient.addColorStop(0.5, '#FB923C');
    gradient.addColorStop(1, 'rgba(234, 88, 12, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(lamp.x - 30, lamp.y - 30, 100, 100);
    
    // Lamp base
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = '#FB923C';
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(lamp.x, lamp.y + 40, lamp.width, 20);
    
    // Lamp bulb
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.ellipse(lamp.x + 20, lamp.y + 20, 18, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, time: number) => {
    ctx.save();
    
    if (obstacle.type === 'web') {
      const shimmer = Math.sin(time * 0.005) * 0.2 + 0.8; // Reduced animation
      ctx.strokeStyle = `rgba(156, 163, 175, ${shimmer})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#9CA3AF';
      
      // Simplified web pattern
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
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3B82F6';
      
      // Simplified wind pattern
      for (let i = 0; i < 8; i++) {
        const swirl = Math.sin(time * 0.008 + i) * 6;
        ctx.beginPath();
        ctx.arc(
          obstacle.x + 10 + (i * 6) + swirl,
          obstacle.y + 20 + Math.sin(time * 0.004 + i) * 8,
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
    
    // Clear canvas with solid background (no gradient for performance)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update moth position
    const speed = 4;
    if (state.keys.up && state.moth.y > 0) state.moth.y -= speed;
    if (state.keys.down && state.moth.y < canvas.height - state.moth.height) state.moth.y += speed;
    if (state.keys.left && state.moth.x > 0) state.moth.x -= speed;
    if (state.keys.right && state.moth.x < canvas.width - state.moth.width) state.moth.x += speed;
    
    // Continuous scoring with reduced frequency for performance
    if (currentTime - state.lastScoreTime > 200) { // Increased interval
      state.continuousScore += 1;
      setScore(state.continuousScore);
      state.lastScoreTime = currentTime;
    }
    
    // Spawn obstacles with reduced frequency
    if (currentTime - state.lastObstacleSpawn > Math.max(1200 - (level * 100), 600)) {
      const obstacleType = Math.random() < 0.6 ? 'web' : 'wind';
      const numObstacles = Math.random() < 0.2 ? 2 : 1; // Reduced double obstacle chance
      
      for (let i = 0; i < numObstacles; i++) {
        state.obstacles.push({
          x: canvas.width + i * 120,
          y: Math.random() * (canvas.height - 150) + 50,
          width: obstacleType === 'web' ? 50 : 60,
          height: obstacleType === 'web' ? 40 : 35,
          speedX: -3 - (level * 0.5), // Slightly reduced speed
          type: obstacleType
        });
      }
      state.lastObstacleSpawn = currentTime;
    }
    
    // Update obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x += obstacle.speedX;
      return obstacle.x + obstacle.width > 0;
    });
    
    // Check collisions
    let isHit = false;
    if (state.invulnerable <= 0) {
      for (const obstacle of state.obstacles) {
        if (checkCollision(state.moth, obstacle)) {
          // Deduct points on hit
          state.continuousScore = Math.max(0, state.continuousScore - 50);
          setScore(state.continuousScore);
          
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
      isHit = state.invulnerable > 60; // Show hit effect for first half of invulnerability
    }
    
    // Check lamp collision
    if (checkCollision(state.moth, state.lamp)) {
      const levelBonus = level * 100;
      const livesBonus = lives * 50;
      state.continuousScore += 200 + levelBonus + livesBonus;
      setScore(state.continuousScore);
      setLevel(prev => prev + 1);
      
      state.moth.x = 50;
      state.moth.y = 250;
      state.obstacles = [];
    }
    
    // Draw everything with optimized rendering
    drawMoth(ctx, state.moth, currentTime, isHit);
    drawLamp(ctx, state.lamp, currentTime);
    
    state.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle, currentTime);
    });
    
    // Draw UI with reduced glow
    ctx.fillStyle = '#FB923C';
    ctx.font = '18px Arial';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FB923C';
    ctx.fillText(`Score: ${state.continuousScore}`, 20, 30);
    ctx.fillText(`Level: ${level}`, 20, 55);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, lives, level, onScoreUpdate]);

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
        case 'arrowleft':
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
        className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
        animate={{ 
          filter: ['drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))', 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.7))', 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))']
        }}
        transition={{ duration: 3, repeat: Infinity }} // Slower animation
      >
        Moth to the Lamp
      </motion.h2>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-orange-500/30 rounded-lg shadow-2xl shadow-orange-500/20"
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
                Use WASD or Arrow Keys to navigate the moth to the lamp!
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
            transition={{ duration: 2, repeat: Infinity }} // Slower animation
          >
            ❤️
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MothGame;
