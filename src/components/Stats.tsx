/**
 * Stats Component
 * Displays game statistics and MENACE learning progress
 */

import { SimpleGrid, Paper, Text, Title } from "@mantine/core";

interface StatsProps {
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    statesLearned: number;
  };
}

export function Stats({ stats }: StatsProps) {
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 5 }}
      spacing="md"
      style={{ marginTop: "2rem" }}
    >
      <StatCard label="Games" value={stats.gamesPlayed} color="gray" />
      <StatCard label="Wins" value={stats.wins} color="green" />
      <StatCard label="Losses" value={stats.losses} color="red" />
      <StatCard label="Draws" value={stats.draws} color="yellow" />
      <StatCard
        label="States Learned"
        value={stats.statesLearned}
        color="violet"
        subtitle="~304 max"
      />
    </SimpleGrid>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  subtitle?: string;
}

function StatCard({ label, value, color, subtitle }: StatCardProps) {
  return (
    <Paper p="md" withBorder style={{ textAlign: "center" }}>
      <Text size="sm" c="dimmed" mb="xs">
        {label}
      </Text>
      <Title order={2} c={color}>
        {value}
      </Title>
      {subtitle && (
        <Text size="xs" c="dimmed" mt="xs">
          {subtitle}
        </Text>
      )}
    </Paper>
  );
}
