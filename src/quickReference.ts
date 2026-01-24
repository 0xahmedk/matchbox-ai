/**
 * Quick Reference: Common MENACE Operations
 * Copy-paste these snippets for quick implementation
 */

import {
  MenaceAgent,
  createEmptyBoard,
  makeMove,
  checkWinner,
  getValidMoves,
  getCanonicalState,
  type Board,
  type Player,
} from "./engine";

// ============================================
// 1. INITIALIZE MENACE AGENT
// ============================================

const menace = new MenaceAgent("O");

// ============================================
// 2. PLAY A SINGLE GAME
// ============================================

function playSingleGame() {
  let board = createEmptyBoard();
  let currentPlayer: Player = "X";

  while (checkWinner(board) === null) {
    if (currentPlayer === "O") {
      // MENACE's turn
      const move = menace.makeMove(board);
      board = makeMove(board, move, "O");
    } else {
      // Human or random opponent
      const validMoves = getValidMoves(board);
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      board = makeMove(board, move, "X");
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  const result = checkWinner(board)!;
  menace.train(result); // Train MENACE after game

  return result;
}

// ============================================
// 3. TRAIN MENACE (Multiple Games)
// ============================================

function trainMenace(numGames: number) {
  const stats = { wins: 0, losses: 0, draws: 0 };

  for (let i = 0; i < numGames; i++) {
    const result = playSingleGame();

    if (result === "O") stats.wins++;
    else if (result === "X") stats.losses++;
    else stats.draws++;
  }

  console.log(`Training complete after ${numGames} games:`);
  console.log(`  Wins: ${stats.wins}`);
  console.log(`  Losses: ${stats.losses}`);
  console.log(`  Draws: ${stats.draws}`);
  console.log(`  States learned: ${menace.getMemorySize()}`);

  return stats;
}

// ============================================
// 4. SAVE/LOAD MENACE MEMORY
// ============================================

// Save to localStorage
function saveMenaceMemory() {
  const memory = menace.exportMemory();
  localStorage.setItem("menace-memory", memory);
  console.log("Memory saved!");
}

// Load from localStorage
function loadMenaceMemory() {
  const saved = localStorage.getItem("menace-memory");
  if (saved) {
    menace.importMemory(saved);
    console.log(`Memory loaded! ${menace.getMemorySize()} states.`);
  } else {
    console.log("No saved memory found.");
  }
}

// ============================================
// 5. GET GAME STATISTICS
// ============================================

function getGameStats(board: Board) {
  const winner = checkWinner(board);
  const validMoves = getValidMoves(board);
  const movesPlayed = 9 - validMoves.length;
  const isGameOver = winner !== null;

  return {
    winner,
    isGameOver,
    movesPlayed,
    validMoves,
    memorySize: menace.getMemorySize(),
  };
}

// ============================================
// 6. INSPECT MATCHBOX (Debug/Visualization)
// ============================================

function inspectMatchbox(board: Board) {
  const { canonical } = getCanonicalState(board);
  const matchbox = menace.getMatchbox(canonical);

  if (matchbox) {
    console.log("Matchbox for current state:");
    console.log("Canonical:", canonical);
    console.log("Beads per position:", matchbox.beads);
    console.log("Total beads:", matchbox.totalBeads);

    // Calculate probabilities
    const probabilities = matchbox.beads.map((beads) =>
      matchbox.totalBeads > 0 ? (beads / matchbox.totalBeads) * 100 : 0,
    );
    console.log(
      "Probabilities (%):",
      probabilities.map((p) => p.toFixed(1)),
    );
  } else {
    console.log("No matchbox for this state yet.");
  }
}

// ============================================
// 7. RESET MENACE
// ============================================

function resetMenace() {
  menace.resetMemory();
  console.log("MENACE memory cleared.");
}

// ============================================
// 8. EVALUATE MENACE PERFORMANCE
// ============================================

function evaluatePerformance(numGames: number) {
  const results: Array<"win" | "loss" | "draw"> = [];

  for (let i = 0; i < numGames; i++) {
    const result = playSingleGame();

    if (result === "O") results.push("win");
    else if (result === "X") results.push("loss");
    else results.push("draw");
  }

  // Calculate win rate over time (rolling average)
  const windowSize = 10;
  const winRates: number[] = [];

  for (let i = windowSize; i <= results.length; i++) {
    const window = results.slice(i - windowSize, i);
    const wins = window.filter((r) => r === "win").length;
    winRates.push((wins / windowSize) * 100);
  }

  return {
    totalGames: numGames,
    finalWinRate: winRates[winRates.length - 1],
    winRatesOverTime: winRates,
    statesLearned: menace.getMemorySize(),
  };
}

// ============================================
// 9. EXPORT FOR VISUALIZATION
// ============================================

function exportAllMatchboxes() {
  const matchboxes = menace.getAllMatchboxes();
  const data: Array<{
    state: string;
    beads: number[];
    totalBeads: number;
  }> = [];

  matchboxes.forEach((matchbox, state) => {
    data.push({
      state,
      beads: [...matchbox.beads],
      totalBeads: matchbox.totalBeads,
    });
  });

  return data;
}

// ============================================
// 10. FORMAT BOARD FOR DISPLAY
// ============================================

function formatBoard(board: Board): string {
  const display = board.map((cell) => (cell === null ? "." : cell));
  return [
    display.slice(0, 3).join(" "),
    display.slice(3, 6).join(" "),
    display.slice(6, 9).join(" "),
  ].join("\n");
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Quick training session
// trainMenace(100);
// saveMenaceMemory();

// Example 2: Load and play
// loadMenaceMemory();
// const result = playSingleGame();
// console.log('Game result:', result);

// Example 3: Evaluate learning progress
// const performance = evaluatePerformance(200);
// console.log('Final win rate:', performance.finalWinRate.toFixed(1) + '%');

// Example 4: Debug specific position
// const board = createEmptyBoard();
// const move1 = makeMove(board, 4, 'X'); // X in center
// inspectMatchbox(move1);

export {
  trainMenace,
  saveMenaceMemory,
  loadMenaceMemory,
  getGameStats,
  inspectMatchbox,
  resetMenace,
  evaluatePerformance,
  exportAllMatchboxes,
  formatBoard,
};
