import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  Divider,
  Grid,
} from "@mantine/core";
import { RotateCcw } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import { Board } from "./components/Board";
import { GameInfo } from "./components/GameInfo";
import { Stats } from "./components/Stats";
import { BrainPanel } from "./components/BrainPanel";

function App() {
  // Using Zustand store with selective subscriptions for optimal re-renders
  const board = useGameStore((state) => state.board);
  const isPlayerTurn = useGameStore((state) => state.isPlayerTurn);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const stats = useGameStore((state) => state.stats);
  const humanMove = useGameStore((state) => state.humanMove);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <Box
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box
        component="header"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-4)",
          padding: "1.5rem 0",
        }}
      >
        <Container size="lg">
          <Title order={1} fw={300} style={{ letterSpacing: "0.05em" }}>
            Matchbox AI
          </Title>
        </Container>
      </Box>

      {/* Main Game Section */}
      <Box component="main" style={{ flex: 1, padding: "3rem 0" }}>
        <Container size="xl">
          <Stack gap="xl">
            <GameInfo isPlayerTurn={isPlayerTurn} gameStatus={gameStatus} />

            {/* Game Board and Brain Panel Side-by-Side */}
            <Grid gutter="xl">
              {/* Left: Game Board */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md" align="center">
                  <Board
                    squares={board}
                    onClick={humanMove}
                    disabled={!isPlayerTurn || gameStatus !== "PLAYING"}
                  />

                  <Button
                    onClick={resetGame}
                    leftSection={<RotateCcw size={18} />}
                    variant="light"
                    size="md"
                  >
                    New Game
                  </Button>
                </Stack>
              </Grid.Col>

              {/* Right: MENACE Brain Visualization */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <BrainPanel />
              </Grid.Col>
            </Grid>

            <Stats stats={stats} />
          </Stack>
        </Container>

        <Divider my="xl" />

        {/* Blog Section Placeholder */}
        <Container size="sm">
          <Stack gap="md">
            <Title order={2} size="h3" fw={400}>
              About MENACE
            </Title>
            <Text c="dimmed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Text>
            <Text c="dimmed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        style={{
          borderTop: "1px solid var(--mantine-color-dark-4)",
          padding: "1.5rem 0",
        }}
      >
        <Container size="lg">
          <Text size="sm" c="dimmed" ta="center">
            Built by Ahmed Khan
          </Text>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
