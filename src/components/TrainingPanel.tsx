import { Paper, Stack, Title, Text, Button, Group } from "@mantine/core";
import { InfoTooltip } from "./common/InfoTooltip";
import { useGameStore } from "../store/useGameStore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export function TrainingPanel() {
  const trainingStats = useGameStore((s) => s.trainingStats);
  const stats = useGameStore((s) => s.stats);
  const runSimulation = useGameStore((s) => s.runSimulation);
  const resetBrain = useGameStore((s) => s.resetBrain);

  const handleTrain50 = () => runSimulation(50);
  const handleTrain100 = () => runSimulation(100);
  const handleResetBrain = () => resetBrain();

  const handleTrain50Random = () => runSimulation(50, "RANDOM");
  const handleTrain50WinBlock = () => runSimulation(50, "WIN_BLOCK");
  const handleTrain50Self = () => runSimulation(50, "SELF");

  return (
    <Paper p="md" radius="md" shadow="sm" withBorder>
      <Stack gap="md">
        <Title order={4}>Training Panel</Title>
        <Text size="sm" c="dimmed">
          Use the controls below to train MENACE quickly against a random agent.
        </Text>

        <Group>
          <Button variant="outline" onClick={handleTrain50}>
            Train 50 Games
          </Button>
          <Button variant="outline" onClick={handleTrain100}>
            Train 100 Games
          </Button>
          <Button color="red" variant="light" onClick={handleResetBrain}>
            Reset Brain
          </Button>
        </Group>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          <Text size="sm">Curriculum</Text>
          <InfoTooltip label="Select a curriculum for training: Random, Smart (win/block), or Self-play." />
        </div>
        <Group>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Button variant="light" onClick={handleTrain50Random}>
              Train vs Random (Basic)
            </Button>
            <InfoTooltip label="Beginner Mode: MENACE plays against a 'blind' opponent. Good for filling empty boxes." />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Button variant="light" onClick={handleTrain50WinBlock}>
              Train vs Smart (Defense)
            </Button>
            <InfoTooltip label="Hard Mode: The opponent will block MENACE instantly. Forces MENACE to learn defense." />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Button variant="light" onClick={handleTrain50Self}>
              Train vs Self (Mastery)
            </Button>
            <InfoTooltip label="Expert Mode: MENACE plays against itself to find hidden weaknesses." />
          </div>
        </Group>

        <Text size="sm">Total Games Trained: {stats.gamesPlayed}</Text>

        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart
              data={trainingStats}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="generation"
                label={{
                  value: "Games Played",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="wins"
                stroke="#2ecc71"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="draws"
                stroke="#95a5a6"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="losses"
                stroke="#e74c3c"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Paper>
  );
}
