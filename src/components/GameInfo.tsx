/**
 * GameInfo Component
 * Displays game status and current turn information
 */

import { Title, Box } from "@mantine/core";

interface GameInfoProps {
  isPlayerTurn: boolean;
  gameStatus: "PLAYING" | "WIN" | "LOSS" | "DRAW";
}

export function GameInfo({ isPlayerTurn, gameStatus }: GameInfoProps) {
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
