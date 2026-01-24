/**
 * Stats Component
 * Displays game statistics and MENACE learning progress
 */

import { Paper, Text, Title } from "@mantine/core";
import { InfoTooltip } from "./common/InfoTooltip";

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
    <div
      style={{
        marginTop: "1rem",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1rem",
        alignItems: "stretch",
      }}
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
        tooltip="Unique board positions MENACE has encountered. There are only ~304 unique states in Tic-Tac-Toe!"
        style={{ gridColumn: "1 / -1" }}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  subtitle?: string;
  tooltip?: string;
}

function StatCard({
  label,
  value,
  color,
  subtitle,
  tooltip,
  style,
}: StatCardProps & { style?: React.CSSProperties }) {
  return (
    <Paper p="md" withBorder style={{ textAlign: "center", ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        {tooltip ? <InfoTooltip label={tooltip} /> : null}
      </div>
      <Title c={color}>{value}</Title>
      {subtitle && (
        <Text size="xs" c="dimmed" mt="xs">
          {subtitle}
        </Text>
      )}
    </Paper>
  );
}
