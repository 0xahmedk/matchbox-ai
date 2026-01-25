import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  Divider,
  Grid,
  Image,
  Alert,
  Anchor,
} from "@mantine/core";
import { RotateCcw, Plus, Minus, Info } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import { Board } from "./components/Board";
import { GameInfo } from "./components/GameInfo";
import { Stats } from "./components/Stats";
import { MatchboxTape } from "./components/MatchboxTape";
import { TrainingPanel } from "./components/TrainingPanel";
import { Switch, Box as MantineBox } from "@mantine/core";
import { Bead } from "./components/Bead";
import { InfoTooltip } from "./components/common/InfoTooltip";
import { ViewCounter } from "./components/common/ViewCounter";
import menace2Svg from "./assets/menace2.svg";
import beadsOnBoard from "./assets/beads_on_board.png";
import menace1Png from "./assets/menace1.png";
import menace_logo from "./assets/menace_logo.png";

function App() {
  // Mobile warning state
  const [showMobileWarning, setShowMobileWarning] = useState(true);

  // Using Zustand store with selective subscriptions for optimal re-renders
  const board = useGameStore((state) => state.board);
  const isPlayerTurn = useGameStore((state) => state.isPlayerTurn);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const stats = useGameStore((state) => state.stats);
  const humanMove = useGameStore((state) => state.humanMove);
  const resetGame = useGameStore((state) => state.resetGame);
  const playStyle = useGameStore((s) => s.playStyle);
  const setPlayStyle = useGameStore((s) => s.setPlayStyle);

  return (
    <Box
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Mobile Warning Banner - Only visible on mobile */}
      {showMobileWarning && (
        <Alert
          icon={<Info size={16} />}
          title="Desktop Recommended"
          color="blue"
          withCloseButton
          onClose={() => setShowMobileWarning(false)}
          hiddenFrom="sm"
          styles={{
            root: { borderRadius: 0 },
          }}
        >
          For the best educational experience, please use the desktop version.
        </Alert>
      )}

      {/* Header */}
      <Box
        component="header"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-4)",
          padding: "1rem 0",
        }}
      >
        <Container size="lg">
          <Stack gap="md">
            {/* Mobile: Stacked vertically, centered */}
            <Box hiddenFrom="sm">
              <Stack gap="md" align="center">
                <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Image
                    src={menace_logo}
                    alt="MENACE Logo"
                    style={{ width: 28, height: 28 }}
                  />
                  <Title
                    order={1}
                    fw={300}
                    fz="h3"
                    className="app-title"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    MENACE
                  </Title>
                </Box>

                {/* Social Icons - Mobile */}
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text size="xs" c="dimmed">
                    find Ahmed here 👉
                  </Text>
                  <Box style={{ display: "flex", gap: 12 }}>
                    <a
                      href="https://github.com/0xahmedk"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      style={{ color: "inherit" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M12 .297a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0012 .297z" />
                      </svg>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/0xahmedkhan"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      style={{ color: "inherit" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.49 6S0 4.88 0 3.5 1.12 1 2.49 1s2.49 1.12 2.49 2.5zM.22 8h4.54V24H.22zM8.98 8h4.36v2.2h.06c.61-1.16 2.1-2.4 4.33-2.4 4.63 0 5.48 3.05 5.48 7.02V24h-4.54v-7.07c0-1.69-.03-3.86-2.36-3.86-2.37 0-2.73 1.85-2.73 3.75V24H8.98V8z" />
                      </svg>
                    </a>

                    <a
                      href="https://www.instagram.com/0xahmedk"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      style={{ color: "inherit" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm8 1.5a1.25 1.25 0 11-.001 2.501A1.25 1.25 0 0115 5.5zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                      </svg>
                    </a>

                    <a
                      href="https://medium.com/@0xahmedkhan"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Medium"
                      style={{ color: "inherit" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M2 6.5v11L8 12l-6-5.5zM10 6.5l6.5 11H22V6.5H10zM10 6.5h12" />
                      </svg>
                    </a>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Desktop/Tablet: space-between layout */}
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              visibleFrom="sm"
            >
              <Box style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image
                  src={menace_logo}
                  alt="MENACE Logo"
                  style={{ width: 28, height: 28 }}
                />
                <Title
                  order={1}
                  fw={300}
                  fz="h1"
                  className="app-title"
                  style={{ letterSpacing: "0.05em" }}
                >
                  MENACE
                </Title>
              </Box>

              {/* Social Icons - Desktop/Tablet */}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text size="xs" c="dimmed">
                  find Ahmed here 👉
                </Text>
                <Box style={{ display: "flex", gap: 12 }}>
                  <a
                    href="https://github.com/0xahmedk"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    style={{ color: "inherit" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: 20, height: 20 }}
                    >
                      <path d="M12 .297a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0012 .297z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/0xahmedkhan"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    style={{ color: "inherit" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: 20, height: 20 }}
                    >
                      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.49 6S0 4.88 0 3.5 1.12 1 2.49 1s2.49 1.12 2.49 2.5zM.22 8h4.54V24H.22zM8.98 8h4.36v2.2h.06c.61-1.16 2.1-2.4 4.33-2.4 4.63 0 5.48 3.05 5.48 7.02V24h-4.54v-7.07c0-1.69-.03-3.86-2.36-3.86-2.37 0-2.73 1.85-2.73 3.75V24H8.98V8z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.instagram.com/0xahmedk"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    style={{ color: "inherit" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: 20, height: 20 }}
                    >
                      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm8 1.5a1.25 1.25 0 11-.001 2.501A1.25 1.25 0 0115 5.5zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                    </svg>
                  </a>

                  <a
                    href="https://medium.com/@0xahmedkhan"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Medium"
                    style={{ color: "inherit" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: 20, height: 20 }}
                    >
                      <path d="M2 6.5v11L8 12l-6-5.5zM10 6.5l6.5 11H22V6.5H10zM10 6.5h12" />
                    </svg>
                  </a>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Game Section */}
      <Box component="main" style={{ flex: 1, padding: "3rem 0" }}>
        <Container size="xl">
          <Stack gap="xl">
            <GameInfo
              isPlayerTurn={isPlayerTurn}
              gameStatus={gameStatus}
              board={board}
            />

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

                  <MantineBox
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Switch
                        checked={playStyle === "MASTER"}
                        onChange={(e) =>
                          setPlayStyle(
                            e.currentTarget.checked
                              ? "MASTER"
                              : "PROBABILISTIC",
                          )
                        }
                        size="md"
                        label={
                          playStyle === "MASTER"
                            ? "Master Mode"
                            : "Probabilistic"
                        }
                      />
                      <InfoTooltip label="Probabilistic: MENACE picks beads randomly based on count. Master Mode: MENACE picks the move with most beads." />
                    </div>
                  </MantineBox>
                  <div style={{ width: "100%", marginTop: 12 }}>
                    <Stats stats={stats} />
                  </div>
                </Stack>
              </Grid.Col>

              {/* Right: MENACE Brain Visualization */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                {/* Replaced BrainPanel with MatchboxTape that shows the sequence of matchboxes used */}
                <MatchboxTape />
                <div style={{ marginTop: 16 }}>
                  <TrainingPanel />
                </div>
              </Grid.Col>
            </Grid>
            {/* Stats moved into left column underneath the Master/Prob switch for closer context */}
          </Stack>
        </Container>

        <Divider my="xl" />

        {/* Blog Section: MENACE explainer for beginners (improved typography) */}
        <Container size="md">
          <Stack gap="md">
            <Title
              order={2}
              size="h3"
              fw={600}
              style={{
                fontSize: "1.65rem",
                color: "#2181d5",
                lineHeight: 1.15,
              }}
            >
              The Matchbox Mind: How a Pile of Boxes Outsmarted Humans (and
              Taught Us AI)
            </Title>
            <Text style={{ fontSize: "1.07rem", lineHeight: 1.7 }}>
              The Matchbox Educable Noughts And Crosses Engine (MENACE) is one
              of the most charming and surprisingly powerful experiments in the
              history of{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Machine_learning"
                target="_blank"
                rel="noopener noreferrer"
              >
                machine learning
              </Anchor>
              . Built in 1961 by{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Donald_Michie"
                target="_blank"
                rel="noopener noreferrer"
              >
                Donald Michie
              </Anchor>
              , a code-breaker who once worked with{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Alan_Turing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Alan Turing
              </Anchor>
              , MENACE proves that learning doesn't require fancy hardware or
              complicated math. It just needs a way to try things, remember what
              worked, and avoid what didn't.
            </Text>

            <Text
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#3aa3a0",
                marginTop: 8,
              }}
            >
              Why this was remarkable
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              Imagine it's 1961. Computers fill entire rooms and cost a small
              fortune.{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Donald_Michie"
                target="_blank"
                rel="noopener noreferrer"
              >
                Donald Michie
              </Anchor>{" "}
              wanted to show a machine could learn, but he didn't have a
              computer to spare. So he built one out of 304 matchboxes and
              thousands of colored beads. He then played this pile of boxes
              against humans and the strange thing happened: after many games
              the boxes started winning.
            </Text>

            <Image
              src={menace2Svg}
              alt="MENACE historic diagram"
              fit="contain"
              radius="md"
              style={{ maxWidth: 400, margin: "0 auto" }}
              mt={"1rem"}
            />
            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              <Text size="xs" c="dimmed" ta="center" mb={"xs"}>
                An example game played by MENACE (O) and a human (X) using beads
                of Michie's original colours, as MENACE lost this game, all the
                beads shown are removed from their respective boxes
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                Illustration — CC BY-SA 4.0.{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  License
                </a>{" "}
                •{" "}
                <a
                  href="https://commons.wikimedia.org/w/index.php?curid=133880740"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
              </Text>
            </div>
            <Text
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#2b7a78",
                marginTop: 8,
              }}
            >
              How it works the simple mechanics
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              - The Matchbox = the situation: each matchbox represents a
              particular{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Tic-tac-toe"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tic‑Tac‑Toe
              </Anchor>{" "}
              board layout (for example: X in the top left, O in the center).
              There are many possible layouts, so Michie used hundreds of boxes.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              - The Beads= the options: inside each box are colored beads. Each
              color stands for a legal move from that situation for example
              {"  "}
              <Bead color="#e74c3c" size={12} label={"Red"} /> means play the
              top row, while <Bead color="#3498db" size={12} label={"Blue"} />
              means play the center.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              - The Shake = the thinking: to choose a move, MENACE shakes the
              box and blindly pulls out a bead. If a color has more beads, it is
              more likely to be picked equivalent to a higher probability for
              that move.
            </Text>
            <Text
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#2b7a78",
                marginTop: 8,
              }}
            >
              How MENACE learns the magic
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              Play proceeds exactly like a normal{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Tic-tac-toe"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tic‑Tac‑Toe
              </Anchor>{" "}
              game. For every turn MENACE makes, we record the box and the bead
              it chose. At the end of the game we reward or punish the moves
              based on the outcome:
            </Text>

            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              - If MENACE wins: <Plus size={16} color="#2ecc71" /> we add bonus
              beads of the colors it used (for example, add 3 beads of each
              chosen color). That action becomes more likely next time.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              - If MENACE loses: <Minus size={16} color="#e74c3c" /> we remove
              the bead it used, making that move less likely in the future.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              Over many games the system self‑corrects. Bad moves lose beads
              until they rarely occur; good moves collect beads until they're
              nearly certain. The pile of matchboxes gradually transforms from a
              noisy random player into a near‑perfect strategist.
            </Text>

            {/* Deep-dive: Symmetry reduction and vanishing beads */}
            <Text
              style={{ fontSize: "1.03rem", lineHeight: 1.7, marginTop: 8 }}
            >
              A deeper look: how did Michie reduce thousands of possible boards
              to just 304 matchboxes, and why did "vanishing" beads matter? The
              trick is geometry and careful bookkeeping.{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Tic-tac-toe"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tic‑Tac‑Toe
              </Anchor>{" "}
              boards can be rotated and reflected in eight ways (four rotations,
              each with its mirror). Many board positions are the same once you
              spin or flip the board, a corner move on the top left is the same
              as a corner move on the top right after a reflection. Michie
              recognized these symmetries and treated any two boards that
              matched under rotation/reflection as a single canonical situation.
              That collapse of equivalent positions is why 19,683 naive
              permutations shrink down into about 304 unique canonical states.
            </Text>

            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              The other elegant idea was the use of "vanishing" beads. Rather
              than keeping a fixed probability table, MENACE physically removed
              beads when a sequence led to a loss. Removing a bead reduces the
              chance of repeating the exact same poor choice in the future it
              literally makes that option disappear more often from the shaken
              cup. Over repeated games, moves that consistently lead to losses
              can lose so many beads they effectively vanish, while winning
              moves accumulate beads and become dominant. Together, symmetry
              reduction and vanishing beads let a small, physical system
              generalize across many positions and converge quickly on robust
              play without any explicit programming of strategy.
            </Text>
            <div style={{ maxWidth: 380, margin: "0 auto", marginTop: 12 }}>
              <Image
                src={beadsOnBoard}
                alt="Beads on a matchbox board"
                fit="contain"
                radius="md"
              />
              <Text size="xs" c="dimmed" ta="center" mt={"xs"}>
                Close-up: colored beads arranged for a single matchbox state —
                vanishing beads are removed after losing games, changing the
                distribution over time.
              </Text>
            </div>

            <Text
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#2b7a78",
                marginTop: 8,
              }}
            >
              A single game cycle (quick walk‑through)
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              1) MENACE looks at the board, finds the matchbox for that
              position, and shakes it to pick a bead (a move).
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              2) The move is played. We record which bead (color) was chosen
              from which box.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              3) When the game ends, we reward or punish the recorded beads: +3
              beads when MENACE wins, remove the bead when it loses, and
              sometimes leave things unchanged for a draw.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.6 }}>
              4) Repeat. After hundreds of games the boxes are filled with the
              beads that led to wins and emptied of the ones that led to losses.
              The result: a low‑tech champion.
            </Text>

            <Image
              src={menace1Png}
              alt="MENACE demonstration photograph"
              fit="contain"
              radius="md"
              style={{ maxWidth: 400, margin: "0 auto", marginTop: 12 }}
            />
            <Text size="xs" c="dimmed" ta="center">
              Photograph of a MENACE-style matchbox machine.
            </Text>

            <Text
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#2b7a78",
                marginTop: 8,
              }}
            >
              Why this matters today
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              MENACE is not just a historical curiosity. It's a clear, physical
              demonstration of{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/Reinforcement_learning"
                target="_blank"
                rel="noopener noreferrer"
              >
                reinforcement learning
              </Anchor>{" "}
              the same family of ideas that powers modern systems like{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/AlphaGo"
                target="_blank"
                rel="noopener noreferrer"
              >
                AlphaGo
              </Anchor>{" "}
              or{" "}
              <Anchor
                href="https://en.wikipedia.org/wiki/ChatGPT"
                target="_blank"
                rel="noopener noreferrer"
              >
                ChatGPT
              </Anchor>
              . The core recipe is identical: try actions, observe a reward, and
              update future preferences. The difference is scale and speed.
              Today we store probabilities in arrays and update them with math
              on silicon instead of plastic beads, but the learning story is the
              same.
            </Text>
            <Text style={{ fontSize: "1.03rem", lineHeight: 1.7 }}>
              If you enjoyed this, take a look at the interactive demo in this
              project it's a digital re‑creation of MENACE that uses the same
              bead‑counting logic in code. It's delightful to watch a humble
              collection of matchboxes become a skilled opponent.
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
          <Stack gap="xs" align="center">
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Image
                src={menace_logo}
                alt="MENACE Logo"
                style={{ width: 20, height: 20 }}
              />
              <Text size="sm" c="dimmed">
                Built with ❤️ by Ahmed
              </Text>
            </Box>

            {/* View Counter */}
            <ViewCounter />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
