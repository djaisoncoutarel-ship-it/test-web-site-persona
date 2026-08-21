/* ============================================================
   MOTEUR AUDIO — Beneath the Mask
   Chaîne de sources (par priorité) :
   1. YouTube IFrame → piste officielle (YOUTUBE_ID dans data.ts),
      si l'API est accessible (en ligne).
   2. /audio/beneath-the-mask.mp3 si présent (MP3_SRC) — 100 % local.
   3. Synthé lo-fi jazz procédural (Web Audio API) — 100 % local :
      Fm9 → Bbm9 → Ebmaj9 → Abmaj7 → Dbmaj7 → Gm7b5 → C7alt,
      ride swing, walking bass, piano électrique, vinyle.
   + Pluie synthétisée (nappe + gouttes + tonnerre lointain).
   + Clics d'interface façon menu Persona.
   Tout fonctionne hors-ligne grâce aux sources 2 et 3.
   ============================================================ */

import { MP3_SRC, YOUTUBE_ID } from "../data";

export type SourceMode = "yt" | "mp3" | "synth";

export interface Position {
  current: number;
  total: number;
}

const BPM = 78;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CYCLE_BARS = 8;
export const LOOP_TOTAL = BAR * CYCLE_BARS; // ≈ 24.6 s

/* Voicings (numéros MIDI) — cycle de 8 mesures */
const CHORDS: number[][] = [
  [41, 53, 56, 60, 63], // Fm9
  [41, 53, 56, 60, 63], // Fm9
  [46, 58, 61, 65, 68], // Bbm9
  [39, 62, 65, 70, 74], // Ebmaj9
  [44, 56, 60, 63, 67], // Abmaj7
  [37, 65, 68, 72], // Dbmaj7
  [43, 55, 58, 61, 65], // Gm7b5
  [36, 52, 64, 70, 73], // C7b9
];
const ROOTS = [41, 41, 46, 39, 44, 37, 43, 36];

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Ctx = AudioContext;

/* Sous-ensemble de l'API YouTube IFrame réellement utilisé */
interface YTPlayerLike {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
}

class AudioEngine {
  private ctx: Ctx | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private rainBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;

  playing = false;
  started = false;
  loop = true;
  volume = 0.8;
  mode: SourceMode = "synth";
  mp3Ready = false;
  rainOn = false;

  private audio: HTMLAudioElement | null = null;
  private schedTimer: number | null = null;
  private nextBeatTime = 0;
  private beatIndex = 0;
  private loopStartBeat = 0;
  private gridStart = 0;
  private synthOffset = 0;
  private rainCleanup: (() => void) | null = null;

  /* ---------- Source YouTube (piste officielle) ---------- */
  private yt: YTPlayerLike | null = null;
  private ytInitStarted = false;
  ytReady = false;
  private ytPos: Position = { current: 0, total: 0 };
  private ytPoller: number | null = null;

  /* ---------- Initialisation (au premier geste utilisateur) ---------- */
  ensureCtx(): Ctx {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 1;
    this.musicBus.connect(this.master);

    this.rainBus = ctx.createGain();
    this.rainBus.gain.value = 0.9;
    this.rainBus.connect(this.master);

    /* Buffer de bruit blanc partagé */
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;

    /* Lecteur MP3 — placeholder officiel :
       public/audio/beneath-the-mask.mp3 */
    const audio = new Audio(MP3_SRC);
    audio.preload = "auto";
    audio.loop = this.loop;
    audio.volume = this.volume;
    audio.addEventListener("canplay", () => {
      this.mp3Ready = true;
      this.mode = "mp3";
    });
    audio.addEventListener("error", () => {
      this.mp3Ready = false;
      if (this.mode === "mp3") this.mode = "synth";
    });
    audio.addEventListener("ended", () => {
      this.playing = false;
    });
    this.audio = audio;

    /* Source prioritaire : la piste officielle sur YouTube */
    this.initYoutube();

    return ctx;
  }

