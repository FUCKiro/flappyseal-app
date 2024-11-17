import React from 'react';
import { User } from '../services/authService';
import { Score } from '../services/scoreService';
import Leaderboard from './Leaderboard';

interface GameOverScreenProps {
  score: number;
  user: User | null;
  onLoginClick: (e: React.MouseEvent) => void;
  topScores: Score[];
  isLoadingScores: boolean;
}

export function GameOverScreen({ 
  score, 
  user, 
  onLoginClick, 
  topScores, 
  isLoadingScores 
}: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 w-[280px] mx-auto pointer-events-auto">
        <div className="text-center text-white mb-3">
          <h2 className="text-2xl font-bold mb-2 game-title text-red-500">Game Over!</h2>
          <p className="text-lg mb-2">Score: {score}</p>
          {!user && score > 0 && (
            <button
              onClick={onLoginClick}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 mb-2 text-sm font-semibold"
            >
              Login to Save Score
            </button>
          )}
          <p className="text-xs opacity-75 mb-1">Tap anywhere to restart</p>
          <p className="text-xs opacity-50">Leaderboard resets every Monday at 00:00 UTC</p>
        </div>
        
        <div className="border-t border-white/10 pt-3">
          <Leaderboard scores={topScores} isLoading={isLoadingScores} />
        </div>
      </div>
    </div>
  );
}