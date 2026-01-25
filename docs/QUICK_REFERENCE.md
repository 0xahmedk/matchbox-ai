# ⚡ Quick Reference: Zustand Store

## Import & Basic Usage

```typescript
import { useGameStore, menaceAgent } from "./store/useGameStore";

// In your component
const board = useGameStore((state) => state.board);
const humanMove = useGameStore((state) => state.humanMove);
```

... (content preserved)
