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
- [ ] Level system (multiple maps, level selector or progression)

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
- [ ] Prediction panel blink animation when locked input changes
- [ ] Scanline / CRT filter overlay (CSS)
- [ ] Screen shake on queue corruption (not just pulse)

### Onboarding
- [x] Tile legend overlay at game start — explains `O`, `R`, `T`, `G`, `M` + all keybinds
- [x] `?` key reopens the legend at any time
- [ ] First-run tooltip sequence: highlight each tile type as player approaches it

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
- [ ] Mobile layout (touch buttons, scrollable HUD)

---

## Backlog — Levels 🗺️
- [ ] Level 1-A: Tutorial corridor (movement only)
- [ ] Level 1-B: Gate pair tutorial
- [ ] Level 1-C: Shard collection puzzle
- [ ] Level 2-A: Observer with trace avoidance
- [ ] Level 2-B: Two-corridor trace gauntlet
- [ ] Level 3-A: Reach R tile under interference
- [ ] Level 3-B: Gate shortcut with trace exit
- [ ] Level 4-A: Collect all shards before R
- [ ] Level 4-B: Ghost Walk trace dodge
- [ ] Level 4-C: Start at 80% certainty — escape using rewrites
- [ ] Final level: Full gauntlet, all mechanics, tight layout

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
