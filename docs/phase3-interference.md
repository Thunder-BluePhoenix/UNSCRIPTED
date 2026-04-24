# Phase 3 — Interference

## Goal
The machine starts fighting back. The player feels loss of agency — and must adapt or be consumed.

## Trigger
Certainty hits 55% (during Phase 2 or later).

## Active Systems
- All Phase 2 systems
- **Input lock**: the predicted command is blocked from player input
- **System injection**: if queue has ≤1 entry and confidence ≥ 34%, system auto-inserts predicted command
- **Queue corruption**: player commands mutate randomly (every 3–4 ticks above 62% certainty)
- **Trace mirrors**: stepping on `T` also inserts a mirror of the predicted command

## Disabled Systems
- Rewrite panel (until `R` tile reached)

## Objective
Reach the `R` (Rewrite) terminal. This is hard — the machine is actively fighting you.

## Mechanics Detail
### Input Lock
- `state.lockedInstruction` = current prediction when certainty ≥ 55%
- Clicking or pressing a locked command: log message, pulse screen, nothing queued

### System Injection (`injectSystemCommand`)
- Fires every tick
- If `queue.length <= 1` and `confidence >= 0.34`: machine inserts its predicted move
- Appears in queue as `source: "system"` (styled differently)

### Queue Corruption (`maybeCorruptQueue`)
- Phase 3: triggers if certainty ≥ 62% and `tick % 4 === 0`
- Phase 4+: triggers if certainty ≥ 42% and `tick % 3 === 0`
- Mutates one player command to a random different command
- Marks entry as `corrupted: true`

## Player Feel
- "I can't press that button!"
- "The machine is inserting its own moves."
- "My commands are changing on me."
- "I need to get to that terminal."

## Phase End
Player steps on `R` tile → Phase 4 begins.
Rewrite panel unlocks. Delete button unlocks.
Screen shakes. Log: `ROOT :: Rewrite panel unlocked.`

## Missing / To Add
- **Phase announcement overlay** — `"PHASE 3 // INTERFERENCE — Input locks and corruption routines engaged."` full-screen flash. This is the game's most jarring shift and needs a dramatic moment, not just a log line.
- **Locked input visual** — when a command button is locked, it should visually "static out" or shake, not just go `disabled`. The player should *feel* the block.
- **Corruption visual on queue** — corrupted entries already have a CSS class, but adding a brief glitch animation when the mutation happens would make it more visceral.

## Level Ideas
- **Level 3-A**: Path to R blocked by trace tiles. Player must use unpredictable routing.
- **Level 3-B**: Gate pair shortcuts to R — but landing on gate exits near a trace tile.
