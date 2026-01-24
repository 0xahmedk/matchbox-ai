/**
 * WinBlockAgent
 *
 * Simple agent that will: 1) take a winning move if available, 2) block
 * the opponent's immediate winning move, or 3) play a random valid move.
 */
import type { Board, Player } from "./types";
import { checkWinner, getValidMoves, makeMove } from "./gameUtils";

export class WinBlockAgent {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * Return a move index for the current board.
   * Priority:
   * 1. Win in 1 move
   * 2. Block opponent winning in 1 move
   * 3. Random valid move
   */
  getCommand(board: Board): number {
    const valid = getValidMoves(board);

    if (valid.length === 0) {
      throw new Error("No valid moves available");
    }

    const opponent: Player = this.player === "X" ? "O" : "X";

    // 1) Can we win in one move?
    for (const mv of valid) {
      const next = makeMove(board, mv, this.player);
      const w = checkWinner(next);
      if (w === this.player) return mv;
    }

    // 2) Can opponent win in one move? Block it.
    for (const mv of valid) {
      const next = makeMove(board, mv, opponent);
      const w = checkWinner(next);
      if (w === opponent) return mv;
    }

    // 3) Otherwise random
    return valid[Math.floor(Math.random() * valid.length)];
  }
}
