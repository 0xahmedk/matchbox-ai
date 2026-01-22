# MENACE Engine - Core Logic Documentation

## Overview

This is a complete TypeScript implementation of the MENACE (Machine Educable Noughts And Crosses Engine) algorithm with **symmetry reduction** to minimize the state space from ~19,683 possible board states to ~304 unique canonical states.

## Architecture

### File Structure

```
src/
├── engine/
│   ├── types.ts           # Core TypeScript types
│   ├── gameUtils.ts       # Game logic utilities (winner checking, valid moves, etc.)
│   ├── symmetry.ts        # Symmetry reduction & coordinate mapping
│   ├── MenaceAgent.ts     # Main AI agent implementation
│   └── index.ts           # Public API exports
└── useMenaceGame.ts       # React hook example for integration
```

## Key Features

### 1. Board Representation

- **1D Array**: The board is represented as a flat array of 9 elements: `(Player | null)[]`
- **Indices**:
  ```
  0 1 2
  3 4 5
  6 7 8
  ```

### 2. Symmetry Reduction (CRITICAL)

The board has **8 symmetries**:

- 4 rotations: 0°, 90°, 180°, 270°
- 4 reflections: horizontal flip of each rotation

#### `getCanonicalState(board)`

This function finds the **lexicographically smallest** string representation across all 8 transformations.

**Example:**

```
Original:      Rotation 90°:   Canonical (smallest):
X _ _          _ _ X          _ _ _
_ O _    vs    _ O _    =>    O O _
_ _ _          _ _ _          X X _
```

All symmetric variations map to the same canonical state, drastically reducing memory requirements.

### 3. Coordinate Mapping

When MENACE picks a move on the **canonical board**, we must map it back to the **actual board**.

#### `mapCanonicalMoveToActual(canonicalMoveIndex, transformIndex)`

**Process:**

1. MENACE sees the canonical board and picks index `M`
2. We know which transformation (0-7) was used to get the canonical state
3. We reverse the transformation to find which index on the actual board corresponds to `M`

**Example:**

```
Actual Board:  Transform 1 (90° CW):  MENACE picks index 7
_ O _          _ _ _                  on canonical board
_ X _    =>    O X _
_ _ _          _ X _

Map back: index 7 on canonical → index 3 on actual board
```

## Core Classes and Functions

### GameUtils (`gameUtils.ts`)

```typescript
checkWinner(board: Board): GameResult
// Returns 'X', 'O', 'Draw', or null (ongoing)

getValidMoves(board: Board): number[]
// Returns array of empty position indices

createEmptyBoard(): Board
// Returns a new empty board

makeMove(board, index, player): Board
// Immutably places a mark on the board

countMoves(board: Board): number
// Counts total moves made
```

### Symmetry (`symmetry.ts`)

```typescript
getCanonicalState(board: Board): { canonical: string, transformIndex: number }
// Finds the canonical (smallest) representation

mapCanonicalMoveToActual(canonicalMoveIndex: number, transformIndex: number): number
// Maps move from canonical board back to actual board

visualizeTransformations(board: Board): void
// Debug helper to visualize all 8 transformations
```

### MenaceAgent (`MenaceAgent.ts`)

```typescript
class MenaceAgent {
  constructor(player: Player, config?: Partial<MenaceConfig>);

  makeMove(board: Board): number;
  // Returns the index where AI wants to play

  train(result: "X" | "O" | "Draw"): void;
  // Adjusts bead counts based on game outcome

  resetMemory(): void;
  // Clears all learned states

  exportMemory(): string;
  importMemory(data: string): void;
  // Serialize/deserialize learned states
}
```

### Configuration

```typescript
interface MenaceConfig {
  initialBeadsEarly: number; // Default: 8 (first 3 moves)
  initialBeadsMid: number; // Default: 4 (middle game)
  initialBeadsLate: number; // Default: 2 (late game)
  winReward: number; // Default: 3
  drawReward: number; // Default: 1
  lossReward: number; // Default: -1
}
```

## How MENACE Learns

### Matchbox System

Each unique game state has a "matchbox" containing beads:

- Each position (0-8) has a bead count
- Higher bead count = higher probability of selection
- Move selection uses **weighted random sampling**

