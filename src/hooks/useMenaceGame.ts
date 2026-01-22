/**
 * Custom Hook: useMenaceGame
 * Manages the entire game lifecycle for MENACE Tic-Tac-Toe
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  type Board,
  MenaceAgent,
  createEmptyBoard,
  makeMove as makeGameMove,
  checkWinner,
} from "../engine";

type GameStatus = "PLAYING" | "WIN" | "LOSS" | "DRAW";

interface UseMenaceGameReturn {
  board: Board;
  isPlayerTurn: boolean;
  gameStatus: GameStatus;
  humanMove: (index: number) => void;
  resetGame: () => void;
  train: (games: number) => void;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    statesLearned: number;
  };
}

export function useMenaceGame(): UseMenaceGameReturn {
  // CRITICAL: Use useRef to persist MenaceAgent across renders
  const menaceAgentRef = useRef<MenaceAgent | null>(null);

  // Initialize agent once
  if (menaceAgentRef.current === null) {
    menaceAgentRef.current = new MenaceAgent("O");
  }

  // Game state
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Player is X, starts first
  const [gameStatus, setGameStatus] = useState<GameStatus>("PLAYING");

  // Statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    statesLearned: 0,
  });

  /**
   * Check game result and update status
   */
  const checkGameResult = useCallback((currentBoard: Board): GameStatus => {
    const winner = checkWinner(currentBoard);

    if (winner === "X") {
      return "WIN"; // Player wins
    } else if (winner === "O") {
      return "LOSS"; // MENACE wins
    } else if (winner === "Draw") {
      return "DRAW";
    }

    return "PLAYING";
  }, []);

  /**
   * Update statistics after game ends
   */
  const updateStats = useCallback((status: GameStatus) => {
    if (status === "PLAYING") return;

    setStats((prev) => ({
      gamesPlayed: prev.gamesPlayed + 1,
      wins: status === "WIN" ? prev.wins + 1 : prev.wins,
      losses: status === "LOSS" ? prev.losses + 1 : prev.losses,
      draws: status === "DRAW" ? prev.draws + 1 : prev.draws,
      statesLearned:
        menaceAgentRef.current?.getMemorySize() ?? prev.statesLearned,
    }));
  }, []);

  /**
   * Human player makes a move
   */
  const humanMove = useCallback(
    (index: number) => {
      // Validation
      if (gameStatus !== "PLAYING") return;
      if (!isPlayerTurn) return;
      if (board[index] !== null) return;

      // Make move
      const newBoard = makeGameMove(board, index, "X");
      setBoard(newBoard);

      // Check if game ends after player move
      const newStatus = checkGameResult(newBoard);
      setGameStatus(newStatus);

      if (newStatus !== "PLAYING") {
        // Game ended - train MENACE
        const winner = checkWinner(newBoard);
        if (winner && menaceAgentRef.current) {
          menaceAgentRef.current.train(winner);
        }
        updateStats(newStatus);
      } else {
        // Game continues - switch to AI turn
        setIsPlayerTurn(false);
      }
    },
    [board, isPlayerTurn, gameStatus, checkGameResult, updateStats],
  );

  /**
   * AI makes a move
   */
  const aiMove = useCallback(() => {
    if (!menaceAgentRef.current) return;
    if (gameStatus !== "PLAYING") return;
    if (isPlayerTurn) return;

    // Get AI move
    const moveIndex = menaceAgentRef.current.makeMove(board);

    // Make move
    const newBoard = makeGameMove(board, moveIndex, "O");
    setBoard(newBoard);

    // Check if game ends after AI move
    const newStatus = checkGameResult(newBoard);
    setGameStatus(newStatus);

    if (newStatus !== "PLAYING") {
      // Game ended - train MENACE
      const winner = checkWinner(newBoard);
      if (winner && menaceAgentRef.current) {
        menaceAgentRef.current.train(winner);
      }
      updateStats(newStatus);
    } else {
      // Game continues - switch to player turn
      setIsPlayerTurn(true);
    }
  }, [board, isPlayerTurn, gameStatus, checkGameResult, updateStats]);

  /**
   * THE GAME LOOP: Watch for AI turn
   */
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === "PLAYING") {
      // Add 500ms delay so user can see the board change
      const timer = setTimeout(() => {
        aiMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, aiMove]);

  /**
   * Reset game - keeps MENACE's memory intact
   */
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameStatus("PLAYING");
    // Note: menaceAgentRef persists, keeping learned memory
  }, []);

  /**
   * Train MENACE by playing multiple games
   * Placeholder for Phase 4
   */
  const train = useCallback((games: number) => {
    console.log(`Training MENACE for ${games} games...`);
    // TODO: Implement auto-play training in Phase 4
  }, []);

  return {
    board,
    isPlayerTurn,
    gameStatus,
    humanMove,
    resetGame,
    train,
    stats,
  };
}
