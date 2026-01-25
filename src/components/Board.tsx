/**
 * Board Component
 * Renders a 3x3 Tic-Tac-Toe grid with fixed square cells
 * Mobile-first responsive design with perfect square aspect ratio
 */

import { Box, Grid, UnstyledButton, Text } from "@mantine/core";
import type { Board as BoardType } from "../engine";

interface BoardProps {
  squares: BoardType;
  onClick: (index: number) => void;
  disabled?: boolean;
}

export function Board({ squares, onClick, disabled = false }: BoardProps) {
  return (
    <Box w={{ base: "100%", sm: 400 }} mx="auto" style={{ aspectRatio: "1/1" }}>
      <Grid
        gutter="md"
        style={{
          height: "100%",
        }}
      >
        {squares.map((square, index) => (
          <Grid.Col key={index} span={4} style={{ aspectRatio: "1/1" }}>
            <UnstyledButton
              onClick={() => onClick(index)}
              disabled={disabled || square !== null}
              style={(theme) => ({
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  square === null
                    ? theme.colors.dark[6]
                    : square === "X"
                      ? theme.colors.blue[9]
                      : theme.colors.red[9],
                border: `2px solid ${
                  square === null
                    ? theme.colors.dark[4]
                    : square === "X"
                      ? theme.colors.blue[6]
                      : theme.colors.red[6]
                }`,
                borderRadius: theme.radius.md,
                cursor: disabled || square !== null ? "not-allowed" : "pointer",
                opacity: disabled && square === null ? 0.5 : 1,
                transition: "all 150ms ease",
                "&:hover":
                  disabled || square !== null
                    ? {}
                    : {
                        backgroundColor: theme.colors.dark[5],
                        transform: "scale(1.02)",
                      },
              })}
            >
              {square && (
                <Text
                  fz={{ base: "3rem", sm: "4rem" }}
                  fw={700}
                  c={square === "X" ? "blue.3" : "red.3"}
                >
                  {square}
                </Text>
              )}
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
}
