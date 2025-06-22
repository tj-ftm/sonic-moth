import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from './Leaderboard';

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

interface BackgroundMoth {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  opacity: number;
}

const MothGame: React.FC<MothGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [hitTint, setHitTint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const gameStateRef = useRef({
    moth: { x: 100, y: 250, width: 50, height: 35, velocityY: 0 },
    obstacles: [] as Obstacle[],
    projectiles: [] as Projectile[],
    backgroundMoths: [] as BackgroundMoth[],
    keys: { up: false, down: false, space: false },
    lastObstacleSpawn: 0,
    invulnerable: 0,
    continuousScore: 0,
    lastScoreTime: 0,
    lastProjectileTime: 0,
    gameStartTime: 0
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile touch control handlers
  const handleMobileUp = () => {
    const state = gameStateRef.current;
    state.keys.up = true;
    setTimeout(() => {
      state.keys.up = false;
    }, 100);
  };

  const handleMobileDown = () => {
    const state = gameStateRef.current;
    state.keys.down = true;
    setTimeout(() => {
      state.keys.down = false;
    }, 100);
  };

  const handleMobileShoot = () => {
    const state = gameStateRef.current;
    state.keys.space = true;
    setTimeout(() => {
      state.keys.space = false;
    }, 100);
  };
  const resetGame = () => {
    const newLives = 3;
    setLives(newLives);
    setScore(0);
    setIsShaking(false);
    setHitTint(false);
    
    // Initialize background moths for menu
    const backgroundMoths: BackgroundMoth[] = [];
    for (let i = 0; i < 8; i++) {
      backgroundMoths.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        speedX: 0.5 + Math.random() * 1,
        speedY: (Math.random() - 0.5) * 0.5,
        size: 15 + Math.random() * 10,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    
    gameStateRef.current = {
      moth: { x: 100, y: 250, width: 50, height: 35, velocityY: 0 },
      obstacles: [],
      projectiles: [],
      backgroundMoths,
      keys: { up: false, down: false, space: false },
      lastObstacleSpawn: 0,
      invulnerable: 0,
      continuousScore: 0,
      lastScoreTime: 0,
      lastProjectileTime: 0,
      gameStartTime: Date.now()
    };
  };

  const checkCollision = (rect1: GameObject, rect2: GameObject): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
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

  const drawBackgroundMoth = (ctx: CanvasRenderingContext2D, moth: BackgroundMoth, time: number) => {
    ctx.save();
    ctx.globalAlpha = moth.opacity;
    
    const flapOffset = Math.sin(time * 0.005 + moth.x * 0.01) * 2;
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FB923C';
    ctx.fillStyle = '#F97316';
    
    // Body
    ctx.fillRect(moth.x + moth.size * 0.3, moth.y + moth.size * 0.35, moth.size * 0.4, moth.size * 0.2);
    
    // Wings
    ctx.fillStyle = '#FB7185';
    
    // Left wing
    ctx.beginPath();
    ctx.ellipse(moth.x + moth.size * 0.25, moth.y + moth.size * 0.2 + flapOffset, moth.size * 0.3, moth.size * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(moth.x + moth.size * 0.75, moth.y + moth.size * 0.2 - flapOffset, moth.size * 0.3, moth.size * 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawSunGlow = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.save();
    
    const glowIntensity = 30 + Math.sin(time * 0.003) * 10;
    const canvas = ctx.canvas;
    
    // Adjust sun position for mobile
    const sunX = isMobile ? canvas.width - 80 : 800;
    const sunY = isMobile ? canvas.height / 2 : 250;
    const sunRadius = isMobile ? 120 : 200;
    
    // Create radial gradient for sun effect
    const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
    
    ctx.fillStyle = gradient;
    if (isMobile) {
      ctx.fillRect(canvas.width - 160, 0, 160, canvas.height);
    } else {
      ctx.fillRect(600, 50, 400, 400);
    }
    
    // Add sun rays
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    const rayCount = isMobile ? 8 : 12;
    const rayInner = isMobile ? 50 : 100;
    const rayOuter = isMobile ? 80 : 150;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount + time * 0.001;
      const x1 = sunX + Math.cos(angle) * rayInner;
      const y1 = sunY + Math.sin(angle) * rayInner;
      const x2 = sunX + Math.cos(angle) * rayOuter;
      const y2 = sunY + Math.sin(angle) * rayOuter;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, time: number) => {
    ctx.save();
    
    // Red glowing rotating wind obstacle
    const rotation = time * 0.005;
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(rotation);
    
    ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'; // Red color
    ctx.shadowBlur = 25; // Increased glow
    ctx.shadowColor = '#DC2626'; // Red glow
    
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
    
    // Enhanced glow effect
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#FFD700';
    
    // Outer glow
    ctx.beginPath();
    ctx.arc(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2, projectile.width / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fill();
    
    // Main projectile with stronger glow
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(projectile.x + projectile.width / 2, projectile.y + projectile.height / 2, projectile.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawUI = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    if (gameState !== 'playing') return;
    
    ctx.save();
    
    // Draw semi-transparent background for UI
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, canvasWidth - 20, isMobile ? 50 : 60);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, canvasWidth - 20, isMobile ? 50 : 60);
    
    // Draw lives (hearts)
    const heartSize = isMobile ? 16 : 20;
    const heartY = isMobile ? 25 : 30;
    
    ctx.font = `${heartSize}px Arial`;
    ctx.textAlign = 'left';
    
    // Lives label
    ctx.fillStyle = '#FB923C';
    ctx.font = `${isMobile ? 12 : 14}px Arial`;
    ctx.fillText('Lives:', 20, heartY - 5);
    
    // Draw hearts based on current lives
    for (let i = 0; i < 3; i++) {
      const heartX = 65 + (i * (heartSize + 3));
      
      if (i < lives) {
        // Glowing heart
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#EF4444';
        ctx.fillStyle = '#EF4444';
        ctx.font = `${heartSize}px Arial`;
        ctx.fillText('❤️', heartX, heartY + 5);
      } else {
        // Empty heart
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#666666';
        ctx.font = `${heartSize}px Arial`;
        ctx.fillText('🖤', heartX, heartY + 5);
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw score next to lives
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FB923C';
    ctx.font = `${isMobile ? 12 : 14}px Arial`;
    
    const rightX = canvasWidth - 20;
    
    // Score
    ctx.fillText('Score:', rightX - 80, heartY - 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 14 : 16}px Arial`;
    ctx.fillText(score.toLocaleString(), rightX, heartY - 5);
    
    ctx.restore();
  };

  const drawMobileControls = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    if (isMobile) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
      ctx.font = 'bold 11px Arial';
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Drag Left: Move | Tap Right: Shoot', canvasWidth / 2, 85);
      ctx.restore();
    }
  };

  const triggerHitEffect = () => {
    setIsShaking(true);
    setHitTint(true);
    setTimeout(() => setIsShaking(false), 200);
    setTimeout(() => setHitTint(false), 300);
  };

  const gameLoop = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = hitTint ? 'rgba(255, 0, 0, 0.3)' : '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sun glow on the right side
    drawSunGlow(ctx, currentTime);
    
    if (gameState === 'menu') {
      // Update and draw background moths
      state.backgroundMoths.forEach(moth => {
        moth.x += moth.speedX;
        moth.y += moth.speedY;
        
        // Reset moth if it goes off screen
        if (moth.x > canvas.width + moth.size) {
          moth.x = -moth.size;
          moth.y = Math.random() * canvas.height;
        }
        
        drawBackgroundMoth(ctx, moth, currentTime);
      });
      
      return;
    }
    
    if (gameState !== 'playing') return;
    
    // Update moth position (only up/down movement)
    const speed = 6;
    if (state.keys.up && state.moth.y > 0) state.moth.y -= speed;
    if (state.keys.down && state.moth.y < canvas.height - state.moth.height) state.moth.y += speed;
    
    // Handle shooting
    if (state.keys.space && currentTime - state.lastProjectileTime > 200) {
      state.projectiles.push({
        x: state.moth.x + state.moth.width,
        y: state.moth.y + state.moth.height / 2 - 3,
        width: 10, // Increased from 6
        height: 10, // Increased from 6
        speedX: 8
      });
      state.lastProjectileTime = currentTime;
    }
    
    // Continuous scoring for survival (1 point every 200ms)
    if (currentTime - state.lastScoreTime > 50) {
      state.continuousScore += 1;
      setScore(state.continuousScore);
      state.lastScoreTime = currentTime;
    }
    
    // Spawn obstacles with fixed timing
    if (currentTime - state.lastObstacleSpawn > 800) {
      const numObstacles = Math.random() < 0.6 ? 3 : 2;
      
      for (let i = 0; i < numObstacles; i++) {
        state.obstacles.push({
          x: canvas.width + i * 120,
          y: Math.random() * (canvas.height - 100) + 50,
          width: 42, // 70% of 60
          height: 42, // 70% of 60
          speedX: -4,
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
          state.continuousScore += 10; // Bonus points for destroying obstacles
          setScore(state.continuousScore);
        }
      });
    });
    
    // Check moth-obstacle collisions
    let isHit = false;
    if (state.invulnerable <= 0) {
      for (const obstacle of state.obstacles) {
        if (checkCollision(state.moth, obstacle)) {
          // Decrease points when hit
          state.continuousScore = Math.max(0, state.continuousScore - 10);
          setScore(state.continuousScore);
          
          triggerHitEffect();
          
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              setFinalScore(state.continuousScore);
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
    
    // Draw everything
    drawMoth(ctx, state.moth, currentTime, isHit);
    
    state.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle, currentTime);
    });
    
    state.projectiles.forEach(projectile => {
      drawProjectile(ctx, projectile);
    });
    
    // Draw UI elements inside canvas
    drawUI(ctx, canvas.width, canvas.height);
    drawMobileControls(ctx, canvas.width);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, lives, onScoreUpdate, hitTint]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    let isDragging = false;
    let lastTouchY = 0;
    
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
      if (!isMobile || gameState !== 'playing') return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const state = gameStateRef.current;
      
      // Right side of screen for shooting
      if (x > canvas.width / 2) {
        state.keys.space = true;
      } else {
        // Left side for drag movement
        isDragging = true;
        lastTouchY = y;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobile || gameState !== 'playing' || !isDragging) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Only handle movement on left side
      if (x <= canvas.width / 2) {
        const deltaY = y - lastTouchY;
        const state = gameStateRef.current;
        
        // Move moth based on drag direction
        if (deltaY < -5) { // Dragging up
          state.keys.up = true;
          state.keys.down = false;
        } else if (deltaY > 5) { // Dragging down
          state.keys.down = true;
          state.keys.up = false;
        } else {
          state.keys.up = false;
          state.keys.down = false;
        }
        
        lastTouchY = y;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile) return;
      
      e.preventDefault();
      const state = gameStateRef.current;
      isDragging = false;
      state.keys.up = false;
      state.keys.down = false;
      state.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, gameState]);

  const startGame = () => {
    resetGame();
    setGameState('playing');
    gameStateRef.current.gameStartTime = Date.now();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <motion.canvas
          ref={canvasRef}
          width={isMobile ? 350 : 800}
          height={isMobile ? 450 : 500}
          className={`border border-orange-500/30 rounded-lg shadow-2xl shadow-orange-500/20 ${isMobile ? 'w-full max-w-sm' : ''}`}
          animate={isShaking ? { 
            x: [0, -5, 5, -5, 5, 0],
            y: [0, -2, 2, -2, 2, 0]
          } : {}}
          transition={{ duration: 0.2 }}
        />
        
        {/* Mobile Touch Control Indicators */}
        
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
            <div className="text-center p-6">
              <motion.div
                className="mb-6"
                animate={{ 
                  filter: ['drop-shadow(0 0 20px rgba(249, 115, 22, 0.6))', 'drop-shadow(0 0 30px rgba(249, 115, 22, 0.9))', 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6))']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-2`}>🦋</div>
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-orange-300`}>
                  Survive the Journey
                </div>
              </motion.div>
              
              <motion.button
                onClick={startGame}
                className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-3 px-6 text-base' : 'py-4 px-8 text-lg'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30`}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-2">
                  <span>🦋</span>
                  <span>Start Game</span>
                </div>
              </motion.button>
              
              <div className={`mt-6 space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="bg-black/40 rounded-lg p-3 border border-orange-500/20">
                  <p className="text-orange-200 font-medium mb-2">Controls:</p>
                  {isMobile ? (
                    <div className="space-y-1 text-orange-300">
                      <p>• Drag left side: Move up/down</p>
                      <p>• Tap right side: Shoot light</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-orange-300">
                      <p>• WASD/Arrow Keys: Move up/down</p>
                      <p>• SPACE: Shoot glowing light</p>
                    </div>
                  )}
                </div>
                <p className="text-orange-400 text-xs">
                  Survive as long as possible! Avoid red obstacles and shoot them for bonus points!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className={`bg-gradient-to-br from-black via-gray-900 to-orange-900 rounded-2xl border border-orange-500/30 p-6 ${isMobile ? 'w-full max-w-sm mx-4' : 'max-w-2xl w-full'} max-h-[80vh] overflow-y-auto scrollbar-hide`}>
              <div className="text-center mb-6">
                <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-4`}>Game Over!</h3>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-orange-200 mb-6`}>Final Score: {finalScore.toLocaleString()}</p>
                
                <div className="flex justify-center space-x-4 mb-6">
                  <motion.button
                    onClick={() => {
                      setGameState('menu');
                      resetGame();
                    }}
                    className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-base'} rounded-full shadow-lg shadow-orange-500/25 border border-orange-400/30`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span>🦋</span>
                      <span>Play Again</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={startGame}
                    className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-base'} rounded-full shadow-lg shadow-green-500/25 border border-green-400/30`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Quick Restart</span>
                    </div>
                  </motion.button>
                </div>
              </div>
              
              {/* Embedded Leaderboard */}
              <div className="border-t border-orange-500/30 pt-6">
                <Leaderboard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MothGame;