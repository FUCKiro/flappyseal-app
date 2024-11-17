import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';
import Leaderboard from './Leaderboard';
import { saveScore, getTopScores, Score } from '../services/scoreService';
import { getCurrentUser, signOut, User, resendVerificationEmail } from '../services/authService';
import AuthModal from './AuthModal';
import { GameUI } from './GameUI';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { Footer } from './Footer';

const BASE_CANVAS_WIDTH = 400;
const BASE_CANVAS_HEIGHT = 600;
const GRAVITY = 0.4;
const JUMP_FORCE = -7;
const PIPE_SPEED = 2;
const PIPE_SPACING = 220;
const PIPE_WIDTH = 52;
const GAP_HEIGHT = 160;
const BIRD_SIZE = 70;
const COLLISION_PADDING = 12;
const BIRD_X_POSITION = 80;

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(BASE_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(BASE_CANVAS_HEIGHT);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdPosition, setBirdPosition] = useState(BASE_CANVAS_HEIGHT / 2);
  const [pipes, setPipes] = useState<Array<{ x: number; height: number; passed?: boolean }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [topScores, setTopScores] = useState<Score[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const sealImage = useRef<HTMLImageElement | null>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isPortrait = screenHeight > screenWidth;
      
      if (isPortrait && screenWidth < 768) {
        setCanvasWidth(screenWidth * 0.95);
        setCanvasHeight(screenHeight * 0.8);
      } else {
        setCanvasWidth(BASE_CANVAS_WIDTH);
        setCanvasHeight(BASE_CANVAS_HEIGHT);
      }
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = window.innerHeight;
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      setScale(Math.min(scaleX, scaleY, 1.5));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const seal = new Image();
    seal.src = 'https://iili.io/2TU7Hwg.png';
    seal.onload = () => {
      sealImage.current = seal;
    };

    const bg = new Image();
    bg.src = 'https://iili.io/2u9BpSe.jpg';
    bg.onload = () => {
      backgroundImage.current = bg;
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await loadTopScores();
    };
    loadInitialData();
  }, []);

  const loadTopScores = async () => {
    setIsLoadingScores(true);
    const scores = await getTopScores(10);
    setTopScores(scores);
    setIsLoadingScores(false);
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  const jump = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 200) return;
    lastTapTime.current = now;

    // Only allow jump if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setPipes([]);
      setBirdPosition(canvasHeight / 2);
    }

    if (gameOver) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setPipes([]);
      setBirdPosition(canvasHeight / 2);
    }

    setBirdVelocity(JUMP_FORCE);
  }, [gameStarted, gameOver, canvasHeight, user]);

  const handleGameOver = async () => {
    setGameOver(true);
    if (score > 0 && user && user.emailVerified) {
      await saveScore(score);
      await loadTopScores();
    }
  };

  const handleAuthSuccess = useCallback(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setGameStarted(false);
    setGameOver(false);
  }, []);

  const handleLoginClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAuthModal(true);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    jump();
  }, [jump]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    jump();
  }, [jump]);

  useInterval(
    () => {
      if (!gameStarted || gameOver) return;

      setBirdPosition((pos) => pos + birdVelocity);
      setBirdVelocity((vel) => vel + GRAVITY);

      setPipes((currentPipes) => {
        return currentPipes
          .map((pipe) => {
            if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
              setScore((s) => s + 1);
              setHighScore((h) => Math.max(h, score + 1));
              return { ...pipe, x: pipe.x - PIPE_SPEED, passed: true };
            }
            return { ...pipe, x: pipe.x - PIPE_SPEED };
          })
          .filter((pipe) => pipe.x > -PIPE_WIDTH);
      });

      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvasWidth - PIPE_SPACING) {
        setPipes((currentPipes) => [
          ...currentPipes,
          {
            x: canvasWidth,
            height: Math.random() * (canvasHeight - GAP_HEIGHT - 120) + 60,
            passed: false
          },
        ]);
      }

      const bird = {
        x: BIRD_X_POSITION + COLLISION_PADDING,
        y: birdPosition + COLLISION_PADDING,
        width: BIRD_SIZE - (COLLISION_PADDING * 2),
        height: BIRD_SIZE - (COLLISION_PADDING * 2),
      };

      if (birdPosition < 0 || birdPosition > canvasHeight - BIRD_SIZE) {
        handleGameOver();
        return;
      }

      for (const pipe of pipes) {
        if (
          bird.x + bird.width > pipe.x + COLLISION_PADDING &&
          bird.x < pipe.x + PIPE_WIDTH - COLLISION_PADDING &&
          (bird.y < pipe.height || bird.y + bird.height > pipe.height + GAP_HEIGHT)
        ) {
          handleGameOver();
          return;
        }
      }
    },
    gameStarted && !gameOver ? 1000 / 60 : null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (backgroundImage.current) {
      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#1E90FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    if (sealImage.current) {
      const rotation = Math.min(Math.max(birdVelocity * 0.02, -0.1), 0.1);
      
      ctx.save();
      ctx.translate(BIRD_X_POSITION + BIRD_SIZE / 2, birdPosition + BIRD_SIZE / 2);
      ctx.rotate(rotation);
      ctx.drawImage(
        sealImage.current,
        -BIRD_SIZE / 2,
        -BIRD_SIZE / 2,
        BIRD_SIZE,
        BIRD_SIZE
      );
      ctx.restore();
    }

    ctx.fillStyle = '#A5F2F3';
    pipes.forEach((pipe) => {
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      gradient.addColorStop(0, '#A5F2F3');
      gradient.addColorStop(0.5, '#FFFFFF');
      gradient.addColorStop(1, '#A5F2F3');
      ctx.fillStyle = gradient;

      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.height);
      ctx.fillRect(
        pipe.x,
        pipe.height + GAP_HEIGHT,
        PIPE_WIDTH,
        canvasHeight - (pipe.height + GAP_HEIGHT)
      );

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x + 2, 0, PIPE_WIDTH - 4, pipe.height);
      ctx.strokeRect(
        pipe.x + 2,
        pipe.height + GAP_HEIGHT,
        PIPE_WIDTH - 4,
        canvasHeight - (pipe.height + GAP_HEIGHT)
      );
    });
  }, [birdPosition, pipes, birdVelocity, canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-gray-900"
      onClick={jump}
    >
      <div 
        ref={containerRef} 
        className="relative w-full h-full"
        onClick={jump}
      >
        <GameUI
          score={score}
          highScore={highScore}
          user={user}
          onSignOut={handleSignOut}
          onVerifyEmail={handleResendVerification}
          verificationSent={verificationSent}
        />

        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: `-${canvasWidth / 2}px`,
            marginTop: `-${canvasHeight / 2}px`,
          }}
          className="border-4 border-emerald-600 rounded-lg shadow-lg touch-none select-none z-20"
          onClick={handleCanvasClick}
          onTouchStart={handleTouch}
        />

        {!gameStarted && (
          <div onClick={(e) => e.stopPropagation()}>
            <StartScreen
              onLoginClick={handleLoginClick}
              user={user}
            />
          </div>
        )}

        {gameOver && (
          <div onClick={(e) => e.stopPropagation()}>
            <GameOverScreen
              score={score}
              user={user}
              onLoginClick={handleLoginClick}
              topScores={topScores}
              isLoadingScores={isLoadingScores}
            />
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />

        <Footer />
      </div>
    </div>
  );
}

export default Game;