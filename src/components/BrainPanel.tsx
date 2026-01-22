/**
 * BrainPanel Component
 * Displays MENACE's "brain" - the current matchbox being used
 *
 * Shows the active matchbox with bead distribution and provides
 * context about MENACE's decision-making process
 */

import {
  Paper,
  Stack,
  Title,
  Text,
  Box,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { Brain, Sparkles } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { Matchbox } from "./Matchbox";

export function BrainPanel() {
  const activeBoxId = useGameStore((state) => state.activeBoxId);
  const currentBeads = useGameStore((state) => state.currentBeads);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isPlayerTurn = useGameStore((state) => state.isPlayerTurn);

  // Waiting state - game just started or ended
  if (!activeBoxId || !currentBeads) {
    return (
      <Paper
        p="xl"
        radius="md"
        withBorder
        style={{
          backgroundColor: "var(--mantine-color-dark-6)",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon
            size={80}
            radius="xl"
            variant="light"
            color="gray"
            style={{ opacity: 0.5 }}
          >
            <Brain size={40} />
          </ThemeIcon>
          <Title order={4} c="dimmed" ta="center">
            {gameStatus !== "PLAYING"
              ? "Game Over"
              : isPlayerTurn
                ? "Waiting for your move..."
                : "MENACE is analyzing..."}
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            {gameStatus !== "PLAYING"
              ? "Start a new game to see MENACE's brain in action"
              : "The matchbox will appear when MENACE makes a decision"}
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Active state - showing the current matchbox
  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        backgroundColor: "var(--mantine-color-dark-6)",
      }}
    >
      <Stack gap="lg">
        {/* Header */}
        <Box>
          <Group gap="sm" mb="xs">
            <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
              <Sparkles size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">
              MENACE's Brain State
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            MENACE found this matchbox matching the board. It's shaking the box
            to pick a bead randomly based on their quantities...
          </Text>
        </Box>

        {/* The Matchbox */}
        <Box style={{ display: "flex", justifyContent: "center" }}>
          <Matchbox
            beadCounts={currentBeads}
            isLastMove={true}
            label={`State: ${activeBoxId.slice(0, 9)}`}
          />
        </Box>

        {/* Explanation */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: "var(--mantine-color-dark-5)",
          }}
        >
          <Stack gap="xs">
            <Text size="sm" fw={600} c="yellow.4">
              How it works:
            </Text>
            <Text size="xs" c="dimmed">
              • Each number represents beads in that position (0-8)
            </Text>
            <Text size="xs" c="dimmed">
              • More beads = Higher probability of choosing that move
            </Text>
            <Text size="xs" c="dimmed">
              • Wins add beads (reward) • Losses remove beads (punishment)
            </Text>
            <Text size="xs" c="dimmed">
              • Empty cells mean that position is already occupied or learned to
              avoid
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
