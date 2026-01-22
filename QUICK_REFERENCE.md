# 🚀 Quick Reference: Zustand Store

## Import & Basic Usage

```typescript
import { useGameStore, menaceAgent } from "./store/useGameStore";

// In your component
const board = useGameStore((state) => state.board);
const humanMove = useGameStore((state) => state.humanMove);
```

---

## State Properties

| Property       | Type               | Description                            |
| -------------- | ------------------ | -------------------------------------- |
| `board`        | `Board`            | Current 3x3 board state                |
| `isPlayerTurn` | `boolean`          | Whether it's player's turn             |
| `gameStatus`   | `GameStatus`       | 'PLAYING' \| 'WIN' \| 'LOSS' \| 'DRAW' |
| `activeBoxId`  | `string \| null`   | Canonical state ID of current matchbox |
| `currentBeads` | `number[] \| null` | 🔑 Bead distribution [9 numbers]       |
| `history`      | `MoveRecord[]`     | Move history                           |
| `stats`        | `object`           | Game statistics                        |

---

## Actions

### `humanMove(index: number)`

Player makes a move at board position 0-8.

```typescript
const humanMove = useGameStore((state) => state.humanMove);
<button onClick={() => humanMove(4)}>Play Center</button>
```

### `aiMove()`

MENACE makes a move (async, 500ms delay).

```typescript
const aiMove = useGameStore((state) => state.aiMove);
await aiMove(); // Usually called automatically
```

### `resetGame()`

Reset board and start new game (keeps MENACE's memory).

```typescript
const resetGame = useGameStore((state) => state.resetGame);
<button onClick={resetGame}>New Game</button>
```

---

## Visualization Data

### Access MENACE's Decision Process

```typescript
const activeBoxId = useGameStore((state) => state.activeBoxId);
const currentBeads = useGameStore((state) => state.currentBeads);

// Example: Show which position has most beads
if (currentBeads) {
  const bestMove = currentBeads.indexOf(Math.max(...currentBeads));
  console.log(`MENACE prefers position ${bestMove}`);
}
```

### Bead Array Format

```typescript
currentBeads: [8, 0, 4, 3, 8, 2, 0, 1, 5];
//             ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
//            Pos 0-8 on the board
//            Higher number = Higher probability
```

---

## Direct Agent Access

```typescript
import { menaceAgent } from "./store/useGameStore";

// Get memory size
const statesLearned = menaceAgent.getMemorySize();

// Export brain
const brainData = menaceAgent.exportMemory();
localStorage.setItem("menace", brainData);

// Import brain
const saved = localStorage.getItem("menace");
if (saved) menaceAgent.importMemory(saved);

// Get specific matchbox
const matchbox = menaceAgent.getMatchbox("X_O______");
console.log("Beads:", matchbox?.beads);
```

---

## DevTools

1. Install [Redux DevTools](https://github.com/reduxjs/redux-devtools) extension
2. Run app: `pnpm run dev`
3. Open browser DevTools → Redux tab
4. Select "game-store"

**You can now**:

- See all state changes in real-time
- Time-travel through actions
- Export/import state snapshots
- Track action history

---

## Performance Tips

### ✅ Good: Selective Subscriptions

```typescript
// Only re-renders when 'board' changes
const board = useGameStore((state) => state.board);
```

### ⚠️ Not Optimal: Full State

```typescript
// Re-renders on ANY state change
const state = useGameStore();
```

### ✅ Good: Multiple Selectors

```typescript
const board = useGameStore((state) => state.board);
const status = useGameStore((state) => state.gameStatus);
// Two independent subscriptions
```

### ✅ Good: Shallow Comparison

```typescript
import { shallow } from "zustand/shallow";

const { board, status } = useGameStore(
  (state) => ({ board: state.board, status: state.gameStatus }),
  shallow,
);
```

---

## Common Patterns

### Pattern 1: Game Controls

```typescript
function GameControls() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <button onClick={resetGame} disabled={gameStatus === 'PLAYING'}>
      New Game
    </button>
  );
}
```

### Pattern 2: Board Display

```typescript
function BoardDisplay() {
  const board = useGameStore((state) => state.board);
  const humanMove = useGameStore((state) => state.humanMove);
  const disabled = useGameStore(
    (state) => !state.isPlayerTurn || state.gameStatus !== 'PLAYING'
  );

  return <Board squares={board} onClick={humanMove} disabled={disabled} />;
}
```

### Pattern 3: Stats Dashboard

```typescript
function StatsDashboard() {
  const stats = useGameStore((state) => state.stats);

  return (
    <div>
      <p>Games: {stats.gamesPlayed}</p>
      <p>Wins: {stats.wins}</p>
      <p>States Learned: {stats.statesLearned}</p>
    </div>
  );
}
```

### Pattern 4: Visualization

```typescript
function BeadVisualization() {
  const currentBeads = useGameStore((state) => state.currentBeads);

  if (!currentBeads) return <p>No data yet</p>;

  return (
    <div>
      {currentBeads.map((count, i) => (
        <div key={i}>Position {i}: {count} beads</div>
      ))}
    </div>
  );
}
```

---

## TypeScript Types

```typescript
import type { Board, GameStatus, MoveRecord } from "./engine";

type GameStatus = "PLAYING" | "WIN" | "LOSS" | "DRAW";
type Board = (Player | null)[];
type Player = "X" | "O";

interface GameState {
  board: Board;
  isPlayerTurn: boolean;
  gameStatus: GameStatus;
  activeBoxId: string | null;
  currentBeads: number[] | null;
  history: MoveRecord[];
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    statesLearned: number;
  };
  humanMove: (index: number) => void;
  aiMove: () => Promise<void>;
  resetGame: () => void;
}
```

---

## Troubleshooting

### Store not updating?

```typescript
// ✅ Use the action
useGameStore.getState().humanMove(0);

// ❌ Don't mutate directly
useGameStore.getState().board[0] = "X"; // WRONG!
```

### Agent losing memory?

```typescript
// ✅ Agent is singleton, persists automatically
// ✅ resetGame() keeps memory intact
// ✅ Only page refresh clears memory (unless you persist)
```

### Can't see beads?

```typescript
// currentBeads only updates AFTER AI makes a move
const currentBeads = useGameStore((state) => state.currentBeads);
if (!currentBeads) {
  return <p>Wait for MENACE's turn...</p>;
}
```

---

## File Locations

```
src/
├── store/
│   └── useGameStore.ts          ← Main store (USE THIS)
├── hooks/
│   └── useMenaceGame.ts         ← Old hook (can delete)
├── components/
│   ├── MatchboxVisualizer.tsx   ← Visualization example
│   └── ...
└── App.tsx                      ← Updated to use Zustand
```

---

## Quick Start Checklist

1. [ ] Import store: `import { useGameStore } from './store/useGameStore'`
2. [ ] Subscribe to state: `const board = useGameStore((state) => state.board)`
3. [ ] Use actions: `const humanMove = useGameStore((state) => state.humanMove)`
4. [ ] Test in DevTools: Open Redux DevTools extension
5. [ ] (Optional) Add `<MatchboxVisualizer />` to see MENACE's brain

**That's it! You're ready to build advanced visualizations.**

---

📚 Full docs: See `ZUSTAND_MIGRATION.md` and `REFACTORING_SUMMARY.md`
