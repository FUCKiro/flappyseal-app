import React from 'react';
import { User } from '../services/authService';

interface GameUIProps {
  score: number;
  highScore: number;
  user: User | null;
  onSignOut: () => void;
  onVerifyEmail: () => void;
  verificationSent: boolean;
}

export function GameUI({ 
  score, 
  highScore, 
  user, 
  onSignOut, 
  onVerifyEmail,
  verificationSent 
}: GameUIProps) {
  return (
    <>
      {user && !user.emailVerified && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-full flex flex-col items-center gap-2 p-2">
          <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-center text-xs">
            Please verify your email
            <button
              onClick={onVerifyEmail}
              disabled={verificationSent}
              className="ml-2 underline hover:no-underline disabled:opacity-50"
            >
              {verificationSent ? 'Sent!' : 'Resend'}
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
        Score: {score}
      </div>
      
      <div className="absolute top-4 right-4 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
        High: {highScore}
      </div>

      {user && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <span>{user.username}</span>
          <button 
            onClick={onSignOut}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}