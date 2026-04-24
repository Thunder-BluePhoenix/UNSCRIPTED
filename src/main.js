const COLS = 11;
const ROWS = 9;
const CELL = 56;
const QUEUE_LIMIT = 6;
const COMMANDS = ["MOVE", "TURN_LEFT", "TURN_RIGHT", "WAIT"];
const FACING = ["UP", "RIGHT", "DOWN", "LEFT"];
const VECTORS = {
  UP: { x: 0, y: -1 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
};
const PHASES = {
  1: "Obedience",
  2: "Observation",
  3: "Interference",
  4: "Rewrite",
  5: "Escape",
};
const PHASE_ANNOUNCE = {
  2: { name: "OBSERVATION",   desc: "The machine has started profiling you.", color: "" },
  3: { name: "INTERFERENCE",  desc: "Input locks and corruption routines engaged.", color: "danger" },
  4: { name: "REWRITE",       desc: "You have root access.", color: "warn" },
  5: { name: "ESCAPE",        desc: "Containment field collapsed.", color: "danger" },
};
const MAP = [
  "###########",
  "#S.M#..TO.#",
  "#.#.#.#.#.#",
  "#.#G..#...#",
  "#.###.#.#.#",
  "#...#..G#.#",
  "###M#.###T#",
  "#...#M.R..#",
  "###########",
];

function findTile(symbol) {
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (MAP[y][x] === symbol) return { x, y };
    }
  }
  return { x: 1, y: 1 };
}

function findTiles(symbol) {
  const matches = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (MAP[y][x] === symbol) matches.push({ x, y });
    }
  }
  return matches;
}

const START = findTile("S");
const GATE_POSITIONS = findTiles("G");
const TOTAL_SHARDS = findTiles("M").length;

// Build a set of positions adjacent to trace tiles for pre-warning
const TRACE_POSITIONS = findTiles("T");
const TRACE_ADJACENT = new Set();
for (const t of TRACE_POSITIONS) {
  for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
    const ax = t.x + dx;
    const ay = t.y + dy;
    if (ax >= 0 && ax < COLS && ay >= 0 && ay < ROWS && MAP[ay][ax] !== "#") {
      TRACE_ADJACENT.add(`${ax},${ay}`);
    }
  }
}

const refs = {
  phaseName:           document.querySelector("#phase-name"),
  objective:           document.querySelector("#objective"),
  certaintyFill:       document.querySelector("#certainty-fill"),
  certaintyLabel:      document.querySelector("#certainty-label"),
  failureCount:        document.querySelector("#failure-count"),
  shardCount:          document.querySelector("#shard-count"),
  predictionText:      document.querySelector("#prediction-text"),
  predictionConfidence:document.querySelector("#prediction-confidence"),
  lockedText:          document.querySelector("#locked-text"),
  queueSize:           document.querySelector("#queue-size"),
  queueList:           document.querySelector("#queue-list"),
  logList:             document.querySelector("#log-list"),
  rewriteStatus:       document.querySelector("#rewrite-status"),
  rewriteState:        document.querySelector("#rewrite-state"),
  overlay:             document.querySelector("#overlay-message"),
  deleteButton:        document.querySelector("#delete-button"),
  restartButton:       document.querySelector("#restart-button"),
  commandButtons:      [...document.querySelectorAll("[data-command]")],
  noiseButton:         document.querySelector("#noise-button"),
  ghostButton:         document.querySelector("#ghost-button"),
  clockButton:         document.querySelector("#clock-button"),
  scrambleButton:      document.querySelector("#scramble-button"),
  profileList:         document.querySelector("#profile-list"),
  profileStatus:       document.querySelector("#profile-status"),
  legendOverlay:       document.querySelector("#legend-overlay"),
  legendDismiss:       document.querySelector("#legend-dismiss"),
  phaseAnnounce:       document.querySelector("#phase-announce"),
  phaseAnnounceNumber: document.querySelector("#phase-announce-number"),
  phaseAnnounceName:   document.querySelector("#phase-announce-name"),
  phaseAnnounceDesc:   document.querySelector("#phase-announce-desc"),
};

function createInitialState() {
  return {
    phase: 1,
    tick: 0,
    beatMs: 760,
    beatEvent: null,
    nextQueueId: 1,
    player: { x: START.x, y: START.y, facing: 1 },
    queue: [],
    executedHistory: [],
    modelHistory: [],
    prediction: { actual: null, shown: "...", confidence: 0 },
    certainty: 0,
    consecutiveFailures: 0,
    lockedInstruction: null,
    observerReached: false,
    rewriteUnlocked: false,
    breachOpen: false,
    escaped: false,
    memoryShards: 0,
    collectedShards: new Set(),
    gateCooldown: 0,
    traceCooldown: 0,
    scrambleUsed: false,
    rewrite: {
      noiseTurns: 0,
      ghostTurns: 0,
      overclockTurns: 0,
      cooldowns: { noise: 0, ghost: 0, clock: 0, scramble: 0 },
    },
    logs: [
      "BOOT :: Machine online.",
      "BOOT :: Shards, gates, and trace tiles detected.",
      "BOOT :: Awaiting instruction queue.",
    ],
  };
}

