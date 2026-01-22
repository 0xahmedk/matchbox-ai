/**
 * Test file for MENACE engine
 * Run this to verify the core functionality
 */

import {
  MenaceAgent,
  createEmptyBoard,
  makeMove,
  checkWinner,
  getCanonicalState,
  mapCanonicalMoveToActual,
  visualizeTransformations,
  getValidMoves,
  type Board,
} from "./engine";

console.log("=== MENACE Engine Tests ===\n");

// Test 1: Symmetry Reduction
console.log("Test 1: Symmetry Reduction");
console.log("---------------------------");

const testBoard: Board = ["X", null, null, null, "O", null, null, null, null];

console.log("Original board:");
console.log(formatBoard(testBoard));

const { canonical, transformIndex } = getCanonicalState(testBoard);
console.log(`\nCanonical state: "${canonical}"`);
console.log(`Transform index: ${transformIndex}`);

// Test all transformations
console.log("\nAll 8 transformations:");
visualizeTransformations(testBoard);

// Test 2: Coordinate Mapping
console.log("\n\nTest 2: Coordinate Mapping");
console.log("---------------------------");

const canonicalMove = 7;
const actualMove = mapCanonicalMoveToActual(canonicalMove, transformIndex);
console.log(`Canonical move index: ${canonicalMove}`);
console.log(`Actual move index: ${actualMove}`);

// Test 3: Basic Game Flow
console.log("\n\nTest 3: Basic Game Flow");
console.log("---------------------------");

const menace = new MenaceAgent("O");
let board = createEmptyBoard();

console.log("Initial board:");
console.log(formatBoard(board));

// Human plays X at position 0
board = makeMove(board, 0, "X");
console.log("\nAfter X plays at 0:");
console.log(formatBoard(board));

// MENACE plays O
const menaceMove = menace.makeMove(board);
board = makeMove(board, menaceMove, "O");
console.log(`\nMENACE plays at ${menaceMove}:`);
console.log(formatBoard(board));

console.log(`\nMemory size: ${menace.getMemorySize()} states learned`);

// Test 4: Training
console.log("\n\nTest 4: Training (Play multiple games)");
console.log("---------------------------");

const stats = { wins: 0, losses: 0, draws: 0 };

for (let game = 0; game < 10; game++) {
  let gameBoard = createEmptyBoard();
  let currentPlayer: "X" | "O" = "X";
  let result = null;

  while (!result) {
    if (currentPlayer === "O") {
      // MENACE's turn
      const move = menace.makeMove(gameBoard);
      gameBoard = makeMove(gameBoard, move, "O");
    } else {
      // Random opponent
      const validMoves = getValidMoves(gameBoard);
      const randomMove =
        validMoves[Math.floor(Math.random() * validMoves.length)];
      gameBoard = makeMove(gameBoard, randomMove, "X");
    }

    result = checkWinner(gameBoard);
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  // Train MENACE
  menace.train(result);

  // Update stats
  if (result === "O") stats.wins++;
  else if (result === "X") stats.losses++;
  else stats.draws++;
}

console.log(`After 10 games against random opponent:`);
console.log(`  MENACE wins: ${stats.wins}`);
console.log(`  MENACE losses: ${stats.losses}`);
console.log(`  Draws: ${stats.draws}`);
console.log(`  States learned: ${menace.getMemorySize()}`);

// Test 5: Export/Import Memory
console.log("\n\nTest 5: Export/Import Memory");
console.log("---------------------------");

const exported = menace.exportMemory();
console.log(`Exported memory size: ${exported.length} characters`);

const newAgent = new MenaceAgent("O");
newAgent.importMemory(exported);
console.log(`New agent memory size: ${newAgent.getMemorySize()} states`);

// Test 6: Win Detection
console.log("\n\nTest 6: Win Detection");
console.log("---------------------------");

const winningBoards = [
  // Horizontal win
  ["X", "X", "X", null, "O", null, null, "O", null],
  // Vertical win
  ["X", "O", null, "X", "O", null, "X", null, null],
  // Diagonal win
  ["X", "O", null, null, "X", "O", null, null, "X"],
  // Draw
  ["X", "O", "X", "X", "O", "O", "O", "X", "X"],
];

winningBoards.forEach((board, i) => {
  const result = checkWinner(board as Board);
  console.log(`Board ${i + 1}: ${result}`);
});

console.log("\n=== All Tests Complete ===");

// Helper function
function formatBoard(board: Board): string {
  const display = board.map((cell) => (cell === null ? "." : cell));
  return `${display[0]} ${display[1]} ${display[2]}\n${display[3]} ${display[4]} ${display[5]}\n${display[6]} ${display[7]} ${display[8]}`;
}
