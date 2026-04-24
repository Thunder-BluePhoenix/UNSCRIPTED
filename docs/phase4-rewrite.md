# Phase 4 — Rewrite

## Goal
Player becomes the hacker. They have tools to fight back. But certainty must hit zero to trigger the breach.

## Trigger
Player steps on `R` tile (during Phase 3 or later).

## Newly Unlocked Systems
- **Delete** last queued instruction (Backspace)
- **Noise Injection** — poisons the model's training data for 5 ticks
- **Ghost Walk** — disables wall collision for 4 ticks
- **Overclock** — halves beat interval (760ms → 360ms) for 6 ticks
- **Scramble Queue** — costs 1 memory shard, randomizes queue, drops certainty -18

## Rewrite Abilities Detail
| Ability      | Key | Cost           | Duration | Cooldown | Effect |
|--------------|-----|----------------|----------|----------|--------|
| Noise        | —   | Free           | 5 ticks  | 8 ticks  | Injects fake commands into model history; shown prediction randomized |
| Ghost Walk   | —   | Free           | 4 ticks  | 7 ticks  | `canTraverse` ignores walls; player pulse turns gold |
| Overclock    | —   | Free           | 6 ticks  | 9 ticks  | Beat delay drops to 360ms via `refreshBeat()` |
| Scramble     | Q   | 1 memory shard | Instant  | 6 ticks  | Scrambles all queued commands; certainty -18; locks cleared |

## Strategy Notes
- Combine Noise + Scramble for maximum certainty drop
- Ghost Walk lets you route through walls to dodge trace tiles
- Overclock burns through queued commands fast — useful for rapid unpredictability
- Interference (corruption, injection) is still active and worse in Phase 4

## Objective
Crash certainty to 0 AND accumulate 3 consecutive prediction failures while `rewriteUnlocked` is true.
This triggers the Breach (Phase 5).

## Breach Condition (`handleMilestones`)
```js
rewriteUnlocked && !breachOpen && certainty <= 0 && consecutiveFailures >= 3
```

## Player Feel
- "I have power now."
- "The machine is still fighting me — but I can hit back."
- "Every shard I collected is fuel."
- "I need to break it completely."

## Phase End
Breach condition met → Phase 5 begins.
`breachOpen = true`. Walls go semi-transparent. Overlay: `"Prediction failed."`
Log: `BREACH :: Containment field collapsed.`

## Missing / To Add
- **Keys 1–4 for rewrite abilities** — clicking buttons in Phase 4 is too slow. Map `1` Noise, `2` Ghost, `3` Overclock, `4` Scramble. Show the key on each button label.
- **Cooldown countdown on buttons** — buttons just say "disabled". They should show `"Noise (6)"` counting down so the player knows when they can fire again.
- **Phase announcement overlay** — `"PHASE 4 // REWRITE — You have root access."` should feel like a power unlock moment, not just a log message.
- **First Scramble free** — costing a shard immediately when the player just reached R and may have zero shards is punishing. Make the first use free; subsequent uses cost 1 shard.
- **Machine profile panel reset** — when Noise or Scramble fires, visually wipe/glitch the profile panel to show the model has been poisoned.

## Level Ideas
- **Level 4-A**: All shards must be collected *before* reaching R. Tests resource planning.
- **Level 4-B**: Trace tiles everywhere. Must use Ghost Walk efficiently to avoid certainty spikes.
- **Level 4-C**: Overclock + Noise challenge — certainty is already at 80 when phase starts.
