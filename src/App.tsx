/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Suit, Rank, GameState, GameStatus } from './types';
import { PlayingCard } from './components/PlayingCard';
import { RefreshCw, Trophy, AlertCircle, ChevronRight } from 'lucide-react';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const GUN_NAMES = [
  'AK-47', 'M4A1', 'Type 95', 'AWP Sniper', 'Desert Eagle', 'MP5 SMG', 'Glock 18', 'SCAR-L',
  'M16A4', 'FAMAS', 'AUG', 'P90', 'UMP45', 'Vector', 'UZI', 'Kar98k',
  'M24', 'AWM', 'SKS', 'VSS', 'MK14', 'Mini14', 'SLR', 'QBU',
  'M249', 'DP-28', 'M134 Minigun', 'Groza', 'Beryl M762', 'AKM', 'M762', 'Mk47 Mutant',
  'S12K', 'S1897', 'S686', 'Sawed-off', 'M1014', 'Spas-12', 'Win94', 'Crossbow',
  'P18C', 'P1911', 'P92', 'R1895', 'R45', 'Skorpion', 'Flare Gun', 'M79',
  'RPG-7', 'Grenade Launcher', 'Flame Thrower', 'Compound Bow'
];

const LANDMARK_ASSETS = [
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80', // Great Wall
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=400&q=80', // Forbidden City
  'https://images.unsplash.com/photo-1529921879218-f996677ca76e?auto=format&fit=crop&w=400&q=80', // Temple of Heaven
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80', // West Lake
  'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=400&q=80', // Shanghai
  'https://images.unsplash.com/photo-1525097487452-6278ff080c31?auto=format&fit=crop&w=400&q=80', // Hong Kong
  'https://images.unsplash.com/photo-1541300154609-902e41814429?auto=format&fit=crop&w=400&q=80', // Mountains
  'https://images.unsplash.com/photo-1583141150376-749174175783?auto=format&fit=crop&w=400&q=80'  // Pagoda
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let cardIndex = 0;
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      const gunType = GUN_NAMES[cardIndex % GUN_NAMES.length];
      const landmarkUrl = LANDMARK_ASSETS[cardIndex % LANDMARK_ASSETS.length];
      deck.push({ 
        id: `${rank}-${suit}`, 
        suit, 
        rank,
        landmarkUrl,
        gunType,
        // Using loremflickr with specific keywords and a unique lock for each card to ensure variety
        gunImageUrl: `https://loremflickr.com/400/600/gun,weapon,rifle,pistol?lock=${cardIndex + 100}`
      });
      cardIndex++;
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: 'hearts',
    currentRank: 'A',
    turn: 'player',
    status: 'waiting',
    winner: null,
    message: 'Welcome to Crazy Eights!'
  });

  const startGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, 7);
    const aiHand = fullDeck.splice(0, 7);
    const firstCard = fullDeck.pop()!;
    
    setGameState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstCard],
      currentSuit: firstCard.suit,
      currentRank: firstCard.rank,
      turn: 'player',
      status: 'playing',
      winner: null,
      message: "Your turn! Match the suit or rank."
    });
  }, []);

  const drawCard = (target: 'player' | 'ai') => {
    if (gameState.deck.length === 0) {
      if (gameState.discardPile.length <= 1) {
        setGameState(prev => ({ ...prev, message: "No more cards in deck!" }));
        return;
      }
      // Reshuffle discard pile into deck
      const topCard = gameState.discardPile[gameState.discardPile.length - 1];
      const newDeck = gameState.discardPile.slice(0, -1).sort(() => Math.random() - 0.5);
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        discardPile: [topCard]
      }));
      return;
    }

    const newDeck = [...gameState.deck];
    const card = newDeck.pop()!;
    
    setGameState(prev => {
      const isPlayer = target === 'player';
      const newHand = isPlayer ? [...prev.playerHand, card] : [...prev.aiHand, card];
      
      return {
        ...prev,
        deck: newDeck,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        message: `${isPlayer ? 'You' : 'AI'} drew a card.`,
        turn: isPlayer ? 'ai' : 'player'
      };
    });
  };

  const playCard = (card: Card, target: 'player' | 'ai') => {
    const isEight = card.rank === '8';
    const canPlay = isEight || card.suit === gameState.currentSuit || card.rank === gameState.currentRank;

    if (!canPlay && target === 'player') {
      setGameState(prev => ({ ...prev, message: "You can't play that card!" }));
      return;
    }

    setGameState(prev => {
      const isPlayer = target === 'player';
      const currentHand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = currentHand.filter(c => c.id !== card.id);
      const newDiscard = [...prev.discardPile, card];

      if (newHand.length === 0) {
        return {
          ...prev,
          [isPlayer ? 'playerHand' : 'aiHand']: newHand,
          discardPile: newDiscard,
          status: 'gameOver',
          winner: isPlayer ? 'player' : 'ai',
          message: isPlayer ? "Congratulations! You won!" : "AI won. Better luck next time!"
        };
      }

      if (isEight) {
        if (isPlayer) {
          return {
            ...prev,
            playerHand: newHand,
            discardPile: newDiscard,
            status: 'choosingSuit',
            message: "Crazy 8! Choose a new suit."
          };
        } else {
          // AI chooses most frequent suit in hand
          const suitCounts: Record<string, number> = {};
          newHand.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
          const bestSuit = (Object.keys(suitCounts).sort((a, b) => suitCounts[b] - suitCounts[a])[0] || 'hearts') as Suit;
          
          return {
            ...prev,
            aiHand: newHand,
            discardPile: newDiscard,
            currentSuit: bestSuit,
            currentRank: '8',
            turn: 'player',
            message: `AI played an 8 and chose ${bestSuit}.`
          };
        }
      }

      return {
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscard,
        currentSuit: card.suit,
        currentRank: card.rank,
        turn: isPlayer ? 'ai' : 'player',
        message: `${isPlayer ? 'You' : 'AI'} played ${card.rank} of ${card.suit}.`
      };
    });
  };

  const selectSuit = (suit: Suit) => {
    setGameState(prev => ({
      ...prev,
      currentSuit: suit,
      currentRank: '8',
      status: 'playing',
      turn: 'ai',
      message: `You chose ${suit}. AI's turn.`
    }));
  };

  // AI Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.turn === 'ai') {
      const timer = setTimeout(() => {
        const playableCard = gameState.aiHand.find(c => 
          c.rank === '8' || c.suit === gameState.currentSuit || c.rank === gameState.currentRank
        );

        if (playableCard) {
          playCard(playableCard, 'ai');
        } else {
          drawCard('ai');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.turn, gameState.aiHand, gameState.currentSuit, gameState.currentRank]);

  return (
    <div className="min-h-screen bg-[#0a2e1f] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black">8</div>
          <h1 className="text-xl font-bold tracking-tight">Tina Crazy Eights</h1>
        </div>
        <button 
          onClick={startGame}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          {gameState.status === 'waiting' ? 'Start Game' : 'Restart'}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 flex flex-col gap-8">
        {gameState.status === 'waiting' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center"
            >
              <div className="text-6xl font-bold text-emerald-400">8</div>
            </motion.div>
            <div>
              <h2 className="text-4xl font-bold mb-2">Ready to Play?</h2>
              <p className="text-emerald-100/60 max-w-md">Match suits and ranks, use 8s as wildcards, and be the first to clear your hand!</p>
            </div>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Deal the Cards
            </button>
          </div>
        ) : (
          <>
            {/* AI Area */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 uppercase tracking-widest">
                <div className={`w-2 h-2 rounded-full ${gameState.turn === 'ai' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                AI Opponent ({gameState.aiHand.length} cards)
              </div>
              <div className="flex justify-center -space-x-12 sm:-space-x-16">
                {gameState.aiHand.map((card, i) => (
                  <PlayingCard 
                    key={card.id} 
                    card={card} 
                    isFaceUp={false} 
                    disabled 
                    className="transform hover:translate-y-[-10px] transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Center Area: Deck and Discard */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-emerald-100/40 font-bold">Draw Pile</span>
                <PlayingCard 
                  card={gameState.deck[0] || { id: 'back', suit: 'hearts', rank: 'A' }} 
                  isFaceUp={false} 
                  onClick={() => gameState.turn === 'player' && drawCard('player')}
                  disabled={gameState.turn !== 'player' || gameState.status !== 'playing'}
                  className="shadow-2xl ring-4 ring-white/5"
                />
                <span className="text-sm font-mono text-emerald-400">{gameState.deck.length} cards left</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                 <div className="px-4 py-2 bg-black/40 rounded-full border border-white/10 flex items-center gap-3">
                    <span className="text-xs font-bold uppercase text-emerald-100/60">Current:</span>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold">{gameState.currentRank}</span>
                       <div className="w-4 h-4">
                          {gameState.currentSuit === 'hearts' && <div className="w-full h-full bg-emerald-500 rounded-full" />}
                          {gameState.currentSuit === 'diamonds' && <div className="w-full h-full bg-emerald-500 rotate-45" />}
                          {gameState.currentSuit === 'clubs' && <div className="w-full h-full bg-slate-400 rounded-sm" />}
                          {gameState.currentSuit === 'spades' && <div className="w-full h-full bg-slate-400 rotate-45 rounded-sm" />}
                       </div>
                       <span className="text-xs font-medium uppercase">{gameState.currentSuit}</span>
                    </div>
                 </div>
                 <AnimatePresence mode="wait">
                    <PlayingCard 
                      key={gameState.discardPile[gameState.discardPile.length - 1]?.id}
                      card={gameState.discardPile[gameState.discardPile.length - 1]} 
                      disabled
                      className="shadow-2xl ring-8 ring-emerald-500/10"
                    />
                 </AnimatePresence>
              </div>
            </div>

            {/* Player Area */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 uppercase tracking-widest">
                <div className={`w-2 h-2 rounded-full ${gameState.turn === 'player' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                Your Hand
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {gameState.playerHand.map((card) => (
                  <PlayingCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => gameState.turn === 'player' && gameState.status === 'playing' && playCard(card, 'player')}
                    disabled={gameState.turn !== 'player' || gameState.status !== 'playing'}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 flex justify-center">
        <div className="flex items-center gap-3 text-emerald-100">
          <AlertCircle className="w-5 h-5 text-emerald-400" />
          <p className="font-medium">{gameState.message}</p>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {gameState.status === 'choosingSuit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-2">Crazy 8!</h2>
              <p className="text-white/60 mb-8">Select the new suit to play</p>
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map(suit => (
                  <button
                    key={suit}
                    onClick={() => selectSuit(suit)}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2"
                  >
                    <div className={`text-2xl ${['hearts', 'diamonds'].includes(suit) ? 'text-emerald-500' : 'text-slate-300'}`}>
                       {suit === 'hearts' && '♥'}
                       {suit === 'diamonds' && '♦'}
                       {suit === 'clubs' && '♣'}
                       {suit === 'spades' && '♠'}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState.status === 'gameOver' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-white/10 p-10 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className={`w-10 h-10 ${gameState.winner === 'player' ? 'text-yellow-400' : 'text-slate-400'}`} />
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {gameState.winner === 'player' ? 'You Won!' : 'AI Won!'}
              </h2>
              <p className="text-white/60 mb-10 leading-relaxed">
                {gameState.winner === 'player' 
                  ? 'Incredible strategy! You cleared all your cards and outsmarted the AI.' 
                  : 'Better luck next time! The AI was too fast this round.'}
              </p>
              <button
                onClick={startGame}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Play Again
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
