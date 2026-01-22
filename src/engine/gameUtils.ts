/**
 * Game utility functions for Tic-Tac-Toe
 */

import type { Board, GameResult, Player } from './types';

/**
 * Winning combinations (indices in the 1D board array)
 */
const WINNING_LINES = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal \
  [2, 4, 6], // Diagonal /
];

/**
 * Check if there's a winner or draw
 * @param board - The game board
 * @returns 'X', 'O', 'Draw', or null (game ongoing)
 */
export function checkWinner(board: Board): GameResult {
  // Check all winning lines
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }

  // Check for draw (no empty spaces)
  if (board.every((cell) => cell !== null)) {
    return 'Draw';
  }

  // Game is still ongoing
  return null;
}

/**
 * Get all valid (empty) positions on the board
 * @param board - The game board
 * @returns Array of valid move indices
 */
export function getValidMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, index) => {
    if (cell === null) {
      acc.push(index);
    }
    return acc;
  }, []);
}

/**
 * Create an empty board
 * @returns A new empty board
 */
export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}

/**
 * Make a move on the board (immutable)
 * @param board - The current board
 * @param index - The position to place the mark
 * @param player - The player making the move
 * @returns A new board with the move applied
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (board[index] !== null) {
    throw new Error(`Position ${index} is already occupied`);
  }
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
}

/**
 * Count how many moves have been made on the board
 * @param board - The game board
 * @returns Number of moves made
 */
export function countMoves(board: Board): number {
  return board.filter((cell) => cell !== null).length;
}
