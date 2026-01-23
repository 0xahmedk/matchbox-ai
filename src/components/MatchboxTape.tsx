import React from "react";
import { ScrollArea, Box, Text } from "@mantine/core";
import { useGameStore } from "../store/useGameStore";
import { Matchbox } from "./Matchbox";

/**
 * MatchboxTape
 * Horizontal scrollable list of matchboxes used in the current game history.
 */
export function MatchboxTape() {
  const history = useGameStore((s) => s.history);

  if (!history || history.length === 0) {
    return (
      <Box p="md">
        <Text c="dimmed">
          No matchbox history yet. Play a move to record steps.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollArea style={{ width: "100%" }} type="auto" offsetScrollbars>
      <Box
        style={{ display: "flex", gap: 12, padding: 12, alignItems: "center" }}
      >
        {history.map((h, idx) => {
          // Compute turn number from board snapshot: number of non-null squares indicates moves played
          const boardSnapshot = h.boardSnapshot || [];
          const movesPlayed = boardSnapshot.filter((s) => s !== null).length;
          const turnNumber = movesPlayed + 1; // MENACE plays after the boardSnapshot
          const label = `Turn ${turnNumber}`;

          const isLast = idx === history.length - 1;
          return (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Matchbox
                  beadCounts={h.boxSnapshot ? h.boxSnapshot : Array(9).fill(0)}
                  label={label}
                  isActive={isLast}
                  highlightMove={h.moveIndex}
                  rotation={h.transformIndex ?? 0}
                />
              </div>
              {/* Draw arrow between boxes except after last */}
              {idx < history.length - 1 && (
                <div
                  style={{
                    width: 28,
                    height: 2,
                    background: "rgba(0,0,0,0.12)",
                    marginLeft: 6,
                    marginRight: 6,
                    alignSelf: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: -6,
                      top: -6,
                      width: 0,
                      height: 0,
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                      borderLeft: "8px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </ScrollArea>
  );
}

export default MatchboxTape;