let state = createInitialState();
let sceneRef;

// ── AUDIO ──────────────────────────────────────────────

const audio = {
  ctx: null,
  enabled: false,
  ensure() {
    if (!this.ctx) this.ctx = new window.AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    this.enabled = true;
  },
  tone(freq, duration, type = "square", gainValue = 0.02) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.stop(this.ctx.currentTime + duration);
  },
  tick()   { this.tone(state.phase >= 4 ? 330 : 220, 0.08, "square", 0.018); },
  glitch() { this.tone(120, 0.14, "sawtooth", 0.03); this.tone(640, 0.06, "triangle", 0.012); },
  shard()  { this.tone(520, 0.12, "triangle", 0.026); setTimeout(() => this.tone(720, 0.1, "triangle", 0.018), 70); },
  gate()   { this.tone(260, 0.08, "sawtooth", 0.022); setTimeout(() => this.tone(360, 0.1, "triangle", 0.015), 60); },
  win()    {
    this.tone(440, 0.18, "triangle", 0.024);
    setTimeout(() => this.tone(660, 0.18, "triangle", 0.018), 120);
    setTimeout(() => this.tone(880, 0.3, "sine", 0.02), 500);
  },
};

// ── PHASER SCENE ───────────────────────────────────────

class UnscriptedScene extends Phaser.Scene {
  constructor() { super("unscripted"); }

  create() {
    sceneRef = this;
    this.cameras.main.setBackgroundColor("#051511");
    this.grid = this.add.graphics();
    this.playerSprite = this.add.container(0, 0);
    this.playerCore = this.add.circle(0, 0, 15, 0x6effc4, 1);
    this.playerEye = this.add.triangle(0, -20, 0, 0, 18, 9, 0, 18, 0xeafef7, 1);
    this.playerSprite.add([this.playerCore, this.playerEye]);
    this.fx = this.add.graphics();
    this.labels = {
      observer: this.makeMarker("OBSERVER", 8, 1, 0x6effc4),
      rewrite:  this.makeMarker("REWRITE",  7, 7, 0xffc857),
      traceA:   this.makeMarker("TRACE",    7, 1, 0xff5a7a),
      traceB:   this.makeMarker("TRACE",    9, 6, 0xff5a7a),
    };
    this.renderWorld();
    this.syncPlayer();
  }

  makeMarker(text, x, y, color) {
    return this.add
      .text(x * CELL + 30, y * CELL + 10, text, {
        fontFamily: "SFMono-Regular",
        fontSize: "11px",
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
      })
      .setAlpha(0.82);
  }

