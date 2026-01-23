/**
 * Core exports for the MENACE game engine
 *
 * This module provides all the necessary types and utilities
 * to build a React application with MENACE AI
 */

// Type exports
export type {
  Board,
  Player,
  GameResult,
  Matchbox,
  MoveRecord,
  MenaceConfig,
} from "./types";

// Game utilities
export {
  checkWinner,
  getValidMoves,
  createEmptyBoard,
  makeMove,
  countMoves,
} from "./gameUtils";

// Symmetry utilities
export {
  getCanonicalState,
  mapCanonicalMoveToActual,
  visualizeTransformations,
  TRANSFORMATIONS,
} from "./symmetry";

// MENACE Agent
export { MenaceAgent } from "./MenaceAgent";
export type { PlayStyle } from "./MenaceAgent";
