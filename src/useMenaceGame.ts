/**
 * Example: How to integrate MENACE with React useReducer
 *
 * This file demonstrates how to use the MENACE engine in a React application
 */

import { useReducer, useEffect } from "react";
import {
  type Board,
  type Player,
  type GameResult,
  MenaceAgent,
  createEmptyBoard,
  makeMove as makeGameMove,
  checkWinner,
} from "./engine";

/**
 * Game State for React
 */
interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: GameResult;
  moveHistory: number[];
  isGameOver: boolean;
  aiPlayer: Player;
  menaceAgent: MenaceAgent | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

/**
 * Actions for the reducer
 */
type GameAction =
  | { type: "MAKE_MOVE"; payload: { index: number } }
  | { type: "AI_MOVE" }
  | { type: "NEW_GAME"; payload?: { aiPlayer?: Player } }
  | { type: "RESET_STATS" }
  | { type: "INITIALIZE_AI"; payload: { player: Player } };

/**
 * Initial state
 */
const initialState: GameState = {
  board: createEmptyBoard(),
  currentPlayer: "X",
  winner: null,
  moveHistory: [],
  isGameOver: false,
  aiPlayer: "O",
  menaceAgent: null,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

/**
 * Game reducer
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INITIALIZE_AI": {
      return {
        ...state,
        menaceAgent: new MenaceAgent(action.payload.player),
        aiPlayer: action.payload.player,
      };
    }

    case "MAKE_MOVE": {
      const { index } = action.payload;

      if (state.isGameOver || state.board[index] !== null) {
        return state;
      }

      const newBoard = makeGameMove(state.board, index, state.currentPlayer);
      const winner = checkWinner(newBoard);
      const isGameOver = winner !== null;

      // Train MENACE if game is over
      if (isGameOver && state.menaceAgent) {
        state.menaceAgent.train(winner === "Draw" ? "Draw" : winner);
      }

      // Update stats
      const newStats = {
        gamesPlayed: state.gamesPlayed,
        wins: state.wins,
        losses: state.losses,
        draws: state.draws,
      };

      if (isGameOver) {
        newStats.gamesPlayed++;
        if (winner === "Draw") {
          newStats.draws++;
        } else if (winner === state.aiPlayer) {
          newStats.losses++;
        } else {
          newStats.wins++;
        }
      }

      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === "X" ? "O" : "X",
        winner,
        isGameOver,
        moveHistory: [...state.moveHistory, index],
        ...newStats,
      };
    }

    case "AI_MOVE": {
      if (state.isGameOver || !state.menaceAgent) {
        return state;
      }

      const aiMoveIndex = state.menaceAgent.makeMove(state.board);

      // Recursively apply the move using MAKE_MOVE action
      return gameReducer(state, {
        type: "MAKE_MOVE",
        payload: { index: aiMoveIndex },
      });
    }

    case "NEW_GAME": {
      const newAiPlayer = action.payload?.aiPlayer ?? state.aiPlayer;

      // Reset game history in agent
      if (state.menaceAgent) {
        state.menaceAgent.resetGameHistory();
      }

      return {
        ...state,
        board: createEmptyBoard(),
        currentPlayer: "X",
        winner: null,
        moveHistory: [],
        isGameOver: false,
        aiPlayer: newAiPlayer,
      };
    }

    case "RESET_STATS": {
      // Reset stats and clear MENACE memory
      if (state.menaceAgent) {
        state.menaceAgent.resetMemory();
      }

      return {
        ...state,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom hook for MENACE game
 */
export function useMenaceGame(aiPlayer: Player = "O") {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    aiPlayer,
  });

  // Initialize AI on mount
  useEffect(() => {
    dispatch({ type: "INITIALIZE_AI", payload: { player: aiPlayer } });
  }, [aiPlayer]);

  // Auto-play AI turn
  useEffect(() => {
    if (
      !state.isGameOver &&
      state.currentPlayer === state.aiPlayer &&
      state.menaceAgent
    ) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        dispatch({ type: "AI_MOVE" });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    state.currentPlayer,
    state.isGameOver,
    state.aiPlayer,
    state.menaceAgent,
  ]);

  const makeMove = (index: number) => {
    dispatch({ type: "MAKE_MOVE", payload: { index } });
  };

  const newGame = () => {
    dispatch({ type: "NEW_GAME" });
  };

  const resetStats = () => {
    dispatch({ type: "RESET_STATS" });
  };

  const switchAiPlayer = (player: Player) => {
    dispatch({ type: "NEW_GAME", payload: { aiPlayer: player } });
  };

  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    winner: state.winner,
    isGameOver: state.isGameOver,
    aiPlayer: state.aiPlayer,
    stats: {
      gamesPlayed: state.gamesPlayed,
      wins: state.wins,
      losses: state.losses,
      draws: state.draws,
      memorySize: state.menaceAgent?.getMemorySize() ?? 0,
    },
    actions: {
      makeMove,
      newGame,
      resetStats,
      switchAiPlayer,
    },
  };
}

/**
 * Example Component Usage:
 *
 * ```tsx
 * function TicTacToe() {
 *   const { board, currentPlayer, winner, isGameOver, stats, actions } = useMenaceGame('O');
 *
 *   return (
 *     <div>
 *       <h1>MENACE Tic-Tac-Toe</h1>
 *
 *       <div className="stats">
 *         <p>Games: {stats.gamesPlayed}</p>
 *         <p>Wins: {stats.wins}</p>
 *         <p>Losses: {stats.losses}</p>
 *         <p>Draws: {stats.draws}</p>
 *         <p>States Learned: {stats.memorySize}</p>
 *       </div>
 *
 *       <div className="board">
 *         {board.map((cell, index) => (
 *           <button
 *             key={index}
 *             onClick={() => actions.makeMove(index)}
 *             disabled={cell !== null || isGameOver}
 *           >
 *             {cell ?? ''}
 *           </button>
 *         ))}
 *       </div>
 *
 *       {isGameOver && (
 *         <div>
 *           <h2>{winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}</h2>
 *           <button onClick={actions.newGame}>New Game</button>
 *         </div>
 *       )}
 *
 *       <button onClick={actions.resetStats}>Reset MENACE Memory</button>
 *     </div>
 *   );
 * }
 * ```
 */
