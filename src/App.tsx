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
} from "@mantine/core";
import { RotateCcw, Plus, Minus } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import { Board } from "./components/Board";
import { GameInfo } from "./components/GameInfo";
import { Stats } from "./components/Stats";
import { MatchboxTape } from "./components/MatchboxTape";
import { TrainingPanel } from "./components/TrainingPanel";
import { Switch, Box as MantineBox } from "@mantine/core";
import { Bead } from "./components/Bead";
import { InfoTooltip } from "./components/common/InfoTooltip";

function App() {
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
      {/* Header */}
      <Box
        component="header"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-4)",
          padding: "1rem 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container
          size="lg"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <img
            src="/menace_logo.png"
            alt="MENACE Logo"
            style={{ width: 40, height: 40 }}
          />
          <Title
            order={1}
            fw={300}
            className="app-title"
            style={{ letterSpacing: "0.05em" }}
          >
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
              history of machine learning. Built in 1961 by Donald Michie, a
              code-breaker who once worked with Alan Turing, MENACE proves that
              learning doesn't require fancy hardware or complicated math. It
              just needs a way to try things, remember what worked, and avoid
              what didn't.
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
              fortune. Donald Michie wanted to show a machine could learn, but
              he didn't have a computer to spare. So he built one out of 304
              matchboxes and thousands of colored beads. He then played this
              pile of boxes against humans and the strange thing happened: after
              many games the boxes started winning.
            </Text>

            <Image
              src="/assets/menace2.svg"
              alt="MENACE historic diagram"
              fit="contain"
              radius="md"
              style={{ maxWidth: 400, margin: "0 auto" }}
              mt={"1rem"}
            />
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
              particular Tic‑Tac‑Toe board layout (for example: X in the top
              left, O in the center). There are many possible layouts, so Michie
              used hundreds of boxes.
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
              Play proceeds exactly like a normal Tic‑Tac‑Toe game. For every
              turn MENACE makes, we record the box and the bead it chose. At the
              end of the game we reward or punish the moves based on the
              outcome:
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
            <Image
              src="/assets/menace1.png"
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
              demonstration of reinforcement learning the same family of ideas
              that powers modern systems like AlphaGo or ChatGPT. The core
              recipe is identical: try actions, observe a reward, and update
              future preferences. The difference is scale and speed. Today we
              store probabilities in arrays and update them with math on silicon
              instead of plastic beads, but the learning story is the same.
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
        <Container
          size="lg"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <img
            src="/menace_logo.png"
            alt="MENACE Logo"
            style={{ width: 20, height: 20 }}
          />
          <Text size="sm" c="dimmed" ta="center">
            Built with ❤️ by Ahmed
          </Text>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
