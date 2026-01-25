/**
 * GameInfo Component
 * Displays game status and current turn information
 */

import { Title, Box } from "@mantine/core";

interface GameInfoProps {
  isPlayerTurn: boolean;
  gameStatus: "PLAYING" | "WIN" | "LOSS" | "DRAW";
  board?: ("X" | "O" | null)[];
}

export function GameInfo({ isPlayerTurn, gameStatus, board }: GameInfoProps) {
  const isBoardEmpty = !board || board.every((c) => c === null);

  const getStatusMessage = () => {
    if (gameStatus === "WIN") {
      return {
        text: "You Win",
        color: "green",
      };
    }

    if (gameStatus === "LOSS") {
      return {
        text: "MENACE Wins",
        color: "red",
      };
    }

    if (gameStatus === "DRAW") {
      return {
        text: "Draw",
        color: "yellow",
      };
    }

    if (!isPlayerTurn) {
      return {
        text: "MENACE Thinking...",
        color: "gray",
      };
    }

    // If the board is empty and it's the player's turn, encourage starting
    if (isBoardEmpty) {
      return { text: "Start playing", color: "blue" };
    }

    return {
      text: "Your Turn",
      color: "blue",
    };
  };

  const status = getStatusMessage();

  return (
    <Box style={{ textAlign: "center", padding: "2rem 0" }}>
      <Title order={2} c={status.color}>
        {status.text}
      </Title>
    </Box>
  );
}
