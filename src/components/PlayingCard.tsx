import React from 'react';
import { motion } from 'motion/react';
import { Card, Suit } from '../types';
import { Heart, Diamond, Club, Spade, Crosshair } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  switch (suit) {
    case 'hearts': return <Heart className={`text-emerald-500 ${className}`} fill="currentColor" />;
    case 'diamonds': return <Diamond className={`text-emerald-500 ${className}`} fill="currentColor" />;
    case 'clubs': return <Club className={`text-slate-800 ${className}`} fill="currentColor" />;
    case 'spades': return <Spade className={`text-slate-800 ${className}`} fill="currentColor" />;
  }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  disabled = false,
  className = ""
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isFaceUp && !disabled ? { y: -10, scale: 1.05 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl shadow-lg cursor-pointer
        transition-shadow duration-200 overflow-hidden
        border-2 border-[#D4AF37] ring-1 ring-[#FFD700]/30
        ${isFaceUp ? 'bg-white' : 'bg-black'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-[#FFD700]/20'}
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          {/* Landmark Background - Semi-transparent (伴透) */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ 
              backgroundImage: `url(${card.landmarkUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          <div className="relative flex flex-col h-full p-2 sm:p-3 z-10">
            <div className="flex justify-between items-start">
              <span className={`text-lg sm:text-2xl font-black ${['hearts', 'diamonds'].includes(card.suit) ? 'text-emerald-600' : 'text-slate-900'}`}>
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            
            <div className="flex-grow flex items-center justify-center">
              <SuitIcon suit={card.suit} className="w-10 h-10 sm:w-16 sm:h-16 opacity-60" />
            </div>
            
            <div className="flex justify-between items-end rotate-180">
              <span className={`text-lg sm:text-2xl font-black ${['hearts', 'diamonds'].includes(card.suit) ? 'text-emerald-600' : 'text-slate-900'}`}>
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </>
      ) : (
        <div className="h-full w-full relative flex flex-col overflow-hidden">
          {/* Gun Image Background - Different for each card type */}
          <div 
            className="absolute inset-0 opacity-100"
            style={{ 
              backgroundImage: `url(${card.gunImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Top Gradient for text readability */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/80 to-transparent" />

          <div className="relative z-10 flex flex-col h-full w-full p-2">
            {/* Gun Name at the Top */}
            <div className="text-center">
              <div className="text-[#FFD700] font-black text-[10px] sm:text-sm tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                {card.gunType}
              </div>
              <div className="h-[1px] w-8 mx-auto bg-[#D4AF37] mt-1" />
            </div>

            <div className="flex-grow" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
