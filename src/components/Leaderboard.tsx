import React from 'react';
import { Score } from '../services/scoreService';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  scores: Score[];
  isLoading: boolean;
}

export default function Leaderboard({ scores, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="text-white text-center py-1 text-sm">
        Loading scores...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <h3 className="text-base font-bold">Top Scores</h3>
      </div>
      <div className="space-y-1">
        {scores.map((score, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center p-1.5 rounded text-sm ${
              index === 0 ? 'bg-yellow-500/20' :
              index === 1 ? 'bg-gray-400/20' :
              index === 2 ? 'bg-amber-700/20' :
              'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-5 text-center font-bold">
                {index === 0 ? '🥇' :
                 index === 1 ? '🥈' :
                 index === 2 ? '🥉' :
                 `#${index + 1}`}
              </span>
              <span className="truncate max-w-[100px]">{score.username}</span>
            </div>
            <span className="font-bold">{score.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}