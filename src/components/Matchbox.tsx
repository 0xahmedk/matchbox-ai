/**
 * Matchbox Component
 * Visual representation of a MENACE matchbox with beads
 *
 * Renders a 3x3 grid showing bead counts for each position,
 * styled to look like a physical matchbox sitting on a table
 */

import { Paper, SimpleGrid, Box, Text, Group, Badge } from "@mantine/core";

interface MatchboxProps {
  beadCounts: number[];
  isLastMove?: boolean;
  label: string;
}

export function Matchbox({
  beadCounts,
  isLastMove = false,
  label,
}: MatchboxProps) {
  if (beadCounts.length !== 9) {
    console.error("Matchbox requires exactly 9 bead counts");
    return null;
  }

  return (
    <Paper
      p="xl"
      radius="lg"
      shadow="md"
      style={{
        backgroundColor: "var(--mantine-color-yellow-9)",
        border: "3px solid var(--mantine-color-yellow-7)",
        position: "relative",
        boxShadow: isLastMove
          ? "0 0 20px 5px rgba(250, 176, 5, 0.6)"
          : undefined,
        transition: "all 0.3s ease",
      }}
    >
      {/* Label at top */}
      <Box mb="md">
        <Text
          size="xs"
          fw={600}
          c="dark.9"
          style={{
            fontFamily: "monospace",
            letterSpacing: "0.5px",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </Box>

      {/* 3x3 Grid of Beads */}
      <SimpleGrid
        cols={3}
        spacing="xs"
        style={{
          maxWidth: 240,
          margin: "0 auto",
        }}
      >
        {beadCounts.map((count, index) => (
          <BeadCell key={index} count={count} position={index} />
        ))}
      </SimpleGrid>

      {/* Badge indicator if this is the last move */}
      {isLastMove && (
        <Badge
          size="xs"
          color="red"
          variant="filled"
          style={{
            position: "absolute",
            top: -8,
            right: -8,
          }}
        >
          ACTIVE
        </Badge>
      )}
    </Paper>
  );
}

/**
 * Individual cell showing beads for one position
 */
interface BeadCellProps {
  count: number;
  position: number;
}

function BeadCell({ count, position }: BeadCellProps) {
  // Calculate how many beads to show visually
  const maxVisibleBeads = 5;
  const visibleBeads = Math.min(count, maxVisibleBeads);
  const hasOverflow = count > maxVisibleBeads;
  const overflow = count - maxVisibleBeads;

  return (
    <Paper
      p="sm"
      radius="md"
      shadow="xs"
      style={{
        backgroundColor: "var(--mantine-color-gray-1)",
        border: "2px solid var(--mantine-color-gray-3)",
        minHeight: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        position: "relative",
      }}
    >
      {/* Position label */}
      <Text
        size="xs"
        c="dimmed"
        fw={700}
        style={{
          position: "absolute",
          top: 2,
          left: 4,
          fontSize: 9,
        }}
      >
        {position}
      </Text>

      {/* Beads visualization */}
      {count === 0 ? (
        <Text size="xs" c="dimmed" fw={500}>
          Empty
        </Text>
      ) : (
        <Box style={{ textAlign: "center" }}>
          {/* Visual beads as colored circles */}
          <Group gap={2} justify="center" wrap="wrap" style={{ maxWidth: 50 }}>
            {Array.from({ length: visibleBeads }).map((_, i) => (
              <Bead key={i} index={i} />
            ))}
          </Group>

          {/* Count text */}
          <Text size="xs" fw={700} c="dark.7" mt={4} style={{ fontSize: 11 }}>
            {hasOverflow ? `5+${overflow}` : count}
          </Text>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Individual bead - small colored circle
 */
function Bead({ index }: { index: number }) {
  // Vary colors slightly for visual interest
  const colors = [
    "var(--mantine-color-red-6)",
    "var(--mantine-color-red-7)",
    "var(--mantine-color-orange-6)",
    "var(--mantine-color-red-5)",
    "var(--mantine-color-pink-6)",
  ];

  const color = colors[index % colors.length];

  return (
    <Box
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        border: "1px solid rgba(0, 0, 0, 0.2)",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
      }}
    />
  );
}
