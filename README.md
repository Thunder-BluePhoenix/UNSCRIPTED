# UNSCRIPTED // CTRL ESCAPE

> You are not controlling a character. You are writing instructions that a machine executes. The machine learns you. Then it rewrites you.

A browser-based tactical puzzle game built for a 13-day game jam using Phaser 3 and vanilla JS.

---

## Play

```bash
npm install
npx serve .
```

Open `http://localhost:3000` in your browser. No build step required.

---

## How It Works

You queue movement instructions (MOVE, TURN LEFT, TURN RIGHT, WAIT) for a machine to execute on a beat timer. As the machine observes your patterns, it builds a behavioral profile and begins to predict your next command.

When it gets confident enough, it starts fighting back:

- **Locking** inputs it predicts you'll use
- **Injecting** its own commands into your queue
- **Corrupting** your instructions mid-execution

Your goal: escape the grid boundary before the machine fully models you.

---

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| A / ← | Turn left |
| D / → | Turn right |
| S / ↓ | Wait |
| Backspace | Delete last queued instruction |
| 1 | Noise Injection (scrambles machine profile) |
| 2 | Ghost Walk (pass through walls) |
| 3 | Overclock (double execution speed) |
| 4 / Q | Scramble Queue (randomize your queue) |
| ? | Reopen user guide |

---

## Phases

| Phase | Name | What Happens |
|-------|------|--------------|
| 1 | Obedience | Free movement, machine watching silently |
| 2 | Observation | Machine starts predicting your moves |
| 3 | Interference | Input locks and queue corruption begin |
| 4 | Rewrite | You unlock hack tools to fight back |
| 5 | Escape | Breach the containment — walk off the grid |

---

## Tile Legend

| Tile | Name | Effect |
|------|------|--------|
| O | Observer | Activates machine profiling (Phase 2) |
| R | Rewrite Terminal | Unlocks the hack panel (Phase 4) |
| T | Trace Scanner | Spikes machine certainty on contact |
| G | Gate | Teleports to linked gate |
| M | Memory Shard | Fuel for rewrite abilities |

---

## Levels

| # | Name | Notes |
|---|------|-------|
| 1 | Initialization | Tutorial — open map, no trace tiles |
| 2 | Surveillance | Split map, trace-guarded corridor, gate shortcut |
| 3 | Maze Protocol | H-shaped layout, trace tiles flank inner rooms |
| 4 | Zero Day | Starts at Phase 4, elevated certainty, all tools live |
| 5 | Final Protocol | All mechanics, full run |

---

## Tech Stack

- **[Phaser 3](https://phaser.io/)** — game renderer and scene management
- **Web Audio API** — procedural sound (tick, glitch, shard, gate, win tones)
- **Vanilla JS (ES modules)** — game logic, Markov n-gram predictor, state machine
- **CSS** — single-page layout, CRT scanline overlay, animations

---

## Project Structure

```
UNSCRIPTED/
├── index.html          # Shell, HUD panels, overlay screens
├── styles.css          # All styling — layout, animations, CRT filter
├── src/
│   └── main.js         # Game logic, Phaser scene, level system
├── docs/
│   ├── plan.md         # Design spec
│   ├── tracker.md      # Dev progress tracker
│   ├── phase1.md … phase5.md
│   └── motto.md
└── node_modules/
    └── phaser/
```

---

## License

MIT — do whatever you want with it.
