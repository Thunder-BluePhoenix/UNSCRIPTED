# UNSCRIPTED — Dev Tracker

## Status: MVP Complete — Polishing + Levels Phase

---

## Completed ✅
- [x] Phaser scene setup (grid, player sprite, FX layer)
- [x] Instruction queue (enqueue, execute, delete)
- [x] Grid movement with wall collision
- [x] Memory shard collection
- [x] Gate teleportation (linked pairs)
- [x] Beat timer (760ms loop)
- [x] Markov n-gram prediction engine (3-gram → 2-gram → 1-gram → frequency)
- [x] Certainty meter (fills on predicted match, drops on miss)
- [x] Input lock system (blocks predicted command)
- [x] System injection (auto-inserts predicted command into queue)
- [x] Queue corruption (mutates player commands at high certainty)
- [x] Trace tile effects (certainty spike + mirror inject)
- [x] Rewrite panel (Noise, Ghost Walk, Overclock, Scramble)
- [x] Breach condition (certainty=0, 3 consecutive failures)
- [x] Escape win condition (walk off grid boundary)
- [x] Web Audio API (tick, glitch, shard, gate, win tones)
- [x] Glitch CSS pulse on screen
- [x] System log (7 lines, newest first)
- [x] Restart button + state reset
- [x] Keyboard controls (WASD + arrows, Backspace, Q)

---

## In Progress 🔄
- (nothing — all core systems complete)

---

## Backlog — Polish 🎨

### Feel / Juice
- [x] Phase announcement overlay — full-screen flash with phase name + desc
- [x] Ending sequence: screen freeze → hard glitch → typewriter "PREDICTION FAILED." → "Move freely."
- [x] `"SYSTEM OFFLINE"` CSS state dims all HUD panels after escape
- [x] Certainty meter color shift (green → yellow → red)
- [x] Cooldown visual countdown on rewrite buttons (number ticks down)
- [x] Locked input red border pulse instead of plain `disabled`
- [x] Corruption flash animation on queue items when mutated
- [x] Profile panel glitch animation when Noise or Scramble fires
- [x] Prediction panel blink animation when locked input changes
- [x] Scanline / CRT filter overlay (CSS) — green tinted scanlines + vignette
- [x] Screen shake on queue corruption (Phaser camera shake)

### Onboarding
- [x] Tile legend overlay at game start — explains `O`, `R`, `T`, `G`, `M` + all keybinds
- [x] `?` key reopens the legend at any time
- [x] First-run tooltip sequence: shows on first approach to O, R, T, G, M — auto-dismisses after 3.2s

### Machine Profile Panel
- [x] Live command frequency bars (`MOVE ████ 60%`)
- [x] Updates every tick
- [x] Glitch animation when Noise or Scramble fires

### Controls
- [x] Keys `1` `2` `3` `4` mapped to Noise / Ghost / Overclock / Scramble
- [x] Key labels shown on rewrite buttons

### Balance
- [x] First Scramble is free — subsequent uses cost 1 shard
- [x] Certainty gain/loss now logged with delta amount (e.g. `certainty +14`)
- [x] Trace tile warning: adjacent floor tiles show dim red pulse
- [x] Mobile layout — viewport-first stacking, scrollable HUD, 48px tap targets, aspect-ratio canvas

---

## Levels 🗺️
- [x] Level 1 — Initialization: Open map, tutorial, no trace tiles
- [x] Level 2 — Surveillance: Split map, trace-guarded corridor, gate shortcut
- [x] Level 3 — Maze Protocol: H-shaped layout, trace tiles flank inner rooms
- [x] Level 4 — Zero Day: Starts at Phase 4, certainty=62, 6 trace tiles, all tools live
- [x] Level 5 — Final Protocol: Original map, all mechanics, full run

---

## Bugs / Known Issues 🐛
- None reported yet

---

## Deployment
- [ ] itch.io page created
- [ ] GitHub Pages fallback
- [ ] Game jam submission form filled

---

## 13-Day Schedule
| Days  | Goal                                     | Status |
|-------|------------------------------------------|--------|
| 1–2   | Grid + movement + queue                  | ✅ Done |
| 3–4   | Basic puzzles + UI                       | ✅ Done |
| 5–6   | Prediction system                        | ✅ Done |
| 7–8   | Interference + injection                 | ✅ Done |
| 9–10  | Rewrite mechanics + breach               | ✅ Done |
| 11–12 | Polish + levels                          | 🔄 Now  |
| 13    | Deploy + submit                          | ⬜ Next |
