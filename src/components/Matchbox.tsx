/**
 * Matchbox Component
 * Visual representation of a MENACE matchbox with beads
 *
 * Renders a 3x3 grid showing bead counts for each position,
 * styled to look like a physical matchbox sitting on a table
 */

/**
 * Matchbox Component
 * Visual representation: yellow sleeve (#F59F00) with a white drawer and 3x3 bead grid.
 */

import type { CSSProperties } from "react";
import { Paper, SimpleGrid, Box, Text, Tooltip } from "@mantine/core";
import { TRANSFORMATIONS } from "../engine/symmetry";

interface MatchboxProps {
  beadCounts: number[];
  highlightMove?: number | null;
  label?: string;
  isActive?: boolean;
  rotation?: number; // transform index 0-7 that maps canonical->actual
}

const styles: Record<string, CSSProperties> = {
  sleeve: {
    background: "#F59F00",
    borderRadius: 8,
    padding: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    minWidth: 220,
    display: "inline-block",
  },
  drawer: {
    background: "#ffffff",
    borderRadius: 6,
    padding: 8,
  },
  label: {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  cell: {
    minHeight: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeGlow: {
    boxShadow: "0 0 18px 6px rgba(255, 215, 0, 0.28)",
    borderRadius: 6,
  },
};

// 9 distinct colors for positions 0..8
const BEAD_COLORS = [
  "#e53935", // red
  "#1e88e5", // blue
  "#43a047", // green
  "#fdd835", // yellow
  "#8e24aa", // purple
  "#00bcd4", // cyan
  "#fb8c00", // orange
  "#ff4081", // pink
  "#00897b", // teal
];

export function Matchbox({
  beadCounts,
  highlightMove = null,
  label,
  isActive = false,
  rotation = 0,
}: MatchboxProps) {
  if (!beadCounts || beadCounts.length !== 9) {
    return null;
  }

  // If a rotation is provided it means beadCounts are canonical and must be mapped to actual view
  // We'll map canonical index -> actual index via symmetry transforms (inverse of transform)
  // To avoid importing engine code into UI directly, we can implement the rotation mapping for 0-7 here.

  // Use the authoritative TRANSFORMATIONS exported from engine/symmetry
  const transformFn = TRANSFORMATIONS[rotation] || TRANSFORMATIONS[0];

  const actualBeads = Array(9).fill(0);
  for (let c = 0; c < 9; c++) {
    // transformFn maps actualIndex -> canonicalIndex, we need canonical->actual
    // find actual index i such that transformFn(i) === c
    let actualIdx = 0;
    for (let i = 0; i < 9; i++) {
      if (transformFn(i) === c) {
        actualIdx = i;
        break;
      }
    }
    actualBeads[actualIdx] = beadCounts[c];
  }

  const totalBeads = actualBeads.reduce((s, n) => s + Math.max(0, n), 0);

  const sleeveStyle: CSSProperties = isActive
    ? { ...styles.sleeve, ...styles.activeGlow }
    : styles.sleeve;

  return (
    <div style={sleeveStyle}>
      {label && <div style={styles.label}>{label}</div>}

      <Paper style={styles.drawer} radius="sm" withBorder>
        <SimpleGrid cols={3} spacing="xs">
          {actualBeads.map((count, idx) => {
            const color = BEAD_COLORS[idx % BEAD_COLORS.length];
            const percent =
              totalBeads > 0 ? Math.round((count / totalBeads) * 100) : 0;
            const tooltip = `Index ${idx}: ${count} Bead${count === 1 ? "" : "s"} (${percent}% Prob)`;

            // Determine if this actual index corresponds to the highlighted canonical index
            let isHighlighted = false;
            if (highlightMove !== null && highlightMove !== undefined) {
              // find actual index corresponding to this canonical highlightMove
              let highlightedActual = -1;
              for (let i = 0; i < 9; i++) {
                if (transformFn(i) === highlightMove) {
                  highlightedActual = i;
                  break;
                }
              }
              isHighlighted = highlightedActual === idx;
            }

            return (
              <Tooltip label={tooltip} key={idx} position="top" withArrow>
                <Box
                  style={{
                    ...styles.cell,
                    border: isHighlighted ? `2px solid ${color}` : undefined,
                    borderRadius: 6,
                    background: isHighlighted ? "rgba(0,0,0,0.02)" : undefined,
                  }}
                >
                  {count <= 0 ? (
                    <Text size="xs" color="dimmed">
                      Empty
                    </Text>
                  ) : (
                    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden>
                      <circle
                        cx={20}
                        cy={20}
                        r={12}
                        fill={color}
                        stroke="rgba(0,0,0,0.12)"
                      />
                      {count > 1 && (
                        <text
                          x="50%"
                          y="52%"
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={700}
                          fill="#fff"
                        >
                          {count > 99 ? "+99" : String(count)}
                        </text>
                      )}
                    </svg>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </Paper>
    </div>
  );
}

export default Matchbox;
