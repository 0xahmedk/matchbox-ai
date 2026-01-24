/**
 * MENACE Agent Implementation
 *
 * MENACE (Machine Educable Noughts And Crosses Engine) learns through
 * reinforcement learning using a "matchbox" system where each game state
 * has beads representing move preferences.
 */

import type { Board, Matchbox, MoveRecord, Player } from "./types";
import { getValidMoves } from "./gameUtils";
import {
  getCanonicalState,
  mapCanonicalMoveToActual,
  TRANSFORMATIONS,
} from "./symmetry";

export type PlayStyle = "PROBABILISTIC" | "MASTER";

/**
 * MENACE Agent Class
 *
 * Implements the learning algorithm for playing Tic-Tac-Toe
 */
export class MenaceAgent {
  private memory: Map<string, Matchbox>;
  private player: Player;
  private currentGameHistory: MoveRecord[];

  constructor(player: Player) {
    this.memory = new Map();
    this.player = player;
    this.currentGameHistory = [];
  }

  /**
   * Return the last recorded MoveRecord for the current game history
   * (useful for UI to inspect what canonical move was chosen).
   */
  getLastMoveRecord(): MoveRecord | null {
    if (this.currentGameHistory.length === 0) return null;
    return this.currentGameHistory[this.currentGameHistory.length - 1];
  }

  /**
   * Get initial beads for a given turn number following Michie 1961 rules
   * Turn mapping (turnNumber):
   *  - Turn 1: 4 beads per valid move
   *  - Turn 3: 3 beads per valid move
   *  - Turn 5: 2 beads per valid move
   *  - Turn 7 and later: 1 bead per valid move
   *
   * @param turnNumber - 1-based turn number derived from empty squares
   */
  private getInitialBeads(turnNumber: number): number {
    // Michie's scheme applies by parity: odd turns have specific bead counts
    if (turnNumber <= 1) return 4; // safety: treat 0/1 as first move
    if (turnNumber === 3) return 3;
    if (turnNumber === 5) return 2;
    if (turnNumber >= 7) return 1;

    // For intermediate even turns (2,4,6) choose the bead count of the next odd turn
    // This mirrors the intention of decreasing beads on later moves.
    if (turnNumber === 2) return 4;
    if (turnNumber === 4) return 3;
    if (turnNumber === 6) return 2;

    // Fallback
    return 1;
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
    // Calculate empty squares and derive a turn number used by Michie's scheme
    // Turn number mapping (per instructions): 9 empty -> Turn 1, 7 empty -> Turn 3, 5 empty -> Turn 5, 3 empty -> Turn 7
    // We compute a turn number as (10 - emptyCount) so empty=9 => 1, empty=7 => 3, empty=5 => 5, empty=3 => 7
    const emptyCount = board.filter((b) => b === null).length;
    const turnNumber = 10 - emptyCount;

    // Determine bead count using Michie's per-move rules via helper
    const beadCount = this.getInitialBeads(turnNumber);

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
   * Generate a command (move) for the given board according to the play style.
   * Returns canonical and actual indices along with transform info.
   */
  getCommand(
    board: Board,
    style: PlayStyle = "PROBABILISTIC",
  ): {
    canonicalMoveIndex: number;
    actualMoveIndex: number;
    transformIndex: number;
    canonicalState: string;
    matchbox?: Matchbox;
  } {
    const { canonical, transformIndex } = getCanonicalState(board);

    // Ensure matchbox exists
    let matchbox = this.memory.get(canonical);
    if (!matchbox) {
      const canonicalBoard: Board = canonical.split("").map((char) => {
        if (char === "X") return "X";
        if (char === "O") return "O";
        return null;
      });
      const validMoves = getValidMoves(canonicalBoard);
      matchbox = this.initializeMatchbox(canonicalBoard, validMoves);
      this.memory.set(canonical, matchbox);
    }

    // Map actual valid moves to canonical positions
    const actualValidMoves = getValidMoves(board);
    const canonicalValidMoves: number[] = [];
    const transform = TRANSFORMATIONS[transformIndex];
    for (const actualMove of actualValidMoves) {
      canonicalValidMoves.push(transform(actualMove));
    }

    let canonicalMoveIndex: number;

    if (style === "MASTER") {
      // Greedy: pick the canonical valid move with highest bead count
      let maxBeads = -Infinity;
      const best: number[] = [];
      for (const mv of canonicalValidMoves) {
        const b = matchbox!.beads[mv];
        if (b > maxBeads) {
          maxBeads = b;
          best.length = 0;
          best.push(mv);
        } else if (b === maxBeads) {
          best.push(mv);
        }
      }

      if (best.length === 0) {
        // No beads -> fallback random valid canonical move
        canonicalMoveIndex =
          canonicalValidMoves[
            Math.floor(Math.random() * canonicalValidMoves.length)
          ];
      } else {
        // Tie-break randomly among best
        canonicalMoveIndex = best[Math.floor(Math.random() * best.length)];
      }
    } else {
      // Probabilistic selection
      canonicalMoveIndex = this.selectMoveFromMatchboxFiltered(
        matchbox!,
        canonicalValidMoves,
      );
    }

    const actualMoveIndex = mapCanonicalMoveToActual(
      canonicalMoveIndex,
      transformIndex,
    );

    return {
      canonicalMoveIndex,
      actualMoveIndex,
      transformIndex,
      canonicalState: canonical,
      matchbox,
    };
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
  makeMove(board: Board, style: PlayStyle = "PROBABILISTIC"): number {
    const cmd = this.getCommand(board, style);

    // Record this move for training (store canonicalState and transformIndex so UI can align)
    this.currentGameHistory.push({
      canonicalState: cmd.canonicalState,
      moveIndex: cmd.canonicalMoveIndex,
      actualMoveIndex: cmd.actualMoveIndex,
      transformIndex: cmd.transformIndex,
    });

    return cmd.actualMoveIndex;
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
  train(result: "X" | "O" | "Draw"): number | void {
    // According to the requested scheme: Win +3, Draw +1, Loss: remove the bead used
    // We will apply these directly rather than using config values to ensure exact behaviour

    // For each move in history, update the bead counts appropriately
    // If after applying a punishment a matchbox ends up with all zeros, return -1 to signal resign

    const isWin = result === this.player;
    const isDraw = result === "Draw";

    for (let i = 0; i < this.currentGameHistory.length; i++) {
      const move = this.currentGameHistory[i];
      const matchbox = this.memory.get(move.canonicalState);

      if (!matchbox) {
        console.warn(`Matchbox not found for state: ${move.canonicalState}`);
        continue;
      }

      const idx = move.moveIndex;
      const oldCount = matchbox.beads[idx];

      if (isWin) {
        // Win: add 3 beads
        const add = 3;
        matchbox.beads[idx] = oldCount + add;
        matchbox.totalBeads += add;
      } else if (isDraw) {
        // Draw: add 1 bead
        const add = 1;
        matchbox.beads[idx] = oldCount + add;
        matchbox.totalBeads += add;
      } else {
        // Loss: remove the bead used (decrement by 1)
        const dec = 1;
        const newCount = Math.max(0, oldCount - dec);
        const delta = newCount - oldCount;
        matchbox.beads[idx] = newCount;
        matchbox.totalBeads += delta;

        // If all beads in this matchbox now zero, return -1 to indicate resignation
        const allZero = matchbox.beads.every((b) => b === 0);
        if (allZero) {
          // Clear history (we still want prior moves to be punished by the caller observing -1)
          this.currentGameHistory = [];
          return -1;
        }
      }
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
