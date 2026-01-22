/**
 * Symmetry reduction utilities for MENACE
 * 
 * The board has 8 symmetries:
 * - 4 rotations (0°, 90°, 180°, 270°)
 * - 4 reflections (horizontal flip of each rotation)
 * 
 * Board indices layout:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */

import type { Board } from './types';

/**
 * Transformation functions that map board indices
 * Each transformation returns the mapping from original index to new index
 */

// Identity (0° rotation)
const identity = (i: number): number => i;

// 90° clockwise rotation
// 0 1 2    6 3 0
// 3 4 5 -> 7 4 1
// 6 7 8    8 5 2
const rotate90 = (i: number): number => {
  const map = [6, 3, 0, 7, 4, 1, 8, 5, 2];
  return map[i];
};

// 180° rotation
// 0 1 2    8 7 6
// 3 4 5 -> 5 4 3
// 6 7 8    2 1 0
const rotate180 = (i: number): number => {
  const map = [8, 7, 6, 5, 4, 3, 2, 1, 0];
  return map[i];
};

// 270° clockwise rotation (or 90° counter-clockwise)
// 0 1 2    2 5 8
// 3 4 5 -> 1 4 7
// 6 7 8    0 3 6
const rotate270 = (i: number): number => {
  const map = [2, 5, 8, 1, 4, 7, 0, 3, 6];
  return map[i];
};

// Horizontal reflection (flip left-right)
// 0 1 2    2 1 0
// 3 4 5 -> 5 4 3
// 6 7 8    8 7 6
const reflectHorizontal = (i: number): number => {
  const map = [2, 1, 0, 5, 4, 3, 8, 7, 6];
  return map[i];
};

// Reflected + 90° rotation
const reflectRotate90 = (i: number): number => rotate90(reflectHorizontal(i));

// Reflected + 180° rotation
const reflectRotate180 = (i: number): number => rotate180(reflectHorizontal(i));

// Reflected + 270° rotation
const reflectRotate270 = (i: number): number => rotate270(reflectHorizontal(i));

/**
 * All 8 transformations
 * Index represents the transformation number (0-7)
 */
export const TRANSFORMATIONS = [
  identity,           // 0
  rotate90,           // 1
  rotate180,          // 2
  rotate270,          // 3
  reflectHorizontal,  // 4
  reflectRotate90,    // 5
  reflectRotate180,   // 6
  reflectRotate270,   // 7
];

/**
 * Apply a transformation to a board
 * @param board - The original board
 * @param transformFn - The transformation function
 * @returns The transformed board
 */
function applyTransform(board: Board, transformFn: (i: number) => number): Board {
  const transformed: Board = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    transformed[i] = board[transformFn(i)];
  }
  return transformed;
}

/**
 * Convert a board to a string representation
 * Uses: 'X' for X, 'O' for O, '_' for empty
 * @param board - The board to convert
 * @returns String representation
 */
function boardToString(board: Board): string {
  return board.map(cell => cell === null ? '_' : cell).join('');
}

/**
 * Get the canonical (lexicographically smallest) representation of a board
 * This reduces the state space by treating symmetrically equivalent boards as the same
 * 
 * @param board - The original board
 * @returns Object containing the canonical string and which transformation achieved it
 */
export function getCanonicalState(board: Board): {
  canonical: string;
  transformIndex: number;
} {
  let minString = boardToString(board);
  let minTransformIndex = 0;

  // Check all 8 transformations
  for (let i = 1; i < TRANSFORMATIONS.length; i++) {
    const transformed = applyTransform(board, TRANSFORMATIONS[i]);
    const str = boardToString(transformed);
    
    // Lexicographic comparison: earlier in alphabetical order is "smaller"
    if (str < minString) {
      minString = str;
      minTransformIndex = i;
    }
  }

  return {
    canonical: minString,
    transformIndex: minTransformIndex,
  };
}

/**
 * CRITICAL: Map a move index from canonical board back to actual board
 * 
 * When MENACE picks move index M on the canonical board, we need to find
 * which index on the actual board corresponds to that position.
 * 
 * Process:
 * 1. We transformed the actual board using TRANSFORMATIONS[transformIndex]
 * 2. The transformation maps actual[i] -> canonical[transform(i)]
 * 3. To reverse: if canonical[M] corresponds to actual[?], we need the inverse
 * 
 * @param canonicalMoveIndex - The move index chosen on the canonical board
 * @param transformIndex - Which transformation was used (0-7)
 * @returns The corresponding index on the actual board
 */
export function mapCanonicalMoveToActual(
  canonicalMoveIndex: number,
  transformIndex: number
): number {
  const transform = TRANSFORMATIONS[transformIndex];
  
  // Find which original index maps to the canonical move index
  for (let i = 0; i < 9; i++) {
    if (transform(i) === canonicalMoveIndex) {
      return i;
    }
  }
  
  throw new Error(
    `Invalid transformation mapping: canonical move ${canonicalMoveIndex}, transform ${transformIndex}`
  );
}

/**
 * Debug helper: visualize a board transformation
 * @param board - The board to visualize
 */
export function visualizeTransformations(board: Board): void {
  console.log('Original:');
  console.log(formatBoard(board));
  
  TRANSFORMATIONS.forEach((transform, index) => {
    const transformed = applyTransform(board, transform);
    console.log(`\nTransform ${index}:`);
    console.log(formatBoard(transformed));
    console.log(`String: ${boardToString(transformed)}`);
  });
}

/**
 * Format a board for display
 * @param board - The board to format
 * @returns Formatted string
 */
function formatBoard(board: Board): string {
  const display = board.map(cell => cell === null ? '.' : cell);
  return `${display[0]} ${display[1]} ${display[2]}\n${display[3]} ${display[4]} ${display[5]}\n${display[6]} ${display[7]} ${display[8]}`;
}
