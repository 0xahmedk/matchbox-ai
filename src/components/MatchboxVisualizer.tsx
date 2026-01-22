/**
 * MatchboxVisualizer Component
 * Demonstrates how to visualize MENACE's decision-making process
 * using the new Zustand store's activeBoxId and currentBeads
 */

import {
  Paper,
  Title,
  Text,
  Grid,
  Badge,
  Progress,
  Stack,
  Group,
} from "@mantine/core";
import { useGameStore } from "../store/useGameStore";

export function MatchboxVisualizer() {
  const activeBoxId = useGameStore((state) => state.activeBoxId);
  const currentBeads = useGameStore((state) => state.currentBeads);
  const isPlayerTurn = useGameStore((state) => state.isPlayerTurn);

  // Don't show until MENACE makes at least one move
  if (!currentBeads || !activeBoxId) {
    return (
      <Paper p="md" withBorder radius="md">
        <Stack gap="xs">
          <Title order={4} size="h5">
            MENACE's Brain
          </Title>
          <Text size="sm" c="dimmed">
            {isPlayerTurn
              ? "Waiting for your move..."
              : "MENACE is thinking..."}
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Calculate total beads and max for scaling
  const totalBeads = currentBeads.reduce((sum, count) => sum + count, 0);
  const maxBeads = Math.max(...currentBeads);

  return (
    <Paper p="md" withBorder radius="md" shadow="sm">
      <Stack gap="md">
        <div>
          <Title order={4} size="h5">
            MENACE's Brain
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Matchbox State: {activeBoxId.slice(0, 12)}...
          </Text>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Bead Distribution (Decision Weights)
          </Text>
          <Grid gutter="xs">
            {currentBeads.map((beadCount, index) => {
              const probability =
                totalBeads > 0
                  ? ((beadCount / totalBeads) * 100).toFixed(1)
                  : 0;

              return (
                <Grid.Col key={index} span={4}>
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Badge
                        size="sm"
                        variant={beadCount > 0 ? "filled" : "outline"}
                        color={beadCount === 0 ? "gray" : "blue"}
                      >
                        Pos {index}
                      </Badge>
                      <Text size="xs" fw={500}>
                        {beadCount}
                      </Text>
                    </Group>
                    <Progress
                      value={maxBeads > 0 ? (beadCount / maxBeads) * 100 : 0}
                      size="sm"
                      color={beadCount === 0 ? "gray" : "blue"}
                    />
                    <Text size="xs" c="dimmed" ta="center">
                      {probability}%
                    </Text>
                  </Stack>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>

        <Text size="xs" c="dimmed">
          💡 Higher bead count = Higher probability of MENACE choosing that
          position. Beads are added/removed based on wins/losses (reinforcement
          learning).
        </Text>
      </Stack>
    </Paper>
  );
}
