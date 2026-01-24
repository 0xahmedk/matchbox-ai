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
    <ScrollArea style={{ width: "100%" }} type="scroll" offsetScrollbars>
      <Box
        style={{
          display: "flex",
          gap: 12,
          padding: 12,
          alignItems: "center",
          overflowX: "auto",
          background: "#303b51",
          borderRadius: 8,
        }}
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
                    width: 44,
                    height: 4,
                    background: "rgba(255,255,255,0.18)",
                    marginLeft: 8,
                    marginRight: 8,
                    alignSelf: "center",
                    position: "relative",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: -10,
                      top: -8,
                      width: 0,
                      height: 0,
                      borderTop: "10px solid transparent",
                      borderBottom: "10px solid transparent",
                      borderLeft: "10px solid rgba(255,255,255,0.18)",
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