### Training Process

After each game:

- **Win**: Add 3 beads to each chosen move
- **Draw**: Add 1 bead to each chosen move
- **Loss**: Remove 1 bead from each chosen move (minimum 0)

Over time, MENACE learns to favor winning strategies and avoid losing ones.

## React Integration

### Using the Custom Hook

```tsx
import { useMenaceGame } from "./useMenaceGame";

function TicTacToeGame() {
  const { board, currentPlayer, winner, isGameOver, stats, actions } =
    useMenaceGame("O");

  return (
    <div>
      <h1>MENACE Tic-Tac-Toe</h1>

      <div className="stats">
        <p>Games Played: {stats.gamesPlayed}</p>
        <p>Your Wins: {stats.wins}</p>
        <p>Your Losses: {stats.losses}</p>
        <p>Draws: {stats.draws}</p>
        <p>States Learned: {stats.memorySize}</p>
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => actions.makeMove(index)}
            disabled={cell !== null || isGameOver}
            className={`cell ${cell ?? "empty"}`}
          >
            {cell ?? ""}
          </button>
        ))}
      </div>

      {isGameOver && (
        <div className="game-over">
          <h2>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</h2>
          <button onClick={actions.newGame}>New Game</button>
        </div>
      )}

      <button onClick={actions.resetStats}>Reset MENACE Memory</button>
    </div>
  );
}
```

### Manual Integration (useReducer)

If you prefer more control, see `useMenaceGame.ts` for a complete example of:

- State management with `useReducer`
- Action types for moves, training, and game resets
- Automatic AI turns with `useEffect`
- Statistics tracking

## State Space Reduction

### Without Symmetry Reduction

- Empty board: 1 state
- After 1 move: 9 states
- After 2 moves: 9 × 8 = 72 states
- After 3 moves: 9 × 8 × 7 = 504 states
- **Total possible states: ~19,683**

### With Symmetry Reduction

- Empty board: 1 canonical state
- After 1 move: 1 canonical state (all corners/edges/center are symmetric)
- After 2 moves: ~12 canonical states
- **Total canonical states: ~304**

This 98.5% reduction dramatically improves:

- ✅ Memory efficiency
- ✅ Learning speed (same state seen more often)
- ✅ Performance

## Testing the Implementation

### Basic Test

```typescript
import { MenaceAgent, createEmptyBoard, makeMove, checkWinner } from "./engine";

// Create AI player
const menace = new MenaceAgent("O");

// Play a game
let board = createEmptyBoard();
board = makeMove(board, 0, "X"); // Human move

const aiMove = menace.makeMove(board); // AI move
board = makeMove(board, aiMove, "O");

// Continue playing...

// After game ends
const result = checkWinner(board);
if (result) {
  menace.train(result); // Train MENACE
}

console.log("Memory size:", menace.getMemorySize());
```

### Symmetry Test

```typescript
import { getCanonicalState, visualizeTransformations } from "./engine/symmetry";

const board = ["X", null, null, null, "O", null, null, null, null];

// See all 8 transformations
visualizeTransformations(board);

// Get canonical form
const { canonical, transformIndex } = getCanonicalState(board);
console.log("Canonical:", canonical); // "_____OX__" (example)
console.log("Transform:", transformIndex); // 3 (example)
```

## Performance Considerations

1. **Canonical State Calculation**: O(72) - checks 8 transformations × 9 positions
2. **Move Selection**: O(9) - weighted random from bead counts
3. **Memory**: O(304 × 9) ≈ 2.7KB for fully explored state space

## Functional Programming Patterns

- All game operations are **immutable** (return new boards)
- Pure functions for symmetry transformations
- No side effects in utility functions
- State changes only in `MenaceAgent.train()`

## Future Enhancements

- [ ] Persistent storage (localStorage/IndexedDB)
- [ ] Visualization of matchbox contents
- [ ] Training against perfect minimax player
- [ ] Adjustable learning rates
- [ ] Multi-agent tournaments

## References

- Original MENACE by Donald Michie (1961)
- [MENACE Wikipedia](https://en.wikipedia.org/wiki/Matchbox_Educable_Noughts_and_Crosses_Engine)

---

**Built with TypeScript, Functional Programming, and ❤️**
