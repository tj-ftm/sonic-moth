import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MothGameProps {
  onScoreUpdate?: (score: number) => void;
  walletAddress?: string;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle extends GameObject {
  id: number;
  type: 'light' | 'spider' | 'web';
}

interface Projectile extends GameObject {
  id: number;
  velocityX: number;
  velocityY: number;
}

interface BackgroundMoth {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const MothGame: React.FC<MothGameProps> = ({ onScoreUpdate, walletAddress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Game objects state
  const [mothPosition, setMothPosition] = useState({ x: 100, y: 300 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [backgroundMoths, setBackgroundMoths] = useState<BackgroundMoth[]>([]);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const MOTH_SIZE = 30;
  const GAME_SPEED = 2;

  // Initialize background moths
  useEffect(() => {
    const moths: BackgroundMoth[] = [];
    for (let i = 0; i < 10; i++) {
      moths.push({
        id: i,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    setBackgroundMoths(moths);
  }, []);

  // Game loop
  useEffect(() => {
    if (!isGameRunning) return;

    const gameLoop = setInterval(() => {
      // Update game logic here
      setScore(prev => prev + 1);
      
      // Move obstacles
      setObstacles(prev => prev.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - GAME_SPEED
      })).filter(obstacle => obstacle.x > -50));

      // Move projectiles
      setProjectiles(prev => prev.map(projectile => ({
        ...projectile,
        x: projectile.x + projectile.velocityX,
        y: projectile.y + projectile.velocityY
      })).filter(projectile => 
        projectile.x < CANVAS_WIDTH + 50 && 
        projectile.x > -50 && 
        projectile.y < CANVAS_HEIGHT + 50 && 
        projectile.y > -50
      ));

      // Spawn new obstacles occasionally
      if (Math.random() < 0.02) {
        const newObstacle: Obstacle = {
          id: Date.now(),
          x: CANVAS_WIDTH,
          y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
          width: 40,
          height: 40,
          type: Math.random() < 0.5 ? 'light' : 'spider'
        };
        setObstacles(prev => [...prev, newObstacle]);
      }
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [isGameRunning]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background moths
    backgroundMoths.forEach(moth => {
      ctx.save();
      ctx.globalAlpha = moth.opacity;
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(moth.x, moth.y, moth.size, moth.size);
      ctx.restore();
    });

    // Draw main moth
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(mothPosition.x, mothPosition.y, MOTH_SIZE, MOTH_SIZE);

    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.type === 'light' ? '#ffd700' : '#8b4513';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw projectiles
    projectiles.forEach(projectile => {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(projectile.x, projectile.y, 5, 5);
    });
  });

  const startGame = () => {
    setGameState('playing');
    setIsGameRunning(true);
    setScore(0);
    setObstacles([]);
    setProjectiles([]);
    setMothPosition({ x: 100, y: 300 });
  };

  const endGame = () => {
    setGameState('gameOver');
    setIsGameRunning(false);
    if (score > highScore) {
      setHighScore(score);
    }
    if (onScoreUpdate) {
      onScoreUpdate(score);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isGameRunning) return;

      switch (e.key) {
        case 'ArrowUp':
          setMothPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 20) }));
          break;
        case 'ArrowDown':
          setMothPosition(prev => ({ ...prev, y: Math.min(CANVAS_HEIGHT - MOTH_SIZE, prev.y + 20) }));
          break;
        case 'ArrowLeft':
          setMothPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 20) }));
          break;
        case 'ArrowRight':
          setMothPosition(prev => ({ ...prev, x: Math.min(CANVAS_WIDTH - MOTH_SIZE, prev.x + 20) }));
          break;
        case ' ':
          e.preventDefault();
          // Shoot projectile
          const newProjectile: Projectile = {
            id: Date.now(),
            x: mothPosition.x + MOTH_SIZE,
            y: mothPosition.y + MOTH_SIZE / 2,
            width: 5,
            height: 5,
            velocityX: 5,
            velocityY: 0
          };
          setProjectiles(prev => [...prev, newProjectile]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameRunning, mothPosition]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-600 rounded-lg"
        />
        
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4 text-yellow-400">Moth Game</h1>
              <p className="text-gray-300 mb-6">Use arrow keys to move, spacebar to shoot</p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Start Game
              </button>
              {highScore > 0 && (
                <p className="text-yellow-300 mt-4">High Score: {highScore}</p>
              )}
            </motion.div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-4 text-red-400">Game Over</h2>
              <p className="text-xl mb-2">Score: {score}</p>
              {score === highScore && (
                <p className="text-yellow-400 mb-4">New High Score!</p>
              )}
              <div className="space-x-4">
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors"
                >
                  Menu
                </button>
              </div>
              {!walletAddress && (
                <p className="text-orange-400 text-xs mt-4">
                  Connect a wallet to permanently save your high scores with your address!
                </p>
              )}
            </motion.div>
          </div>
        )}
      </div>
      
      {gameState === 'playing' && (
        <div className="mt-4 text-center">
          <p className="text-xl">Score: {score}</p>
          <p className="text-sm text-gray-400 mt-2">
            Arrow keys to move • Spacebar to shoot
          </p>
        </div>
      )}
    </div>
  );
};

export default MothGame;