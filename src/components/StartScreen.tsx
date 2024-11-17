import React from 'react';
import { User } from '../services/authService';

interface StartScreenProps {
  onLoginClick: (e: React.MouseEvent) => void;
  user: User | null;
}

export function StartScreen({ onLoginClick, user }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none translate-y-4">
      <div className="text-center text-white pointer-events-auto">
        <h1 className="game-title text-7xl font-bold mb-4 animate-pulse">Flappy Seal</h1>
        
        <img 
          src="https://i.ibb.co/Wt6PD8h/edmin.png" 
          alt="Seal" 
          className="w-40 h-40 object-contain mx-auto mb-8"
        />
        
        <a 
          href="https://eddieseal.org" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block mb-12 text-white hover:text-white/80 transition-colors text-2xl font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Visit eddieseal.org
        </a>
        
        {user ? (
          <p className="mb-12 text-xl">Tap or press spacebar to jump</p>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-xl font-semibold"
          >
            Login to Play
          </button>
        )}
      </div>
    </div>
  );
}