  /* ---------- Clics d'interface ---------- */
  uiClick(kind: "tick" | "confirm" = "tick") {
    const ctx = this.ensureCtx();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const blip = (at: number, freq: number, vol: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(freq, at);
      o.frequency.exponentialRampToValueAtTime(Math.max(120, freq * 0.55), at + 0.05);
      g.gain.setValueAtTime(vol, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
      o.connect(g);
      g.connect(this.master);
      o.start(at);
      o.stop(at + 0.09);
    };
    blip(t, 1500, 0.06);
    if (kind === "confirm") {
      blip(t + 0.07, 1100, 0.07);
      blip(t + 0.15, 1700, 0.08);
    }
  }

  /* ---------- Lecture / pause ---------- */
  play() {
    const ctx = this.ensureCtx();
    if (ctx.state === "suspended") void ctx.resume();
    if (this.ytReady && this.yt) {
      /* Source n°1 : la piste officielle YouTube */
      this.stopScheduler();
      this.musicBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
      if (this.audio && !this.audio.paused) this.audio.pause();
      try {
        this.yt.playVideo();
      } catch {
        this.mode = "synth";
        this.startSynth();
      }
      this.mode = "yt";
    } else if (this.mode === "mp3" && this.mp3Ready && this.audio) {
      this.stopScheduler();
      this.audio.loop = this.loop;
      this.audio.play().catch(() => {
        this.mode = "synth";
        this.startSynth();
      });
    } else {
      this.startSynth();
    }
    this.playing = true;
    this.started = true;
  }

  pause() {
    this.playing = false;
    if (this.ytReady && this.yt && this.mode === "yt") {
      try {
        this.yt.pauseVideo();
      } catch {
        /* ignore */
      }
    }
    if (this.audio && this.mode === "mp3") this.audio.pause();
    this.stopScheduler();
    if (this.ctx) {
      this.musicBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.045);
    }
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  setLoop(b: boolean) {
    this.loop = b;
    if (this.audio) this.audio.loop = b;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.master) this.master.gain.value = this.volume;
    if (this.audio) this.audio.volume = this.volume;
    if (this.ytReady && this.yt) {
      try {
        this.yt.setVolume(Math.round(this.volume * 100));
      } catch {
        /* ignore */
      }
    }
  }