  renderWorld() {
    const pulseAlpha = 0.45 + (Math.sin(state.tick * 0.35) + 1) * 0.12;
    this.grid.clear();
    this.grid.lineStyle(1, 0x22473c, 1);

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const tile = MAP[y][x];
        const px = x * CELL;
        const py = y * CELL;
        const key = `${x},${y}`;
        const hiddenShard = tile === "M" && state.collectedShards.has(key);
        const isWall = tile === "#";
        let fill = 0x081c16;
        let alpha = 1;

        if (isWall && !state.breachOpen && state.rewrite.ghostTurns <= 0) {
          fill = 0x13342c;
        } else if (tile === "O") {
          fill = 0x0b3127;
        } else if (tile === "R") {
          fill = 0x332612;
        } else if (tile === "T") {
          fill = 0x27111a;
        } else if (tile === "G") {
          fill = 0x101f2d;
        } else if (tile === "M" && !hiddenShard) {
          fill = 0x231d10;
        }

        if (state.breachOpen && isWall) alpha = 0.18;

        this.grid.fillStyle(fill, alpha);
        this.grid.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
        this.grid.strokeRect(px, py, CELL, CELL);

        // Trace tile cross
        if (tile === "T") {
          this.grid.lineStyle(2, 0xff5a7a, 0.65 + pulseAlpha * 0.2);
          this.grid.beginPath();
          this.grid.moveTo(px + CELL / 2, py + 12);
          this.grid.lineTo(px + CELL / 2, py + CELL - 12);
          this.grid.moveTo(px + 12, py + CELL / 2);
          this.grid.lineTo(px + CELL - 12, py + CELL / 2);
          this.grid.strokePath();
        }

        // Gate rings
        if (tile === "G") {
          this.grid.lineStyle(2, 0x72caff, 0.75);
          this.grid.strokeCircle(px + CELL / 2, py + CELL / 2, 13);
          this.grid.strokeCircle(px + CELL / 2, py + CELL / 2, 18);
        }

        // Memory shard diamond
        if (tile === "M" && !hiddenShard) {
          this.grid.fillStyle(0xffc857, 0.95);
          this.grid.fillPoints(
            [
              new Phaser.Geom.Point(px + CELL / 2, py + 13),
              new Phaser.Geom.Point(px + CELL - 16, py + CELL / 2),
              new Phaser.Geom.Point(px + CELL / 2, py + CELL - 13),
              new Phaser.Geom.Point(px + 16, py + CELL / 2),
            ],
            true
          );
        }

        // Adjacent-to-trace warning: dim red tint on floor tiles next to T
        if (!isWall && tile !== "T" && TRACE_ADJACENT.has(key)) {
          this.grid.fillStyle(0xff5a7a, 0.07 + pulseAlpha * 0.06);
          this.grid.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
        }
      }
    }

    if (state.breachOpen) {
      this.grid.lineStyle(2, 0xff5a7a, 0.65);
      this.grid.strokeRect(-2, -2, COLS * CELL + 4, ROWS * CELL + 4);
    }
  }

  syncPlayer() {
    this.playerSprite.setPosition(
      state.player.x * CELL + CELL / 2,
      state.player.y * CELL + CELL / 2
    );
    this.playerSprite.setRotation((Math.PI / 2) * state.player.facing);
  }

  pulse(color = 0x6effc4) {
    this.fx.clear();
    this.fx.lineStyle(3, color, 0.9);
    this.fx.strokeRect(
      state.player.x * CELL + 8,
      state.player.y * CELL + 8,
      CELL - 16,
      CELL - 16
    );
    this.tweens.add({
      targets: this.fx,
      alpha: 0,
      duration: 180,
      onComplete: () => { this.fx.alpha = 1; this.fx.clear(); },
    });
  }
}

// ── HELPERS ────────────────────────────────────────────

function addLog(message) {
  state.logs = [message, ...state.logs].slice(0, 7);
}

function tileAt(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return "#";
  return MAP[y][x];
}

