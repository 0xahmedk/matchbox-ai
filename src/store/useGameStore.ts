/**
 * Zustand Store: useGameStore
 * Global state management for MENACE Tic-Tac-Toe
 *
 * Architecture:
 * - MenaceAgent is instantiated as a singleton outside the store
 * - Store manages UI state + game state
 * - Exposes activeBoxId and currentBeads for visualization
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  type Board,
  type MoveRecord,
  MenaceAgent,
  createEmptyBoard,
  makeMove as makeGameMove,
  checkWinner,
  getCanonicalState,
} from "../engine";

type GameStatus = "PLAYING" | "WIN" | "LOSS" | "DRAW";

/**
 * SINGLETON: MenaceAgent instance
 * Lives outside the store to persist across resets and re-renders
 */
const menaceAgent = new MenaceAgent("O");

interface GameState {
  // Core game state
  board: Board;
  isPlayerTurn: boolean;
  gameStatus: GameStatus;

  // Visualization state (for UI to show MENACE's decision process)
  activeBoxId: string | null; // Current canonical state ID
  currentBeads: number[] | null; // Bead distribution for active matchbox

  // History for training
  history: MoveRecord[];

  // Statistics
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    statesLearned: number;
  };

  // Actions
  humanMove: (index: number) => void;
  aiMove: () => Promise<void>;
  resetGame: () => void;

  // Internal helpers
  _checkGameResult: (board: Board) => GameStatus;
  _updateStats: (status: GameStatus) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      board: createEmptyBoard(),
      isPlayerTurn: true,
      gameStatus: "PLAYING",
      activeBoxId: null,
      currentBeads: null,
      history: [],
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        statesLearned: 0,
      },

      /**
       * Internal: Check game result
       */
      _checkGameResult: (currentBoard: Board): GameStatus => {
        const winner = checkWinner(currentBoard);

        if (winner === "X") return "WIN"; // Player wins
        if (winner === "O") return "LOSS"; // MENACE wins
        if (winner === "Draw") return "DRAW";

        return "PLAYING";
      },

      /**
       * Internal: Update statistics
       */
      _updateStats: (status: GameStatus) => {
        if (status === "PLAYING") return;

        set((state) => ({
          stats: {
            gamesPlayed: state.stats.gamesPlayed + 1,
            wins: status === "WIN" ? state.stats.wins + 1 : state.stats.wins,
            losses:
              status === "LOSS" ? state.stats.losses + 1 : state.stats.losses,
            draws:
              status === "DRAW" ? state.stats.draws + 1 : state.stats.draws,
            statesLearned: menaceAgent.getMemorySize(),
          },
        }));
      },

      /**
       * Action: Human player makes a move
       */
      humanMove: (index: number) => {
        const state = get();

        // Validation
        if (state.gameStatus !== "PLAYING") return;
        if (!state.isPlayerTurn) return;
        if (state.board[index] !== null) return;

        // Make move
        const newBoard = makeGameMove(state.board, index, "X");

        // Check if game ends after player move
        const newStatus = state._checkGameResult(newBoard);

        // Update state
        set({
          board: newBoard,
          gameStatus: newStatus,
          isPlayerTurn: newStatus === "PLAYING" ? false : true,
        });

        // Handle game end
        if (newStatus !== "PLAYING") {
          const winner = checkWinner(newBoard);
          if (winner) {
            menaceAgent.train(winner);
          }
          state._updateStats(newStatus);
        } else {
          // Game continues - trigger AI move after state update
          // Using setTimeout to ensure state update completes first
          setTimeout(() => {
            get().aiMove();
          }, 0);
        }
      },

      /**
       * Action: AI makes a move
       * Async to allow for delay/animation
       */
      aiMove: async () => {
        const state = get();

        // Validation
        if (state.gameStatus !== "PLAYING") return;
        if (state.isPlayerTurn) return;

        // Add delay for better UX (user can see the board change)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get canonical state for visualization
        const { canonical: canonicalStateId } = getCanonicalState(state.board);

        // Get AI move from MENACE
        const moveIndex = menaceAgent.makeMove(state.board);

        // Get matchbox data for visualization
        const matchbox = menaceAgent.getMatchbox(canonicalStateId);
        const beads = matchbox ? [...matchbox.beads] : null;

        // Make move
        const newBoard = makeGameMove(state.board, moveIndex, "O");

        // Check if game ends after AI move
        const newStatus = state._checkGameResult(newBoard);

        // Update state with visualization data
        set({
          board: newBoard,
          gameStatus: newStatus,
          isPlayerTurn: newStatus === "PLAYING" ? true : false,
          activeBoxId: canonicalStateId,
          currentBeads: beads,
        });

        // Handle game end
        if (newStatus !== "PLAYING") {
          const winner = checkWinner(newBoard);
          if (winner) {
            menaceAgent.train(winner);
          }
          state._updateStats(newStatus);
        }
      },

      /**
       * Action: Reset game
       * Clears board and state, but KEEPS MENACE's learned memory
       */
      resetGame: () => {
        set({
          board: createEmptyBoard(),
          isPlayerTurn: true,
          gameStatus: "PLAYING",
          activeBoxId: null,
          currentBeads: null,
          history: [],
          // Note: stats persist, menaceAgent singleton persists
        });
      },
    }),
    {
      name: "game-store",
    },
  ),
);

/**
 * Export the singleton agent for advanced use cases
 * (e.g., exporting/importing memory, manual training)
 */
export { menaceAgent };
