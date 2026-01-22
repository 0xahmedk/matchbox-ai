/**
 * MENACE Agent Implementation
 *
 * MENACE (Machine Educable Noughts And Crosses Engine) learns through
 * reinforcement learning using a "matchbox" system where each game state
 * has beads representing move preferences.
 */

import type {
  Board,
  Matchbox,
  MenaceConfig,
  MoveRecord,
  Player,
} from "./types";
import { getValidMoves, countMoves } from "./gameUtils";
import {
  getCanonicalState,
  mapCanonicalMoveToActual,
  TRANSFORMATIONS,
} from "./symmetry";

/**
 * Default configuration for MENACE
 */
const DEFAULT_CONFIG: MenaceConfig = {
  initialBeadsEarly: 8, // First 3 moves (0-2 moves on board)
  initialBeadsMid: 4, // Middle game (3-5 moves on board)
  initialBeadsLate: 2, // Late game (6+ moves on board)
  winReward: 3,
  drawReward: 1,
  lossReward: -1,
};

/**
 * MENACE Agent Class
 *
 * Implements the learning algorithm for playing Tic-Tac-Toe
 */
export class MenaceAgent {
  private memory: Map<string, Matchbox>;
  private config: MenaceConfig;
  private player: Player;
  private currentGameHistory: MoveRecord[];

  constructor(player: Player, config: Partial<MenaceConfig> = {}) {
    this.memory = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.player = player;
    this.currentGameHistory = [];
  }

  /**
   * Get the player this agent represents
   */
  getPlayer(): Player {
    return this.player;
  }

  /**
   * Get the current memory size (number of unique states learned)
   */
  getMemorySize(): number {
    return this.memory.size;
  }

  /**
   * Get a matchbox for debugging/visualization
   */
  getMatchbox(canonicalState: string): Matchbox | undefined {
    return this.memory.get(canonicalState);
  }

  /**
   * Get all matchboxes (for serialization/debugging)
   */
  getAllMatchboxes(): Map<string, Matchbox> {
    return new Map(this.memory);
  }

  /**
   * Initialize a matchbox for a new state
   * Beads are only added for valid (empty) positions
   *
   * @param board - The board in canonical form
   * @param validMoves - Array of valid move indices
   * @returns A new matchbox
   */
  private initializeMatchbox(board: Board, validMoves: number[]): Matchbox {
    const beads = Array(9).fill(0);
    const moveCount = countMoves(board);

    // Determine bead count based on game stage
    let beadCount: number;
    if (moveCount <= 2) {
      beadCount = this.config.initialBeadsEarly;
    } else if (moveCount <= 5) {
      beadCount = this.config.initialBeadsMid;
    } else {
      beadCount = this.config.initialBeadsLate;
    }

    // Add beads only for valid moves
    let totalBeads = 0;
    for (const move of validMoves) {
      beads[move] = beadCount;
      totalBeads += beadCount;
    }

    return { beads, totalBeads };
  }

  /**
   * Select a move from matchbox, but only from a filtered set of valid moves
   * This ensures we never select an occupied position
   *
   * @param matchbox - The matchbox to select from
   * @param validMoveIndices - Array of move indices that are currently valid
   * @returns The selected move index
   */
  private selectMoveFromMatchboxFiltered(
    matchbox: Matchbox,
    validMoveIndices: number[],
  ): number {
    // Calculate total beads only for valid moves
    let totalValidBeads = 0;
    for (const moveIndex of validMoveIndices) {
      if (matchbox.beads[moveIndex] > 0) {
        totalValidBeads += matchbox.beads[moveIndex];
      }
    }

    if (totalValidBeads === 0) {
      // No beads in valid positions, select randomly from valid moves
      if (validMoveIndices.length === 0) {
        throw new Error("No valid moves available");
      }
      return validMoveIndices[
        Math.floor(Math.random() * validMoveIndices.length)
      ];
    }

    // Weighted random selection based on bead counts, but only for valid moves
    const rand = Math.random() * totalValidBeads;
    let cumulative = 0;

    for (const moveIndex of validMoveIndices) {
      const beadCount = matchbox.beads[moveIndex];
      if (beadCount > 0) {
        cumulative += beadCount;
        if (rand < cumulative) {
          return moveIndex;
        }
      }
    }

    // Fallback: return first valid move with beads
    for (const moveIndex of validMoveIndices) {
      if (matchbox.beads[moveIndex] > 0) {
        return moveIndex;
      }
    }

    // Last resort: random valid move
    return validMoveIndices[
      Math.floor(Math.random() * validMoveIndices.length)
    ];
  }

