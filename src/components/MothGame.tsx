import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from './Leaderboard';

interface MothGameProps {
  onScoreUpdate: (points: number) => void;
  walletConnected?: boolean;
  walletAddress?: string;
  onWalletConnect?: (connected: boolean) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle extends GameObject {
  speed: number;
}

interface Light extends GameObject {
  collected: boolean;
}

const MothGame: React.FC<MothGameProps> = ({
  onScoreUpdate,
  walletConnected = false,
  walletAddress,
  onWalletConnect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [hitEffect, setHitEffect] = useState(false);

  // Game state
  const gameStateRef = useRef({
    moth: { x: 400, y: 300, width: 30, height: 30 },
    obstacles: [] as Obstacle[],
    lights: [] as Light[],
    keys: {} as Record<string, boolean>,
    continuousScore: 0,
    invulnerable: 0,
    lastObstacleSpawn: 0,
    lastLightSpawn: 0
  });

  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  const triggerHitEffect = () => {
    setHitEffect(true);
    setTimeout(() => setHitEffect(false), 200);
  };

  const spawnObstacle = () => {
    const state = gameStateRef.current;
    const obstacle: Obstacle = {
      x: Math.random() * 750,
      y: -50,
      width: 40,
      height: 40,
      speed: 2 + Math.random() * 3
    };
    state.obstacles.push(obstacle);
  };

  const spawnLight = () => {
    const state = gameStateRef.current;
    const light: Light = {
      x: Math.random() * 750,
      y: Math.random() * 550,
      width: 20,
      height: 20,
      collected: false
    };
    state.lights.push(light);
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle input
    if (state.keys['ArrowLeft'] || state.keys['a']) {
      state.moth.x = Math.max(0, state.moth.x - 5);
    }
    if (state.keys['ArrowRight'] || state.keys['d']) {
      state.moth.x = Math.min(canvas.width - state.moth.width, state.moth.x + 5);
    }
    if (state.keys['ArrowUp'] || state.keys['w']) {
      state.moth.y = Math.max(0, state.moth.y - 5);
    }
    if (state.keys['ArrowDown'] || state.keys['s']) {
      state.moth.y = Math.min(canvas.height - state.moth.height, state.moth.y + 5);
    }

    // Spawn obstacles
    if (Date.now() - state.lastObstacleSpawn > 1500) {
      spawnObstacle();
      state.lastObstacleSpawn = Date.now();
    }

    // Spawn lights
    if (Date.now() - state.lastLightSpawn > 3000) {
      spawnLight();
      state.lastLightSpawn = Date.now();
    }

    // Update obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.y += obstacle.speed;
      return obstacle.y < canvas.height + 50;
    });

    // Update lights
    state.lights = state.lights.filter(light => !light.collected);

    // Collision detection
    if (state.invulnerable > 0) {
      state.invulnerable--;
    }

    let isHit = false;
    if (state.invulnerable === 0) {
      for (const obstacle of state.obstacles) {
        if (checkCollision(state.moth, obstacle)) {
          state.continuousScore = Math.max(0, state.continuousScore - 10);
          setScore(state.continuousScore);
          
          triggerHitEffect();
          
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              setFinalScore(state.continuousScore);
              
              if (walletConnected && walletAddress) {
                localStorage.setItem(`mothScore_${walletAddress}`, state.continuousScore.toString());
                localStorage.setItem('currentMothScore', state.continuousScore.toString());
                onScoreUpdate(state.continuousScore);
              } else {
                setShowWalletPrompt(true);
              }
            }
            return newLives;
          });
          state.invulnerable = 120;
          isHit = true;
          break;
        }
      }
    }

    // Light collection
    for (const light of state.lights) {
      if (!light.collected && checkCollision(state.moth, light)) {
        light.collected = true;
        state.continuousScore += 50;
        setScore(state.continuousScore);
      }
    }

    // Continuous scoring
    if (!isHit) {
      state.continuousScore += 1;
      setScore(state.continuousScore);
    }

    // Draw lights
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    for (const light of state.lights) {
      if (!light.collected) {
        ctx.fillRect(light.x, light.y, light.width, light.height);
      }
    }
    ctx.shadowBlur = 0;

    // Draw obstacles
    ctx.fillStyle = '#ff4444';
    for (const obstacle of state.obstacles) {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Draw moth
    const mothColor = state.invulnerable > 0 ? 
      (Math.floor(state.invulnerable / 10) % 2 ? '#ffffff' : '#cccccc') : 
      '#ffffff';
    ctx.fillStyle = mothColor;
    ctx.fillRect(state.moth.x, state.moth.y, state.moth.width, state.moth.height);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, walletConnected, walletAddress, onScoreUpdate]);

  const startGame = () => {
    const state = gameStateRef.current;
    state.moth = { x: 400, y: 300, width: 30, height: 30 };
    state.obstacles = [];
    state.lights = [];
    state.continuousScore = 0;
    state.invulnerable = 0;
    state.lastObstacleSpawn = Date.now();
    state.lastLightSpawn = Date.now();
    
    setScore(0);
    setLives(3);
    setGameState('playing');
    setShowWalletPrompt(false);
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setFinalScore(0);
    setLives(3);
    setShowWalletPrompt(false);
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
          pauseGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game loop effect
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black p-4">
      <motion.div
        className={`relative ${hitEffect ? 'animate-pulse' : ''}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {gameState === 'menu' && (
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-4 text-yellow-400">Moth to the Light</h1>
            <p className="text-lg mb-6">Navigate the moth to collect lights while avoiding obstacles!</p>
            <div className="space-y-2 text-sm mb-6">
              <p>🎮 Use WASD or Arrow Keys to move</p>
              <p>💡 Collect yellow lights for +50 points</p>
              <p>❤️ Avoid red obstacles (-10 points, -1 life)</p>
              <p>⏸️ Press SPACE to pause</p>
            </div>
            <button
              onClick={startGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-4 text-red-400">Game Over!</h2>
            <p className="text-xl mb-4">Final Score: {finalScore}</p>
            
            {showWalletPrompt && !walletConnected && (
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
                <p className="text-yellow-200 mb-2">Connect your wallet to save your score!</p>
                <button
                  onClick={() => onWalletConnect?.(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
            
            <div className="space-x-4">
              <button
                onClick={startGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            <div className="flex justify-between items-center text-white mb-4 w-full max-w-4xl">
              <div className="flex space-x-6">
                <span className="text-lg">Score: {score}</span>
                <span className="text-lg">Lives: {'❤️'.repeat(lives)}</span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={pauseGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                >
                  {gameState === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                >
                  Quit
                </button>
              </div>
            </div>

            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-4">Game Paused</h3>
                  <p>Press SPACE or click Resume to continue</p>
                </div>
              </div>
            )}
          </>
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-yellow-400 bg-black"
          style={{ display: gameState === 'menu' ? 'none' : 'block' }}
        />
      </motion.div>

      {gameState === 'gameOver' && (
        <div className="mt-8 w-full max-w-4xl">
          <Leaderboard />
        </div>
      )}
    </div>
  );
};

export default MothGame;