  seek(frac: number) {
    const f = Math.min(0.999, Math.max(0, frac));
    if (this.mode === "yt" && this.ytReady && this.yt && this.ytPos.total > 1) {
      try {
        this.yt.seekTo(f * this.ytPos.total, true);
        this.ytPos = { ...this.ytPos, current: f * this.ytPos.total };
      } catch {
        /* ignore */
      }
      return;
    }
    if (this.mode === "mp3" && this.audio && this.audio.duration) {
      this.audio.currentTime = f * this.audio.duration;
      return;
    }
    this.synthOffset = f * LOOP_TOTAL;
    if (this.playing && this.ctx) {
      this.anchorGrid(this.ctx.currentTime - this.synthOffset + 0.06);
      /* micro-fondu pour masquer les notes déjà planifiées */
      this.musicBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.02);
      this.musicBus.gain.setTargetAtTime(1, this.ctx.currentTime + 0.08, 0.05);
    }
  }

  getPosition(): Position {
    if (this.mode === "yt" && this.ytReady) {
      return this.ytPos;
    }
    if (this.mode === "mp3" && this.audio && this.audio.duration) {
      return { current: this.audio.currentTime, total: this.audio.duration };
    }
    return {
      current: this.started ? this.synthOffset : 0,
      total: LOOP_TOTAL,
    };
  }

  /* ---------- Source YouTube (Beneath the Mask — piste officielle) ----------
     L'iframe est montée hors écran : le lecteur P5 garde la main sur
     play/pause/seek/volume/boucle via l'API YouTube IFrame. */
  private initYoutube() {
    if (this.ytInitStarted) return;
    this.ytInitStarted = true;
    const w = window as unknown as {
      YT?: { Player: new (el: string, cfg: unknown) => YTPlayerLike };
      onYouTubeIframeAPIReady?: () => void;
    };

    const create = () => {
      try {
        const host = document.createElement("div");
        host.style.cssText =
          "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;opacity:0;";
        const mount = document.createElement("div");
        mount.id = "yt-p5-player";
        host.appendChild(mount);
        document.body.appendChild(host);

        this.yt = new w.YT!.Player("yt-p5-player", {
          videoId: YOUTUBE_ID,
          width: 1,
          height: 1,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            iv_load_policy: 3,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              this.ytReady = true;
              try {
                this.yt?.setVolume(Math.round(this.volume * 100));
              } catch {
                /* ignore */
              }
              /* Le vrai titre remplace le synthé dès que possible */
              if (!this.playing) this.mode = "yt";
              if (this.ytPoller === null) {
                this.ytPoller = window.setInterval(() => this.pollYt(), 300);
              }
            },
            onStateChange: (e: { data: number }) => {
              if (e.data === 0 /* ENDED */) {
                if (this.loop && this.yt) {
                  this.yt.seekTo(0, true);
                  this.yt.playVideo();
                } else {
                  this.playing = false;
                }
              }
            },
            onError: () => {
              /* Vidéo indisponible → repli transparent sur le synthé */
              this.ytReady = false;
              if (this.mode === "yt") {
                this.mode = "synth";
                if (this.playing) this.startSynth();
              }
            },
          },
        });
      } catch {
        this.ytReady = false;
      }
    };

    if (w.YT && w.YT.Player) {
      create();
      return;
    }
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      create();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      /* hors-ligne : le synthé lo-fi reste la source */
    };
    document.head.appendChild(s);
  }

  private pollYt() {
    if (!this.yt || !this.ytReady) return;
    try {
      const total = this.yt.getDuration() || 0;
      const current = this.yt.getCurrentTime() || 0;
      this.ytPos = { current, total: total || 1 };
    } catch {
      /* ignore */
    }
  }

  /* ---------- Séquenceur synthé ---------- */
  private anchorGrid(at: number) {
    if (!this.ctx) return;
    this.gridStart = at;
    this.beatIndex = Math.max(0, Math.ceil((this.ctx.currentTime - at) / BEAT));
    this.loopStartBeat = this.beatIndex;
    this.nextBeatTime = at + this.beatIndex * BEAT;
  }

  private startSynth() {
    const ctx = this.ensureCtx();
    this.musicBus.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
    this.anchorGrid(ctx.currentTime - this.synthOffset + 0.06);
    this.stopScheduler();
    this.schedTimer = window.setInterval(() => this.tick(), 25);
  }

  private stopScheduler() {
    if (this.schedTimer !== null) {
      window.clearInterval(this.schedTimer);
      this.schedTimer = null;
    }
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextBeatTime < ctx.currentTime + 0.2) {
      this.scheduleBeat(this.beatIndex, this.nextBeatTime);
      this.beatIndex++;
      this.nextBeatTime += BEAT;
    }
    /* suivi de la position (gel propre à la pause) */
    const cur = (ctx.currentTime - this.gridStart) % LOOP_TOTAL;
    this.synthOffset = ((cur % LOOP_TOTAL) + LOOP_TOTAL) % LOOP_TOTAL;
    /* fin de cycle si boucle désactivée */
    const cycleBeats = CYCLE_BARS * 4;
    if (
      !this.loop &&
      this.beatIndex > this.loopStartBeat &&
      (this.beatIndex - this.loopStartBeat) % cycleBeats === 0
    ) {
      this.synthOffset = 0;
      this.pause();
    }
  }

  private scheduleBeat(bIdx: number, t: number) {
    const bar = Math.floor(bIdx / 4) % CYCLE_BARS;
    const beat = bIdx % 4;
    const chord = CHORDS[bar];

    if (beat === 0) {
      this.playChord(t, chord, BAR * 0.96);
      /* crépitement vinyle */
      const n = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) this.playCrackle(t + Math.random() * BAR);
    }

    /* Walking bass : fondamentale, quinte, octave, approche chromatique */
    const root = ROOTS[bar];
    const nextRoot = ROOTS[(bar + 1) % CYCLE_BARS];
    const approach = bIdx % 2 === 0 ? nextRoot + 1 : nextRoot - 1;
    const bassNote = [root, root + 7, root + 12, approach][beat];
    this.playBass(t, bassNote, BEAT * 0.88, beat === 0 ? 0.5 : 0.36);

    /* Ride swing (croches ternaires) */
    this.playRide(t, true);
    this.playRide(t + BEAT * 0.64, false);

    /* Balais sur les temps 2 et 4 */
    if (beat === 1 || beat === 3) this.playBrush(t);

    /* Ornement mélodique sparse, façon voix lointaine */
    if (bar % 2 === 1 && beat === 1) {
      const tone = chord[Math.min(3, chord.length - 1)] + 12;
      this.playVoice(t + BEAT * 0.5, tone, BEAT * 1.8);
    }
  }

  /* ---------- Instruments ---------- */
  private playChord(t: number, midis: number[], dur: number) {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1600;
    filter.Q.value = 0.4;
    filter.connect(this.musicBus);
    midis.forEach((m, i) => {
      const g = ctx.createGain();
      const peak = 0.085 - i * 0.008;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.025);
      g.gain.setTargetAtTime(peak * 0.55, t + 0.2, 0.5);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.16);
      g.connect(filter);
      [-6, 6].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = midi(m);
        o.detune.value = cents;
        o.connect(g);
        o.start(t);
        o.stop(t + dur + 1);
      });
    });
  }

  private playBass(t: number, m: number, dur: number, vel: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = midi(m);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 340;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.015);
    g.gain.setTargetAtTime(vel * 0.45, t + 0.12, 0.16);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.06);
    o.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.4);
  }

  private noiseHit(
    t: number,
    opts: { type: BiquadFilterType; freq: number; q?: number; vel: number; decay: number; bus?: GainNode; rate?: number }
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf!;
    src.playbackRate.value = opts.rate ?? 1;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
    src.connect(f);
    f.connect(g);
    g.connect(opts.bus ?? this.musicBus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + opts.decay + 0.05);
  }

  private playRide(t: number, accent: boolean) {
    this.noiseHit(t, {
      type: "highpass",
      freq: 6800,
      vel: accent ? 0.075 : 0.035,
      decay: 0.17,
    });
  }

  private playBrush(t: number) {
    this.noiseHit(t, { type: "lowpass", freq: 2300, vel: 0.05, decay: 0.2 });
  }

  private playCrackle(t: number) {
    this.noiseHit(t, { type: "highpass", freq: 5200, vel: 0.022, decay: 0.025, rate: 2 });
  }

  private playVoice(t: number, m: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = midi(m);
    /* vibrato léger */
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 7;
    lfo.connect(lfoGain);
    lfoGain.connect(o.detune);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.15);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.2);
    o.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 1);
    lfo.stop(t + dur + 1);
  }

  /* ---------- Pluie d'ambiance ---------- */
  setRain(on: boolean) {
    if (on === this.rainOn) return;
    this.rainOn = on;
    const ctx = this.ensureCtx();
    if (ctx.state === "suspended") void ctx.resume();

    if (!on) {
      if (this.rainCleanup) this.rainCleanup();
      this.rainCleanup = null;
      return;
    }

    const nodes: AudioNode[] = [];
    /* Nappe de pluie */
    const bed = ctx.createBufferSource();
    bed.buffer = this.noiseBuf!;
    bed.loop = true;
    const bedFilter = ctx.createBiquadFilter();
    bedFilter.type = "lowpass";
    bedFilter.frequency.value = 780;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.5;
    bed.connect(bedFilter);
    bedFilter.connect(bedGain);
    bedGain.connect(this.rainBus);
    bed.start();
    nodes.push(bed);

    /* Rumeur grave (toiture) */
    const rumble = ctx.createBufferSource();
    rumble.buffer = this.noiseBuf!;
    rumble.loop = true;
    rumble.playbackRate.value = 0.6;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 200;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.4;
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.rainBus);
    rumble.start();
    nodes.push(rumble);

    const drop = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.noiseHit(t, {
        type: "bandpass",
        freq: 2600 + Math.random() * 4200,
        q: 9,
        vel: 0.02 + Math.random() * 0.08,
        decay: 0.03 + Math.random() * 0.07,
        bus: this.rainBus,
        rate: 1 + Math.random(),
      });
    };

    const thunder = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf!;
      src.loop = true;
      src.playbackRate.value = 0.5;
      const f = this.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(160, t);
      f.frequency.exponentialRampToValueAtTime(60, t + 2.2);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      src.connect(f);
      f.connect(g);
      g.connect(this.rainBus);
      src.start(t);
      src.stop(t + 2.8);
      nodes.push(src);
    };

    const dropTimer = window.setInterval(() => {
      if (Math.random() < 0.6) drop();
    }, 95);
    const thunderTimer = window.setInterval(() => {
      if (Math.random() < 0.5) thunder();
    }, 8000);

    this.rainCleanup = () => {
      window.clearInterval(dropTimer);
      window.clearInterval(thunderTimer);
      nodes.forEach((n) => {
        try {
          (n as AudioBufferSourceNode).stop();
        } catch {
          /* déjà stoppé */
        }
        n.disconnect();
      });
    };
  }
}

export const engine = new AudioEngine();
