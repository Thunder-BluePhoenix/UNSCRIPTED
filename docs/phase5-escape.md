# Phase 5 — Escape

## Goal
The machine is broken. Walk off the grid. Feel freedom for the first time.

## Trigger
Breach condition met in Phase 4:
- `rewriteUnlocked === true`
- `certainty <= 0`
- `consecutiveFailures >= 3`

## What Changes
- `breachOpen = true`
- All walls rendered at 18% opacity (semi-transparent)
- Wall collision disabled (`canTraverse` returns `true` for all tiles)
- A red border pulse outlines the entire grid
- Locked input cleared (`lockedInstruction = null`)
- Overlay message: `"Prediction failed."` (auto-hides after 1.2s)

## Win Condition
Player moves beyond the grid boundary while `breachOpen` is true.

```js
// In moveForward():
if (state.breachOpen && (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS)) {
  state.escaped = true;
  showOverlay("Prediction failed.\nMove freely.");
  audio.win();
  sceneRef.cameras.main.flash(450, 110, 255, 196);
}
```

## Ending Sequence
1. Overlay: `"Prediction failed.\nMove freely."` (persistent)
2. All command buttons disabled (`state.escaped = true`)
3. Beat timer stops processing commands
4. Screen: purple/teal flash
5. Log: `ESCAPE :: Boundary crossed.`

## Polish TODO
- [ ] Screen freeze for ~0.5s (pause beat timer) before glitch fires — the sudden stop is dramatic
- [ ] Full-screen glitch CSS for 2–3 seconds
- [ ] `"PREDICTION FAILED"` types out letter by letter (typewriter effect, ~80ms per char)
- [ ] Brief silence, then `"Move freely."` fades in
- [ ] `"SYSTEM OFFLINE"` replaces all panel headers — dim every label in the HUD
- [ ] Overlay transitions: green text → static noise → white → final message
- [ ] Audio: rising sine tone → hard cut to silence → one clean bell tone on "Move freely."
- [ ] All queue buttons remain disabled — the machine is dead, there's nothing left to execute

## Player Feel
- "I did it. The machine can't touch me."
- "I was never a hero. I was a ghost that broke the simulation."
- "That ending felt *earned*."

## Design Note
The escape does NOT require reaching a tile or completing a goal.
It requires *crossing a boundary* — literally leaving the defined space.
That's the metaphor. You don't win by playing by the rules. You win by leaving the game.
