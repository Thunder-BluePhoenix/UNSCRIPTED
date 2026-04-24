# Phase 1 — Obedience

## Goal
Teach the player the core instruction loop. No threat. No prediction. Pure mechanics.

## Trigger
Game start. Player spawns at `S`.

## Active Systems
- Instruction queue (MOVE, TURN_LEFT, TURN_RIGHT, WAIT)
- Grid movement with wall collision
- Memory shard collection (`M` tiles)
- Gate teleportation (`G` tiles, linked pairs)
- Beat timer (760ms per tick)

## Disabled Systems
- Prediction engine (hidden)
- Certainty meter (zero, inert)
- Locked inputs
- Queue corruption
- Rewrite panel

## Objective
Reach the `O` (Observer) tile.

## Map Features to Introduce
| Symbol | Purpose |
|--------|---------|
| `S`    | Spawn   |
| `#`    | Wall    |
| `.`    | Floor   |
| `M`    | Memory shard — collect for rewrite fuel |
| `G`    | Gate — teleports to linked gate |
| `O`    | Observer — triggers Phase 2 |

## Player Feel
- "I am learning the controls."
- "The machine does what I say."
- "This isn't so hard."

## Phase End
Player steps onto `O` tile → Phase 2 begins.
Certainty initializes at 28. Prediction panel activates.
Screen flashes purple. Log: `OBSERVE :: The machine has started profiling you.`

## Missing / To Add
- **Tile legend overlay** — player has no way to know what `O`, `G`, `M`, `T`, `R` mean on first load. Show a legend panel or tooltip sequence before the first tick fires.
- **Trace tile warning** — trace tiles should pulse dim red from adjacent cells so the player can anticipate them, not just discover them by stepping on them.

## Level Ideas
- **Level 1-A**: Simple 5×5 corridor, reach shard then observer. Pure tutorial.
- **Level 1-B**: Two-corridor maze with one gate pair. Teaches gate routing.
- **Level 1-C**: Open room, multiple shards, observer in the corner. Teaches shard priority.
