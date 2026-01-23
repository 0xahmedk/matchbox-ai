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
  getValidMoves,
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
  // Training / simulation analytics
  trainingStats: Array<{
    generation: number;
    wins: number;
    draws: number;
    losses: number;
  }>;
  runSimulation: (batchSize: number) => void;
  resetBrain: () => void;

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
      trainingStats: [],
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

      /**
       * Run an instant simulation batch where MENACE (as 'X') plays against a Random agent ('O')
       * Uses a temporary MenaceAgent configured as 'X' that imports the current memory,
       * runs `batchSize` fast games (no UI updates), trains the temporary agent, then
       * exports memory back to the singleton `menaceAgent` so the UI agent learns.
       */
      runSimulation: (batchSize: number) => {
        if (batchSize <= 0) return;

        // Create a training agent that plays as 'X'
        const trainingAgent = new MenaceAgent("X");
        // Import current memory so training continues from current knowledge
        try {
          trainingAgent.importMemory(menaceAgent.exportMemory());
        } catch {
          // ignore if export/import fails; trainingAgent starts fresh
        }

        // Local counters for this batch
        let wins = 0;
        let draws = 0;
        let losses = 0;

        for (let i = 0; i < batchSize; i++) {
          // Fresh board
          let board = createEmptyBoard();
          let turn: "X" | "O" = "X";

          // Reset any history on training agent for safety
          trainingAgent.resetGameHistory();

          // Play until terminal
          while (true) {
            // Check terminal first
            const status = ((): GameStatus => {
              const w = checkWinner(board);
              if (w === "X") return "WIN";
              if (w === "O") return "LOSS";
              if (w === "Draw") return "DRAW";
              return "PLAYING";
            })();

            if (status !== "PLAYING") break;

            if (turn === "X") {
              // MENACE (training agent) move
              const move = trainingAgent.makeMove(board);
              board = makeGameMove(board, move, "X");
              turn = "O";
            } else {
              // Random agent move
              const valid = getValidMoves(board);
              if (valid.length === 0) break;
              const choice = valid[Math.floor(Math.random() * valid.length)];
              board = makeGameMove(board, choice, "O");
              turn = "X";
            }
          }

          // Game finished - determine winner and train
          const winner = checkWinner(board);
          const result = winner ? winner : "Draw";
          trainingAgent.train(result);

          // Update local counters (from perspective of MENACE as 'X')
          if (result === "X") wins += 1;
          else if (result === "O") losses += 1;
          else draws += 1;
        }

        // Export trained memory back to the running singleton agent so UI uses updated brain
        try {
          const mem = trainingAgent.exportMemory();
          menaceAgent.importMemory(mem);
        } catch {
          // ignore
        }

        // Update global stats and trainingStats in a single batch update
        set((state) => {
          const totalGames = state.stats.gamesPlayed + batchSize;
          const newWins = state.stats.wins + wins;
          const newLosses = state.stats.losses + losses;
          const newDraws = state.stats.draws + draws;

          const newPoint = {
            generation: totalGames,
            wins: newWins,
            draws: newDraws,
            losses: newLosses,
          };

          return {
            stats: {
              gamesPlayed: totalGames,
              wins: newWins,
              losses: newLosses,
              draws: newDraws,
              statesLearned: menaceAgent.getMemorySize(),
            },
            trainingStats: [...state.trainingStats, newPoint],
          };
        });
      },

      /**
       * Reset full MENACE memory (forget learned beads)
       */
      resetBrain: () => {
        menaceAgent.resetMemory();
        set({
          trainingStats: [],
          stats: {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            statesLearned: 0,
          },
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
