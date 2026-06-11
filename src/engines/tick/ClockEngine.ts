import type { TickContext, TickSystem } from '@/types/TickType'

export interface ClockEngineParams {
  /** maximum dt in seconds to avoid huge jumps when the tab is backgrounded */
  maxDeltaTime?: {
    isEnabled: boolean
    maxSeconds: number
  }
  /**
   * Intervalle entre deux ticks **gameplay** (s). Pas lié au rafraîchissement écran.
   * Défaut : 0,05 s → 20 ticks sim / s.
   */
  gameTickIntervalSeconds?: number
  /**
   * Intervalle entre deux signaux **redessin UI** (s, temps mur). 0 = désactivé.
   * Défaut : 0,1 s → ~10 / s (barres, cooldowns…).
   */
  uiRedrawIntervalSeconds?: number
  /** Appelé à `uiRedrawIntervalSeconds` — incrémenter `uiTicksCount` côté store. */
  onUiRedraw?: () => void
}

const DEFAULT_GAME_TICK_INTERVAL = 0.05
const DEFAULT_UI_REDRAW_INTERVAL = 0.1
const PAUSED_POLL_MS = 200
/** Évite la spirale de la mort si plusieurs pas s’accumulent d’un coup. */
const MAX_SIM_STEPS_PER_FRAME = 8

/**
 * Horloge centrale : rAF pour le temps mur, pas fixe pour le gameplay.
 *
 * - rAF accumule le delta temps réel (× vitesse).
 * - `TickSystem.onTick` : pas de `gameTickIntervalSeconds` (≈ 20 Hz).
 * - `onUiRedraw` : signal affichage (~10 Hz), sans avancer la sim.
 */
export class ClockEngine {
  private systems: TickSystem[] = []
  private running = false
  private paused = false
  private speed = 1

  private lastTsMs: number | null = null
  private rafId: number | null = null
  private pausedTimerId: ReturnType<typeof setTimeout> | null = null

  private tick = 0
  private elapsed = 0
  private accumulatedSimTime = 0

  private readonly gameTickIntervalSeconds: number
  private readonly uiRedrawIntervalSeconds: number
  private readonly onUiRedraw?: () => void
  private uiRedrawWallAccumulated = 0
  private lastUiWallTsMs: number | null = null

  constructor(private options: ClockEngineParams = {}) {
    this.gameTickIntervalSeconds = options.gameTickIntervalSeconds ?? DEFAULT_GAME_TICK_INTERVAL
    this.uiRedrawIntervalSeconds = options.uiRedrawIntervalSeconds ?? DEFAULT_UI_REDRAW_INTERVAL
    this.onUiRedraw = options.onUiRedraw
  }

  register(system: TickSystem) {
    if (this.systems.some((s) => s.id === system.id)) {
      throw new Error(`[clock] duplicate system id: ${system.id}`)
    }
    this.systems.push(system)
  }

  setSpeed(speed: number) {
    if (!Number.isFinite(speed) || speed <= 0) throw new Error('[clock] speed must be > 0')
    this.speed = speed
  }

  setElapsedSim(seconds: number): void {
    this.elapsed = Math.max(0, seconds)
    this.accumulatedSimTime = 0
  }

  start() {
    if (this.running) return
    this.running = true
    this.paused = false
    this.lastTsMs = null
    this.lastUiWallTsMs = null
    this.uiRedrawWallAccumulated = 0
    this.tick = 0
    this.elapsed = 0
    this.accumulatedSimTime = 0

    this.systems.forEach((system) => system.onStart?.())
    this.scheduleLoop()
  }

  stop() {
    if (!this.running) return
    this.running = false
    this.paused = false
    this.lastTsMs = null
    this.lastUiWallTsMs = null
    this.uiRedrawWallAccumulated = 0
    this.accumulatedSimTime = 0
    if (this.rafId != null) cancelAnimationFrame(this.rafId)
    this.rafId = null
    if (this.pausedTimerId != null) clearTimeout(this.pausedTimerId)
    this.pausedTimerId = null
    this.systems.forEach((system) => system.onStop?.())
  }

  pause() {
    this.paused = true
  }

  resume() {
    if (!this.running) return
    this.paused = false
    this.lastTsMs = null
    this.lastUiWallTsMs = null
  }

  private scheduleLoop() {
    if (!this.running) return
    if (this.paused) {
      this.pausedTimerId = setTimeout(() => {
        this.pausedTimerId = null
        this.scheduleLoop()
      }, PAUSED_POLL_MS)
      return
    }
    this.rafId = requestAnimationFrame((ts) => this.onFrame(ts))
  }

  private onFrame(ts: number) {
    if (!this.running) return

    if (this.paused) {
      this.lastTsMs = ts
      this.scheduleLoop()
      return
    }

    let deltaTime = 0
    if (this.lastTsMs != null) {
      deltaTime = ((ts - this.lastTsMs) / 1000) * this.speed
    }
    this.lastTsMs = ts

    const clamp = this.options.maxDeltaTime
    if (clamp?.isEnabled) deltaTime = Math.min(deltaTime, clamp.maxSeconds)

    if (deltaTime > 0) {
      this.runSimulationSteps(deltaTime)
      this.emitUiRedrawIfDue(ts)
    }

    this.scheduleLoop()
  }

  private runSimulationSteps(deltaTime: number) {
    this.accumulatedSimTime += deltaTime
    const step = this.gameTickIntervalSeconds
    let steps = 0

    while (this.accumulatedSimTime >= step && steps < MAX_SIM_STEPS_PER_FRAME) {
      this.accumulatedSimTime -= step
      this.tick += 1
      this.elapsed += step
      const ctx: TickContext = { deltaTime: step, elapsed: this.elapsed, tick: this.tick }
      this.systems.forEach((system) => system.onTick(ctx))
      steps += 1
    }
  }

  /** Signal redessin UI (temps mur) — ne fait pas avancer la sim. */
  private emitUiRedrawIfDue(ts: number) {
    if (!this.onUiRedraw || this.uiRedrawIntervalSeconds <= 0) return

    let wallDt = 0
    if (this.lastUiWallTsMs != null) {
      wallDt = (ts - this.lastUiWallTsMs) / 1000
    }
    this.lastUiWallTsMs = ts
    if (wallDt <= 0) return

    this.uiRedrawWallAccumulated += wallDt
    if (this.uiRedrawWallAccumulated >= this.uiRedrawIntervalSeconds) {
      this.uiRedrawWallAccumulated = 0
      this.onUiRedraw()
    }
  }
}
