"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Settings from './components/Settings';
import { GameSettings } from './types';
import GameAudio from './components/GameAudio';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    boardSize: 20,
    gameSpeed: 200,
    snakeColor: '#4ade80',
    foodColor: '#ef4444',
    controlType: 'arrows',
    musicEnabled: false,
    musicVolume: 0.5,
  });

  const initialSnake = [
    { x: Math.floor(settings.boardSize / 2), y: Math.floor(settings.boardSize / 2) },
  ];
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveInterval = useRef<NodeJS.Timeout | null>(null);
  const nextDirection = useRef({ x: 0, y: -1 });

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * settings.boardSize),
      y: Math.floor(Math.random() * settings.boardSize),
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake, settings.boardSize]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y,
    };

    // Check wall collision
    if (head.x < 0 || head.x >= settings.boardSize || head.y < 0 || head.y >= settings.boardSize) {
      setGameOver(true);
      return;
    }

    // Check self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [gameOver, snake, direction, food, generateFood, settings.boardSize]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default behavior for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key)) {
      e.preventDefault();
    }

    // Don't process input if game is over
    if (gameOver) return;

    const isArrows = settings.controlType === 'arrows';
    if (settings.controlType !== 'gamepad') {
      let newDirection = null;

      switch (e.key) {
        case isArrows ? 'ArrowUp' : 'w':
          if (direction.y === 0) newDirection = { x: 0, y: -1 };
          break;
        case isArrows ? 'ArrowDown' : 's':
          if (direction.y === 0) newDirection = { x: 0, y: 1 };
          break;
        case isArrows ? 'ArrowLeft' : 'a':
          if (direction.x === 0) newDirection = { x: -1, y: 0 };
          break;
        case isArrows ? 'ArrowRight' : 'd':
          if (direction.x === 0) newDirection = { x: 1, y: 0 };
          break;
      }

      if (newDirection) {
        setDirection(newDirection);
        nextDirection.current = newDirection;
      }
    }
  }, [direction, settings.controlType, gameOver]);

  useEffect(() => {
    // Reset direction and nextDirection when control type changes
    const initialDirection = { x: 0, y: -1 };
    setDirection(initialDirection);
    nextDirection.current = initialDirection;
  }, [settings.controlType]);

  const handleGamepadInput = useCallback(() => {
    if (settings.controlType !== 'gamepad' || gameOver) return;
    
    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    const horizontalAxis = gamepad.axes[0];
    const verticalAxis = gamepad.axes[1];
    const deadzone = 0.3; // Reduced deadzone for faster response

    // D-pad (immediate response)
    if (gamepad.buttons[12]?.pressed && direction.y === 0) {
      setDirection({ x: 0, y: -1 }); // Up
    } else if (gamepad.buttons[13]?.pressed && direction.y === 0) {
      setDirection({ x: 0, y: 1 }); // Down
    } else if (gamepad.buttons[14]?.pressed && direction.x === 0) {
      setDirection({ x: -1, y: 0 }); // Left
    } else if (gamepad.buttons[15]?.pressed && direction.x === 0) {
      setDirection({ x: 1, y: 0 }); // Right
    }
    // Analog stick (immediate response)
    else if (Math.abs(horizontalAxis) > deadzone || Math.abs(verticalAxis) > deadzone) {
      const isHorizontal = Math.abs(horizontalAxis) > Math.abs(verticalAxis);
      
      if (isHorizontal && direction.x === 0) {
        setDirection({ x: horizontalAxis > 0 ? 1 : -1, y: 0 });
      } else if (!isHorizontal && direction.y === 0) {
        setDirection({ x: 0, y: verticalAxis > 0 ? 1 : -1 });
      }
    }
  }, [direction, settings.controlType, gameOver]);

  const resetGame = () => {
    setSnake(initialSnake);
    setFood(generateFood());
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener("keydown", handleKeyDownEvent);
    
    if (!gameOver) {
      moveInterval.current = setInterval(moveSnake, settings.gameSpeed);
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDownEvent);
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
      }
    };
  }, [handleKeyDown, moveSnake, settings.gameSpeed, gameOver]);

  useEffect(() => {
    if (settings.controlType === 'gamepad') {
      const pollInterval = 1000 / 60; // 60fps polling rate
      const intervalId = setInterval(handleGamepadInput, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [handleGamepadInput, settings.controlType]);

  useEffect(() => {
    // Update CSS variables when settings change
    document.documentElement.style.setProperty('--snake-color', settings.snakeColor);
    document.documentElement.style.setProperty('--food-color', settings.foodColor);
    document.documentElement.style.setProperty('--board-size', settings.boardSize.toString());
  }, [settings.snakeColor, settings.foodColor, settings.boardSize]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <GameAudio enabled={settings.musicEnabled} volume={settings.musicVolume} />
      <div className="game-container max-w-4xl w-full">
        <div className="relative flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Snake
          </h1>
          <p className="mb-4 text-sm text-gray-400 text-center max-w-md">
            {settings.controlType === 'gamepad' 
              ? 'Use controller D-pad or analog stick to play' 
              : settings.controlType === 'wasd' 
                ? 'Use WASD keys to move the snake' 
                : 'Use arrow keys to move the snake'
            }
          </p>
          
          {gameOver ? (
            <div className="flex flex-col items-center space-y-6 animate-fadeIn">
              <div className="text-4xl font-bold text-red-500">Game Over!</div>
              <div className="text-2xl">Score: {score}</div>
              <button
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full
                         hover:from-green-600 hover:to-green-700 transform hover:scale-105
                         transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          ) : (
            <>
              <div className="score">Score: {score}</div>
              <div className="board" data-size={settings.boardSize}>
                {Array.from({ length: settings.boardSize }, (_, y) =>
                  Array.from({ length: settings.boardSize }, (_, x) => {
                    const isSnake = snake.some(
                      segment => segment.x === x && segment.y === y
                    );
                    const isFood = food.x === x && food.y === y;
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`cell ${isSnake ? "snake" : ""} ${
                          isFood ? "food" : ""
                        }`}
                      />
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <button
          className="absolute top-4 right-4 p-3 bg-gray-800/50 backdrop-blur-sm
                   rounded-full hover:bg-gray-700/50 transition-all duration-200
                   border border-gray-700/50 shadow-lg"
          onClick={() => setShowSettings(true)}
        >
          <span className="text-xl">⚙️</span>
        </button>
        
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}