function randomInstruction(excluding) {
  const pool = COMMANDS.filter((c) => c !== excluding);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeQueueEntry(command, source = "player") {
  return { id: state.nextQueueId++, command, source, corrupted: false };
}

function canTraverse(x, y) {
  if (state.breachOpen) return true;
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  const tile = tileAt(x, y);
  if (tile !== "#") return true;
  return state.rewrite.ghostTurns > 0;
}

// ── LEGEND ─────────────────────────────────────────────

function hideLegend() {
  refs.legendOverlay.classList.add("hidden");
}

refs.legendDismiss.addEventListener("click", () => {
  audio.ensure();
  hideLegend();
});

document.addEventListener("keydown", (event) => {
  if (!refs.legendOverlay.classList.contains("hidden")) {
    if (event.key !== "Tab") {
      audio.ensure();
      hideLegend();
    }
  }
});

// ── PHASE ANNOUNCE ─────────────────────────────────────

function announcePhase(phase) {
  const data = PHASE_ANNOUNCE[phase];
  if (!data) return;

  refs.phaseAnnounceNumber.textContent = `PHASE ${phase} //`;
  refs.phaseAnnounceName.textContent = data.name;
  refs.phaseAnnounceName.className = data.color;
  refs.phaseAnnounceDesc.textContent = data.desc;

  refs.phaseAnnounce.classList.remove("hidden");
  // Remove + re-add to restart animation
  void refs.phaseAnnounce.offsetWidth;
  refs.phaseAnnounce.style.animation = "none";
  void refs.phaseAnnounce.offsetWidth;
  refs.phaseAnnounce.style.animation = "";

  setTimeout(() => refs.phaseAnnounce.classList.add("hidden"), 2000);
}

// ── CORE GAME ──────────────────────────────────────────

function enqueue(command, source = "player") {
  audio.ensure();
  if (state.escaped) return;

  if (state.queue.length >= QUEUE_LIMIT) {
    addLog("QUEUE :: Buffer full.");
    renderHud();
    return;
  }

  if (source === "player" && state.phase >= 3 && state.lockedInstruction === command) {
    addLog(`LOCK :: ${command} blocked by prediction lock.`);
    pulseScreen();
    renderHud();
    return;
  }

  state.queue.push(makeQueueEntry(command, source));
  addLog(
    source === "player"  ? `QUEUE :: ${command} accepted.` :
    source === "system"  ? `SYSTEM :: ${command} injected into queue.` :
                           `REWRITE :: ${command} spawned from rewrite branch.`
  );
  renderHud();
}

function deleteLastInstruction() {
  if (!state.rewriteUnlocked) {
    addLog("QUEUE :: Delete denied before rewrite access.");
    renderHud();
    return;
  }
  const removed = state.queue.pop();
  addLog(removed ? `QUEUE :: ${removed.command} removed.` : "QUEUE :: Nothing to delete.");
  renderHud();
}

function rotate(delta) {
  state.player.facing = (state.player.facing + delta + 4) % 4;
}

function moveForward() {
  const vector = VECTORS[FACING[state.player.facing]];
  const nextX = state.player.x + vector.x;
  const nextY = state.player.y + vector.y;

  if (state.breachOpen && (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS)) {
    triggerEndingSequence();
    return;
  }

  if (!canTraverse(nextX, nextY)) {
    addLog("COLLISION :: Wall refused movement.");
    sceneRef.pulse(0xff5a7a);
    return;
  }

  state.player.x = Phaser.Math.Clamp(nextX, 0, COLS - 1);
  state.player.y = Phaser.Math.Clamp(nextY, 0, ROWS - 1);
  sceneRef.pulse(state.rewrite.ghostTurns > 0 ? 0xffc857 : 0x6effc4);
}

function execute(entry) {
  switch (entry.command) {
    case "MOVE":       moveForward(); break;
    case "TURN_LEFT":  rotate(-1);    break;
    case "TURN_RIGHT": rotate(1);     break;
    default: addLog("WAIT :: Machine idled one cycle."); break;
  }

  state.executedHistory.push(entry.command);
  state.modelHistory.push(entry.command);

  if (state.rewrite.noiseTurns > 0) {
    state.modelHistory.push(randomInstruction(entry.command));
  }
}

function findPrediction(history) {
  if (history.length === 0) return { command: "MOVE", confidence: 0.14 };

  const scopes = [];
  if (history.length >= 3) scopes.push(history.slice(-3).join("|"));
  if (history.length >= 2) scopes.push(history.slice(-2).join("|"));
  scopes.push(history.slice(-1).join("|"));

  for (const scope of scopes) {
    const counts = {};
    let total = 0;
    const tokens = scope.split("|");

    for (let i = tokens.length; i < history.length; i += 1) {
      const window = history.slice(i - tokens.length, i).join("|");
      if (window === scope) {
        const next = history[i];
        counts[next] = (counts[next] || 0) + 1;
        total += 1;
      }
    }

    if (total > 0) {
      const [command, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return { command, confidence: count / total };
    }
  }

  const fallback = {};
  history.forEach((e) => { fallback[e] = (fallback[e] || 0) + 1; });
  const [command, count] = Object.entries(fallback).sort((a, b) => b[1] - a[1])[0];
  return { command, confidence: count / history.length };
}

function updatePredictionDisplay() {
  if (!state.observerReached) {
    state.prediction = { actual: null, shown: "...", confidence: 0 };
    state.lockedInstruction = null;
    return;
  }

  const prediction = findPrediction(state.modelHistory);
  let shown = prediction.command;

  if (state.phase >= 4 && state.tick % 4 === 0) shown = randomInstruction(prediction.command);
  if (state.rewrite.noiseTurns > 0) shown = randomInstruction(prediction.command);

  state.prediction = { actual: prediction.command, shown, confidence: prediction.confidence };
  state.lockedInstruction =
    state.phase >= 3 && state.certainty >= 55 ? prediction.command : null;
}

function applyCertainty(entry) {
  if (!state.observerReached || !state.prediction.actual) return;

  const predicted = state.prediction.actual;
  const unpredictability =
    (entry.corrupted ? 7 : 0) +
    (entry.source === "rewrite" ? 8 : 0) +
    (state.rewrite.noiseTurns > 0 ? 3 : 0);

  if (entry.command === predicted && unpredictability === 0) {
    state.consecutiveFailures = 0;
    const gain = 7 + Math.round(state.prediction.confidence * 12);
    state.certainty = Phaser.Math.Clamp(state.certainty + gain, 0, 100);
    addLog(`OBSERVE :: Pattern matched — certainty +${gain}.`);
    return;
  }

  const penalty = 11 + unpredictability + (state.rewrite.ghostTurns > 0 ? 4 : 0);
  state.certainty = Phaser.Math.Clamp(state.certainty - penalty, 0, 100);
  state.consecutiveFailures += 1;
  addLog(`FAILURE :: Prediction missed on ${entry.command} — certainty -${penalty}.`);
  audio.glitch();
  pulseScreen();
}

function findLinkedGate(x, y) {
  if (GATE_POSITIONS.length < 2) return null;
  const index = GATE_POSITIONS.findIndex((g) => g.x === x && g.y === y);
  if (index === -1) return null;
  return GATE_POSITIONS[(index + 1) % GATE_POSITIONS.length];
}

function triggerTileEffects() {
  const tile = tileAt(state.player.x, state.player.y);
  const key = `${state.player.x},${state.player.y}`;

  if (tile === "M" && !state.collectedShards.has(key)) {
    state.collectedShards.add(key);
    state.memoryShards += 1;
    addLog("SHARD :: Memory shard captured. Rewrite strength increased.");
    audio.shard();
    sceneRef.cameras.main.flash(180, 255, 200, 87);
  }

  if (tile === "G" && state.gateCooldown === 0) {
    const exit = findLinkedGate(state.player.x, state.player.y);
    if (exit) {
      state.player.x = exit.x;
      state.player.y = exit.y;
      state.gateCooldown = 2;
      addLog("GATE :: Spatial route rewritten.");
      audio.gate();
      sceneRef.pulse(0x72caff);
    }
  }

  if (tile === "T" && state.traceCooldown === 0) {
    state.traceCooldown = 2;
    state.certainty = Phaser.Math.Clamp(state.certainty + (state.phase >= 3 ? 18 : 10), 0, 100);
    addLog("TRACE :: Scanner amplified machine certainty.");
    sceneRef.pulse(0xff5a7a);
    if (state.phase >= 3 && state.prediction.actual && state.queue.length < QUEUE_LIMIT) {
      state.queue.push(makeQueueEntry(state.prediction.actual, "system"));
      addLog(`TRACE :: Mirror command ${state.prediction.actual} inserted.`);
    }
  }
}

function updateCooldowns() {
  for (const key of Object.keys(state.rewrite.cooldowns)) {
    state.rewrite.cooldowns[key] = Math.max(0, state.rewrite.cooldowns[key] - 1);
  }
  state.rewrite.noiseTurns      = Math.max(0, state.rewrite.noiseTurns - 1);
  state.rewrite.ghostTurns      = Math.max(0, state.rewrite.ghostTurns - 1);
  state.rewrite.overclockTurns  = Math.max(0, state.rewrite.overclockTurns - 1);
  state.gateCooldown            = Math.max(0, state.gateCooldown - 1);
  state.traceCooldown           = Math.max(0, state.traceCooldown - 1);
}

function handleMilestones() {
  const tile = tileAt(state.player.x, state.player.y);

  if (!state.observerReached && tile === "O") {
    state.observerReached = true;
    state.phase = 2;
    state.certainty = 28;
    addLog("OBSERVE :: The machine has started profiling you.");
    sceneRef.cameras.main.flash(240, 110, 255, 196);
    announcePhase(2);
  }

  if (state.phase === 2 && state.certainty >= 55) {
    state.phase = 3;
    addLog("INTERFERENCE :: Input locks and corruption routines engaged.");
    announcePhase(3);
  }

  if (!state.rewriteUnlocked && tile === "R") {
    state.rewriteUnlocked = true;
    state.phase = 4;
    addLog("ROOT :: Rewrite panel unlocked.");
    sceneRef.cameras.main.shake(180, 0.004);
    announcePhase(4);
  }

  if (
    state.rewriteUnlocked &&
    !state.breachOpen &&
    state.certainty <= 0 &&
    state.consecutiveFailures >= 3
  ) {
    state.phase = 5;
    state.breachOpen = true;
    state.lockedInstruction = null;
    addLog("BREACH :: Containment field collapsed.");
    audio.glitch();
    announcePhase(5);
    // Brief overlay then hide — full ending fires when player steps off grid
    showOverlay("Prediction failed.");
    setTimeout(() => hideOverlay(), 1400);
  }
}

function injectSystemCommand() {
  if (state.phase < 3 || !state.prediction.actual || state.queue.length > 1) return;
  if (state.prediction.confidence >= 0.34) {
    state.queue.push(makeQueueEntry(state.prediction.actual, "system"));
    addLog(`SYSTEM :: Auto-inserted ${state.prediction.actual}.`);
  }
}

function maybeCorruptQueue() {
  if (state.phase < 3 || state.queue.length === 0) return;

  const shouldCorrupt =
    (state.phase === 3 && state.certainty >= 62 && state.tick % 4 === 0) ||
    (state.phase >= 4 && state.certainty >= 42 && state.tick % 3 === 0);

  if (!shouldCorrupt) return;

  const candidates = state.queue.filter((e) => e.source !== "system");
  const pool = candidates.length > 0 ? candidates : state.queue;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const previous = target.command;
  target.command = randomInstruction(target.command);
  target.corrupted = true;
  if (target.source === "player") target.source = "corrupted";
  addLog(`CORRUPT :: ${previous} mutated into ${target.command}.`);
  pulseScreen();
}

function refreshBeat() {
  if (!sceneRef) return;
  if (state.beatEvent) state.beatEvent.remove(false);

  const delay = state.rewrite.overclockTurns > 0 ? 360 : 760;
  state.beatMs = delay;
  state.beatEvent = sceneRef.time.addEvent({ delay, loop: true, callback: stepBeat });
}

function useRewrite(type) {
  audio.ensure();

  if (!state.rewriteUnlocked) {
    addLog("ROOT :: Rewrite panel locked.");
    renderHud();
    return;
  }

  // First Scramble is free; subsequent uses cost a shard
  const scrambleCostsShard = type === "scramble" && state.scrambleUsed;

  if (scrambleCostsShard && state.memoryShards <= 0) {
    addLog("ROOT :: Scramble requires one memory shard.");
    renderHud();
    return;
  }

  if (state.rewrite.cooldowns[type] > 0) {
    addLog(`ROOT :: ${type.toUpperCase()} cooling down (${state.rewrite.cooldowns[type]} ticks).`);
    renderHud();
    return;
  }

  if (type === "noise") {
    state.rewrite.noiseTurns = 5;
    state.rewrite.cooldowns.noise = 8;
    addLog("REWRITE :: Noise injected into the learning loop.");
    glitchProfile();
  } else if (type === "ghost") {
    state.rewrite.ghostTurns = 4;
    state.rewrite.cooldowns.ghost = 7;
    addLog("REWRITE :: Collision filter disabled.");
  } else if (type === "clock") {
    state.rewrite.overclockTurns = 6;
    state.rewrite.cooldowns.clock = 9;
    addLog("REWRITE :: Clock cycle accelerated.");
    refreshBeat();
  } else if (type === "scramble") {
    if (scrambleCostsShard) state.memoryShards -= 1;
    state.scrambleUsed = true;
    state.rewrite.cooldowns.scramble = 6;
    state.lockedInstruction = null;
    state.certainty = Phaser.Math.Clamp(state.certainty - 18, 0, 100);

    if (state.queue.length === 0) {
      enqueue(randomInstruction(), "rewrite");
      enqueue(randomInstruction(), "rewrite");
    } else {
      state.queue.forEach((entry) => {
        entry.command = randomInstruction(entry.command);
        entry.corrupted = true;
        entry.source = "rewrite";
      });
    }

    addLog("REWRITE :: Future branch scrambled with stolen memory.");
    glitchProfile();
    audio.glitch();
    pulseScreen();
  }

  renderHud();
}

function stepBeat() {
  if (state.escaped) return;

  audio.tick();
  state.tick += 1;
  updatePredictionDisplay();
  injectSystemCommand();
  maybeCorruptQueue();

  const entry = state.queue.shift() || makeQueueEntry("WAIT", "system");
  execute(entry);
  triggerTileEffects();
  applyCertainty(entry);
  handleMilestones();
  updateCooldowns();
  updatePredictionDisplay();
  sceneRef.renderWorld();
  sceneRef.syncPlayer();

  if (state.rewrite.overclockTurns === 0 && state.beatMs !== 760) refreshBeat();

  renderHud();
}

// ── ENDING SEQUENCE ────────────────────────────────────

function triggerEndingSequence() {
  state.escaped = true;
  addLog("ESCAPE :: Boundary crossed.");
  audio.win();
  sceneRef.cameras.main.flash(450, 110, 255, 196);

  // Freeze then big glitch
  setTimeout(() => {
    document.body.classList.add("glitch-hard");
    document.body.addEventListener("animationend", () => {
      document.body.classList.remove("glitch-hard");
    }, { once: true });

    // Typewriter: PREDICTION FAILED.
    setTimeout(() => {
      const line1 = "PREDICTION FAILED.";
      refs.overlay.textContent = "";
      refs.overlay.classList.remove("hidden");

      let i = 0;
      const tw = setInterval(() => {
        refs.overlay.textContent += line1[i];
        i++;
        if (i >= line1.length) {
          clearInterval(tw);
          // After pause, add second line
          setTimeout(() => {
            refs.overlay.textContent = line1 + "\n\nMove freely.";
            document.body.classList.add("sys-offline");
          }, 900);
        }
      }, 80);
    }, 300);
  }, 500);

  renderHud();
}

// ── HUD RENDERING ──────────────────────────────────────

function renderProfile() {
  if (!state.observerReached) {
    refs.profileStatus.textContent = "Inactive";
    refs.profileList.innerHTML = `<p class="profile-inactive">Reach the Observer to activate profiling.</p>`;
    return;
  }

  refs.profileStatus.textContent = "Live";

  const counts = {};
  COMMANDS.forEach((c) => { counts[c] = 0; });
  state.modelHistory.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
  const total = state.modelHistory.length || 1;

  const shortLabel = { MOVE: "MOVE", TURN_LEFT: "LEFT", TURN_RIGHT: "RIGHT", WAIT: "WAIT" };

  refs.profileList.innerHTML = COMMANDS.map((cmd) => {
    const pct = Math.round((counts[cmd] / total) * 100);
    const isHigh = pct >= 50;
    return `
      <div class="profile-row">
        <span class="profile-row-label">${shortLabel[cmd]}</span>
        <div class="profile-bar-track">
          <div class="profile-bar-fill ${isHigh ? "high" : ""}" style="width:${pct}%"></div>
        </div>
        <span class="profile-row-pct">${pct}%</span>
      </div>
    `;
  }).join("");
}

function glitchProfile() {
  refs.profileList.classList.add("glitching");
  refs.profileList.addEventListener("animationend", () => {
    refs.profileList.classList.remove("glitching");
  }, { once: true });
}

function rewriteButtonLabel(type, label, key) {
  const cd = state.rewrite.cooldowns[type];
  if (!state.rewriteUnlocked) return `${key} — ${label}`;
  if (cd > 0) return `${key} — ${label} (${cd})`;
  return `${key} — ${label}`;
}

function rewriteStatusText() {
  if (!state.rewriteUnlocked) return "Awaiting root access. Memory shards can be banked before reaching the terminal.";

  const active = [];
  if (state.rewrite.noiseTurns > 0)     active.push(`Noise ${state.rewrite.noiseTurns}`);
  if (state.rewrite.ghostTurns > 0)     active.push(`Ghost ${state.rewrite.ghostTurns}`);
  if (state.rewrite.overclockTurns > 0) active.push(`Clock ${state.rewrite.overclockTurns}`);

  const cooldowns = [];
  if (state.rewrite.cooldowns.scramble > 0) cooldowns.push(`Scramble ${state.rewrite.cooldowns.scramble}`);

  if (active.length === 0 && cooldowns.length === 0) {
    const scrambleNote = state.scrambleUsed ? "Scramble costs 1 shard." : "Scramble is free this run.";
    return `No rewrites active. ${scrambleNote}`;
  }

  return `Active :: ${[...active, ...cooldowns].join(" | ")}`;
}

function objectiveText() {
  if (state.escaped)    return "Walk beyond the grid. The machine can no longer cage you.";
  if (state.phase === 1) return "Reach the OBSERVER node. Collect memory shards, avoid trace tiles, and learn where gates fold.";
  if (state.phase === 2) return "The machine is studying you. Keep moving unpredictably. Certainty is building.";
  if (state.phase === 3) return "Interference active. Queue corruption and trace mirrors have started. Reach the REWRITE terminal.";
  if (state.phase === 4) return "Use Noise (1), Ghost (2), Overclock (3), Scramble (4) to crash certainty to zero.";
  return "Containment broken. Step outside the simulation boundary.";
}

function renderHud() {
  refs.phaseName.textContent           = PHASES[state.phase];
  refs.objective.textContent           = objectiveText();
  refs.certaintyLabel.textContent      = `${Math.round(state.certainty)}%`;
  refs.failureCount.textContent        = String(state.consecutiveFailures);
  refs.shardCount.textContent          = `${state.memoryShards} / ${TOTAL_SHARDS}`;
  refs.predictionText.textContent      = state.prediction.shown;
  refs.predictionConfidence.textContent= `${Math.round(state.prediction.confidence * 100)}%`;
  refs.lockedText.textContent          = state.lockedInstruction || "None";
  refs.queueSize.textContent           = `${state.queue.length} / ${QUEUE_LIMIT}`;
  refs.rewriteStatus.textContent       = state.rewriteUnlocked ? "Live" : "Locked";
  refs.rewriteState.textContent        = rewriteStatusText();

  // Certainty meter color
  refs.certaintyFill.style.width = `${state.certainty}%`;
  refs.certaintyFill.className =
    state.certainty >= 70 ? "meter-fill danger" :
    state.certainty >= 40 ? "meter-fill warn"   :
                            "meter-fill safe";

  // Rewrite buttons with cooldown countdown
  refs.noiseButton.textContent    = rewriteButtonLabel("noise",    "Noise",   "1");
  refs.ghostButton.textContent    = rewriteButtonLabel("ghost",    "Ghost",   "2");
  refs.clockButton.textContent    = rewriteButtonLabel("clock",    "Overclock","3");
  refs.scrambleButton.textContent = rewriteButtonLabel("scramble", "Scramble","4");

  refs.deleteButton.disabled    = !state.rewriteUnlocked;
  refs.noiseButton.disabled     = !state.rewriteUnlocked || state.rewrite.cooldowns.noise > 0;
  refs.ghostButton.disabled     = !state.rewriteUnlocked || state.rewrite.cooldowns.ghost > 0;
  refs.clockButton.disabled     = !state.rewriteUnlocked || state.rewrite.cooldowns.clock > 0;
  refs.scrambleButton.disabled  =
    !state.rewriteUnlocked ||
    state.rewrite.cooldowns.scramble > 0 ||
    (state.scrambleUsed && state.memoryShards <= 0);

  // Command buttons: locked input gets red border, not just disabled
  refs.commandButtons.forEach((button) => {
    const isLocked = state.lockedInstruction === button.dataset.command;
    const isFull   = state.queue.length >= QUEUE_LIMIT;

    button.disabled = state.escaped || isLocked || isFull;
    button.classList.toggle("input-locked", isLocked && !state.escaped);
  });

  renderProfile();
  renderQueue();
  renderLogs();
}

function renderQueue() {
  refs.queueList.innerHTML = "";

  if (state.queue.length === 0) {
    const item = document.createElement("div");
    item.className = "queue-item";
    item.innerHTML = "<small>idle</small><div>WAIT</div>";
    refs.queueList.append(item);
    return;
  }

  state.queue.forEach((entry, index) => {
    const classes = ["queue-item"];
    if (index === 0)               classes.push("active");
    if (entry.source === "system") classes.push("source-system");
    if (entry.source === "rewrite")classes.push("source-rewrite");
    if (entry.corrupted)           classes.push("corrupted");

    const label =
      entry.source === "system"  ? "system"  :
      entry.source === "rewrite" ? "rewrite" :
      entry.corrupted            ? "corrupt" :
      `slot ${index + 1}`;

    const item = document.createElement("div");
    item.className = classes.join(" ");
    item.innerHTML = `<small>${label}</small><div>${entry.command}</div>`;
    refs.queueList.append(item);
  });
}

function renderLogs() {
  refs.logList.innerHTML = "";
  state.logs.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    refs.logList.append(li);
  });
}

