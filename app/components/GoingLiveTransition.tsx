'use client';

import { useState, useEffect } from 'react';

interface GoingLiveTransitionProps {
  onComplete: () => void;
}

export default function GoingLiveTransition({ onComplete }: GoingLiveTransitionProps) {
  const [stage, setStage] = useState<'countdown' | 'going_live' | 'fade_out'>('countdown');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (stage === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 800);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setStage('going_live'), 0);
        return () => clearTimeout(timer);
      }
    } else if (stage === 'going_live') {
      const timer = setTimeout(() => setStage('fade_out'), 1500);
      return () => clearTimeout(timer);
    } else if (stage === 'fade_out') {
      const timer = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(timer);
    }
  }, [stage, countdown, onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500 ${
        stage === 'fade_out' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {stage === 'countdown' && (
        <div className="text-center">
          <div
            key={countdown}
            className="text-9xl font-black text-white animate-bounce-in"
          >
            {countdown}
          </div>
          <p className="text-xl text-zinc-400 mt-4">Starting stream...</p>
        </div>
      )}

      {stage === 'going_live' && (
        <div className="text-center animate-scale-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            <span className="text-6xl font-black text-white">LIVE</span>
            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
          </div>
          <p className="text-xl text-zinc-400">You&apos;re now streaming!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}
