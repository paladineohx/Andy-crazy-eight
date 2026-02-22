export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  landmarkUrl: string;
  gunType: string;
  gunImageUrl: string;
}

export type GameStatus = 'waiting' | 'playing' | 'gameOver' | 'choosingSuit';

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  aiHand: Card[];
  discardPile: Card[];
  currentSuit: Suit;
  currentRank: Rank;
  turn: 'player' | 'ai';
  status: GameStatus;
  winner: 'player' | 'ai' | null;
  message: string;
}