  /**
   * Make a move on the given board
   *
   * Process:
   * 1. Convert board to canonical form
   * 2. Get or create matchbox for this state
   * 3. Select move from matchbox (on canonical board)
   * 4. Map the canonical move back to actual board
   * 5. Record the move for training
   *
   * @param board - The current game board (actual orientation)
   * @returns The index where MENACE wants to play (on actual board)
   */
  makeMove(board: Board): number {
    // Step 1: Get canonical representation
    const { canonical, transformIndex } = getCanonicalState(board);

    // Step 2: Get or create matchbox
    let matchbox = this.memory.get(canonical);

    if (!matchbox) {
      // Convert canonical string back to board to get valid moves
      // canonical string format: 'X', 'O', or '_' for empty
      const canonicalBoard: Board = canonical.split("").map((char) => {
        if (char === "X") return "X";
        if (char === "O") return "O";
        return null;
      });
      const validMoves = getValidMoves(canonicalBoard);
      matchbox = this.initializeMatchbox(canonicalBoard, validMoves);
      this.memory.set(canonical, matchbox);
    }

    // Step 3: Get valid moves on ACTUAL board and map them to canonical positions
    const actualValidMoves = getValidMoves(board);
    const canonicalValidMoves: number[] = [];

    // Map each actual valid move to its canonical position
    const transform = TRANSFORMATIONS[transformIndex];
    for (const actualMove of actualValidMoves) {
      const canonicalMove = transform(actualMove);
      canonicalValidMoves.push(canonicalMove);
    }

    // Step 4: Select move from matchbox, but only from currently valid positions
    const canonicalMoveIndex = this.selectMoveFromMatchboxFiltered(
      matchbox,
      canonicalValidMoves,
    );

    // Step 5: Map back to actual board
    const actualMoveIndex = mapCanonicalMoveToActual(
      canonicalMoveIndex,
      transformIndex,
    );

    // Step 6: Record this move for training
    this.currentGameHistory.push({
      canonicalState: canonical,
      moveIndex: canonicalMoveIndex,
      actualMoveIndex: actualMoveIndex,
      transformIndex: transformIndex,
    });

    return actualMoveIndex;
  }

  /**
   * Train the agent based on game result
   *
   * Adjusts bead counts in all matchboxes used during the game:
   * - Win: Add beads (reward)
   * - Draw: Add fewer beads (small reward)
   * - Loss: Remove beads (punishment)
   *
   * @param result - The game result ('X', 'O', or 'Draw')
   */
  train(result: "X" | "O" | "Draw"): void {
    // Determine reward based on result
    let reward: number;
    if (result === this.player) {
      reward = this.config.winReward;
    } else if (result === "Draw") {
      reward = this.config.drawReward;
    } else {
      reward = this.config.lossReward;
    }

    // Apply reward to all moves in the game history
    for (const move of this.currentGameHistory) {
      const matchbox = this.memory.get(move.canonicalState);

      if (!matchbox) {
        console.warn(`Matchbox not found for state: ${move.canonicalState}`);
        continue;
      }

      // Update bead count for the move that was made
      const oldCount = matchbox.beads[move.moveIndex];
      const newCount = Math.max(0, oldCount + reward); // Don't go below 0
      matchbox.beads[move.moveIndex] = newCount;

      // Update total beads
      matchbox.totalBeads += newCount - oldCount;
    }

    // Clear history for next game
    this.currentGameHistory = [];
  }

  /**
   * Reset the current game history (call between games if not training)
   */
  resetGameHistory(): void {
    this.currentGameHistory = [];
  }

  /**
   * Reset all learning (clear memory)
   */
  resetMemory(): void {
    this.memory.clear();
    this.currentGameHistory = [];
  }

  /**
   * Export memory for serialization
   */
  exportMemory(): string {
    const data = Array.from(this.memory.entries()).map(([state, matchbox]) => ({
      state,
      beads: matchbox.beads,
      totalBeads: matchbox.totalBeads,
    }));
    return JSON.stringify(data);
  }

  /**
   * Import memory from serialization
   */
  importMemory(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.memory.clear();

      for (const item of parsed) {
        this.memory.set(item.state, {
          beads: item.beads,
          totalBeads: item.totalBeads,
        });
      }
    } catch (error) {
      console.error("Failed to import memory:", error);
    }
  }
}