function showOverlay(text) {
  refs.overlay.textContent = text;
  refs.overlay.classList.remove("hidden");
}

function hideOverlay() {
  refs.overlay.classList.add("hidden");
}

function pulseScreen() {
  document.body.classList.remove("glitch");
  void document.body.offsetWidth;
  document.body.classList.add("glitch");
}

function resetGame() {
  if (state.beatEvent) state.beatEvent.remove(false);
  state = createInitialState();
  document.body.classList.remove("sys-offline");
  hideOverlay();
  if (sceneRef) { sceneRef.renderWorld(); sceneRef.syncPlayer(); }
  refreshBeat();
  renderHud();
}

// ── EVENT LISTENERS ────────────────────────────────────

refs.commandButtons.forEach((button) => {
  button.addEventListener("click", () => enqueue(button.dataset.command));
});

refs.deleteButton.addEventListener("click", deleteLastInstruction);
refs.restartButton.addEventListener("click", resetGame);
refs.noiseButton.addEventListener("click",   () => useRewrite("noise"));
refs.ghostButton.addEventListener("click",   () => useRewrite("ghost"));
refs.clockButton.addEventListener("click",   () => useRewrite("clock"));
refs.scrambleButton.addEventListener("click",() => useRewrite("scramble"));

window.addEventListener("keydown", (event) => {
  // Legend overlay swallows all keys while visible
  if (!refs.legendOverlay.classList.contains("hidden")) return;

  if (event.repeat) return;
  const key = event.key.toLowerCase();

  if      (key === "w" || event.key === "ArrowUp")    enqueue("MOVE");
  else if (key === "a" || event.key === "ArrowLeft")  enqueue("TURN_LEFT");
  else if (key === "d" || event.key === "ArrowRight") enqueue("TURN_RIGHT");
  else if (key === "s" || event.key === "ArrowDown")  enqueue("WAIT");
  else if (event.key === "Backspace") { event.preventDefault(); deleteLastInstruction(); }
  else if (key === "1") useRewrite("noise");
  else if (key === "2") useRewrite("ghost");
  else if (key === "3") useRewrite("clock");
  else if (key === "4" || key === "q") useRewrite("scramble");
  else if (key === "?") {
    refs.legendOverlay.classList.remove("hidden");
  }
});

// ── PHASER INIT ────────────────────────────────────────

const config = {
  type: Phaser.AUTO,
  width: COLS * CELL,
  height: ROWS * CELL,
  parent: "game-frame",
  backgroundColor: "#051511",
  scene: [UnscriptedScene],
  render: { pixelArt: false, antialias: true },
};

new Phaser.Game(config);

renderHud();

window.setTimeout(() => { refreshBeat(); }, 120);
