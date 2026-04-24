# UNSCRIPTED — Master Plan

## Concept
You are not controlling a character. You are writing instructions that a machine executes.
The machine watches you, learns your patterns, and starts predicting — then hijacking — your next move.
Your only escape is to become unpredictable.

## Tech Stack
- **Phaser.js** (game rendering, scene, timers)
- **Vanilla JS** (state machine, prediction engine, UI)
- **Web Audio API** (procedural sound)
- No build step — single HTML entry point

## Architecture
```
state            — single source of truth (no external store)
createInitialState() — factory reset for restart
stepBeat()       — main game loop tick (timer-driven)
findPrediction() — Markov-chain n-gram predictor
renderHud()      — DOM sync (called after every state mutation)
UnscriptedScene  — Phaser scene (grid, player, FX)
```

## Phases Overview
| Phase | Name          | Key mechanic                              |
|-------|---------------|-------------------------------------------|
| 1     | Obedience     | Grid movement, shards, gates              |
| 2     | Observation   | Prediction visible, certainty builds      |
| 3     | Interference  | Input locks, queue corruption, trace mirrors |
| 4     | Rewrite       | Noise/Ghost/Overclock/Scramble unlocked   |
| 5     | Escape        | Breach open, walk off grid to win         |

## Level Design Goals
- Each level = a self-contained map + a specific challenge that teaches one mechanic
- Levels escalate: gates → trace tiles → interference → rewrite abilities → escape
- Final level forces the player to crash certainty to zero using all rewrite tools

## Polish Targets
- [ ] Glitch CSS animation on certainty spikes
- [ ] Phase transition screen flash + overlay message
- [ ] Win/ending sequence (freeze, glitch, "Prediction failed." full-screen)
- [ ] Keyboard shortcut display
- [ ] Mobile-friendly layout (secondary goal)
- [ ] Sound: mechanical tick accelerates with overclock

## Jam Submission Checklist
- [ ] All 5 phases functional end-to-end
- [ ] At least 3 distinct levels
- [ ] Ending sequence polished
- [ ] Deployed (itch.io or GitHub Pages)
- [ ] README / how-to-play
