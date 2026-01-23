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
import type { PlayStyle } from "../engine";

type GameStatus = "PLAYING" | "WIN" | "LOSS" | "DRAW";

/**
 * SINGLETON: MenaceAgent instance
 * Lives outside the store to persist across resets and re-renders
 */
const globalBrain = new MenaceAgent("O");

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

  // Play style (controls MENACE selection behaviour)
  playStyle: "PROBABILISTIC" | "MASTER";
  setPlayStyle: (style: "PROBABILISTIC" | "MASTER") => void;

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
      playStyle: "PROBABILISTIC",
      setPlayStyle: (style: "PROBABILISTIC" | "MASTER") =>
        set(() => ({ playStyle: style })),
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
            statesLearned: globalBrain.getMemorySize(),
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
            globalBrain.train(winner);
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

        // Get AI move from MENACE (singleton) using current playStyle
        const style: PlayStyle = state.playStyle || "PROBABILISTIC";
        const moveIndex = globalBrain.makeMove(state.board, style);

        // Get matchbox data for visualization
        const matchbox = globalBrain.getMatchbox(canonicalStateId);
        const beads = matchbox ? [...matchbox.beads] : null;

        // Debug: log memory size and bead distribution so we can verify training effects
        try {
          console.log(
            `MENACE memory size: ${globalBrain.getMemorySize()} | canonical: ${canonicalStateId} | beads: ${beads}`,
          );
        } catch {
          /* ignore logging failures */
        }

        // Make move
        const newBoard = makeGameMove(state.board, moveIndex, "O");

        // Check if game ends after AI move
        const newStatus = state._checkGameResult(newBoard);

        // Record history: include snapshot of the matchbox beads and board BEFORE making the move
        // Try to obtain the last move record from the agent to get canonical move index and transform
        const lastMoveRecord = globalBrain.getLastMoveRecord();

        const historyEntry = {
          canonicalState: canonicalStateId,
          moveIndex: lastMoveRecord ? lastMoveRecord.moveIndex : moveIndex,
          actualMoveIndex: moveIndex,
          transformIndex: lastMoveRecord ? lastMoveRecord.transformIndex : 0,
          boxSnapshot: beads ? [...beads] : undefined,
          boardSnapshot: [...state.board],
        } as MoveRecord;

        // Update state with visualization data and append history
        set((s) => ({
          board: newBoard,
          gameStatus: newStatus,
          isPlayerTurn: newStatus === "PLAYING" ? true : false,
          activeBoxId: canonicalStateId,
          currentBeads: beads,
          history: [...s.history, historyEntry],
        }));

        // Handle game end
        if (newStatus !== "PLAYING") {
          const winner = checkWinner(newBoard);
          if (winner) {
            globalBrain.train(winner);
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
          // Note: stats persist, globalBrain singleton persists
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

        // Train the singleton globalBrain in-place so UI immediately benefits
        // Local counters for this batch
        let wins = 0;
        let draws = 0;
        let losses = 0;

        const brainPlayer = globalBrain.getPlayer();

        for (let i = 0; i < batchSize; i++) {
          // Fresh board
          let board = createEmptyBoard();
          let turn: "X" | "O" = "X";

          // Reset any game history stored on the brain
          globalBrain.resetGameHistory();

          // Play until terminal
          while (true) {
            const status = ((): GameStatus => {
              const w = checkWinner(board);
              if (w === "X") return "WIN";
              if (w === "O") return "LOSS";
              if (w === "Draw") return "DRAW";
              return "PLAYING";
            })();

            if (status !== "PLAYING") break;

            if (turn === brainPlayer) {
              // MENACE (globalBrain) move
              const move = globalBrain.makeMove(board);
              board = makeGameMove(board, move, turn);
              turn = turn === "X" ? "O" : "X";
            } else {
              // Random agent move
              const valid = getValidMoves(board);
              if (valid.length === 0) break;
              const choice = valid[Math.floor(Math.random() * valid.length)];
              board = makeGameMove(board, choice, turn);
              turn = turn === "X" ? "O" : "X";
            }
          }

          // Game finished - determine winner and train the global brain
          const winner = checkWinner(board);
          const result = winner ? winner : "Draw";
          globalBrain.train(result);

          // Update local counters relative to the brain's player
          if (result === brainPlayer) wins += 1;
          else if (result === "Draw") draws += 1;
          else losses += 1;
        }

        // After training, update the UI: fetch beads for the current board's canonical box
        const currentBoard = get().board;
        const { canonical: currentCanonical } = getCanonicalState(currentBoard);
        const currentBox = globalBrain.getMatchbox(currentCanonical);
        const currentBeads = currentBox ? [...currentBox.beads] : null;

        // Console debug summary using canonical empty board representation
        const emptyCanon = "_________";
        const startBox = globalBrain.getMatchbox(emptyCanon);
        try {
          console.log(
            "Training Complete. Total Games:",
            batchSize,
            "- Beads in Start Box:",
            startBox ? startBox.beads : null,
          );
        } catch {
          /* ignore */
        }

        // Update global stats and trainingStats, and push visualization beads
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
              statesLearned: globalBrain.getMemorySize(),
            },
            trainingStats: [...state.trainingStats, newPoint],
            // ensure UI shows updated beads for current board
            activeBoxId: currentCanonical,
            currentBeads: currentBeads,
          };
        });
      },

      /**
       * Reset full MENACE memory (forget learned beads)
       */
      resetBrain: () => {
        globalBrain.resetMemory();
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
export { globalBrain };
