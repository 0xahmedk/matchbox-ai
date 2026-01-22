/**
 * Core types for the MENACE Tic-Tac-Toe implementation
 */

export type Player = 'X' | 'O';

export type Board = (Player | null)[];

export type GameResult = 'X' | 'O' | 'Draw' | null;

/**
 * Represents a matchbox in MENACE's memory
 * Key: canonical board state (string representation)
 * Value: array of bead counts for each position (0-8)
 */
export interface Matchbox {
  beads: number[];
  totalBeads: number;
}

/**
 * A move made during a game, tracked for training
 */
export interface MoveRecord {
  canonicalState: string;
  moveIndex: number; // Index in the canonical board
  actualMoveIndex: number; // Index in the actual board
  transformIndex: number; // Which transformation was applied (0-7)
}

/**
 * Configuration for initializing matchboxes
 */
export interface MenaceConfig {
  initialBeadsEarly: number; // Beads for moves in first few turns
  initialBeadsMid: number; // Beads for middle game
  initialBeadsLate: number; // Beads for late game
  winReward: number;
  drawReward: number;
  lossReward: number;
}
