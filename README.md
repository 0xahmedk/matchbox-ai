# Matchbox AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

**Matchbox AI** is a modern, interactive visualization of one of the earliest examples of Reinforcement Learning: **MENACE** (Machine Educable Noughts And Crosses Engine).

Originally built in 1961 by Donald Michie using 304 matchboxes and thousands of colored beads, this project brings that mechanical computer to life in the browser. It demonstrates how "dumb" objects can learn complex strategies through trial, error, and probability.

🔗 **[Live Demo](https://0xahmedk.github.io/matchbox-ai)** 

---

## 🧠 The Concept

Before AlphaGo or ChatGPT, there was **MENACE**.
Donald Michie proved that a pile of matchboxes could "learn" to play Tic-Tac-Toe without ever understanding the rules of the game.

### How it Works (The RL Mapping)
This engine maps Michie's physical components to modern Reinforcement Learning terms:

| The Physical Object | The AI Concept | The Digital Implementation |
| :--- | :--- | :--- |
| **Matchbox** | **State** | A canonical board configuration (reduced by symmetry). |
| **Colored Bead** | **Action** | A valid move (index 0-8) available in that state. |
| **Bead Count** | **Policy** | The probability distribution of choosing a move. |
| **Adding Beads** | **Reward** | Reinforcing a winning path (+3 beads). |
| **Removing Beads** | **Punishment** | Discouraging a losing path (-1 bead). |

---

## ✨ Features

### 1. Interactive Simulation
Unlike static diagrams, **Matchbox AI** lets you look inside the brain.
* **The Active Box:** Watch the engine identify the current board state.
* **Bead Animation:** See the probability "arm" reach into the box and select a move based on the current bead distribution.

### 2. The Warehouse (State Visualization)
Tic-Tac-Toe has thousands of permutations, but only **304 unique states** if you account for rotation and reflection.
* This app implements a **Symmetry Reduction Algorithm** to map every move to its "Canonical State."
* **Inspect Mode:** Browse the "Warehouse" of all 304 matchboxes to see which states MENACE has mastered (Gold) and which it has abandoned (Dusty).

### 3. Training Modes
* **Novice Mode:** Play against an untrained, random MENACE. Win easily.
* **Turbo Train:** Simulate 100, 500, or 1,000 games in seconds to watch the bead distributions converge.
* **Master Mode:** Try to defeat the fully trained engine (Spoiler: The best you can get is a Draw).

---

## 🛠️ Tech Stack & Architecture

* **Core:** React (SPA), TypeScript, Vite.
* **State Management:** Zustand .
* **Styling:** Mantine.
* **Key Algorithms:**
    * **Canonical State Reduction:** Reduces board space complexity by 90% using matrix rotations/reflections.
    * **Weighted Random Selection:** Simulates the physical "picking a bead" probability.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/matchbox-ai.git](https://github.com/0xahmedk/matchbox-ai.git)

# Navigate to the project folder
cd matchbox-ai

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```
<hr>
<div style="text-align:center;">Built with ❤️ by Ahmed</div>
