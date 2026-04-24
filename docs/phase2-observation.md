# Phase 2 — Observation

## Goal
Make the player feel watched. They can see the prediction. They can't feel it yet — but they know it's building.

## Trigger
Player steps on `O` tile during Phase 1.

## Active Systems
- All Phase 1 systems
- Prediction engine (Markov n-gram, up to 3-gram)
- Prediction panel visible (Expected command + confidence %)
- Certainty meter filling as player is predictable
- Trace tiles (`T`) add certainty spikes

## Disabled Systems
- Locked inputs (certainty must hit 55% first)
- Queue corruption
- Rewrite panel

## Objective
Navigate to the `R` (Rewrite) terminal — but certainty will hit 55% before you get there.
The moment it does, Phase 3 begins automatically.

## Map Features Introduced
| Symbol | Purpose |
|--------|---------|
| `T`    | Trace scanner — spikes certainty +10 (phase 2), +18 (phase 3+) |
| `O`    | Already reached — now just a floor tile |

## Prediction Engine Summary
- Tracks last N commands in `modelHistory`
- Tries 3-gram → 2-gram → 1-gram pattern match
- Falls back to most frequent command
- Confidence = match_count / total_occurrences

## Player Feel
- "It knows what I'm about to do."
- "I should try to be less repetitive."
- "The meter is filling. I need to hurry."

## Phase End
Certainty ≥ 55% → Phase 3 begins automatically.
Log: `INTERFERENCE :: Input locks and corruption routines engaged.`

## Missing / To Add
- **Phase announcement overlay** — when Phase 2 triggers, flash a full-screen overlay: `"PHASE 2 // OBSERVATION — The machine is watching."` for ~1.5s. Right now it's just a log line, easy to miss.
- **Machine profile panel** — add a live frequency view (e.g. `MOVE ████ 60%`) so the player can *see* the model building up against them. This turns an invisible threat into a visible one.
- **Certainty jump explanation** — certainty can spike unexpectedly. A tooltip or log entry explaining *why* (e.g. `"OBSERVE :: Repeated MOVE pattern increased certainty +14"`) helps players understand and adapt.

## Level Ideas
- **Level 2-A**: Observer already visible. Player must reach it while avoiding trace tiles. Tests spatial awareness.
- **Level 2-B**: Two trace tiles flank the shortest path. Player must route around them.
