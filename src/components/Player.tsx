/* ============================================================
   LECTEUR AUDIO — barre fixe façon interface Persona 5
   Play/Pause, progression cliquable, volume, Loop, Mode Pluie
   ============================================================ */
import { useRef, useState } from "react";
import { engine } from "../audio/engine";
import type { usePlayer } from "../hooks";
import { Icons, MaskLogo } from "./Effects";

type PlayerAPI = ReturnType<typeof usePlayer>;

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
};

export function Player({ p }: { p: PlayerAPI }) {
  const { state, pos, togglePlay, setVolume, toggleLoop, toggleRain, seek } = p;
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const fracFromEvent = (clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    engine.uiClick("tick");
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seek(fracFromEvent(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging) seek(fracFromEvent(e.clientX));
  };
  const onPointerUp = () => setDragging(false);

  const pct = pos.total > 0 ? (pos.current / pos.total) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      {/* Liseré rouge incliné au-dessus de la barre */}
      <div className="h-[3px] w-full bg-[var(--p5-red)]" />
      <div className="border-t-2 border-white/10 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-8">
          {/* Bloc identité */}
          <div className="flex items-center gap-3">
            <div className="clip-blade flex h-12 w-12 items-center justify-center bg-[var(--p5-red)]">
              <MaskLogo className="h-8 w-8" />
            </div>
            <div className="hidden sm:block">
              <p
                className="font-display text-sm uppercase leading-none tracking-wide text-white"
                style={{ transform: "skewX(-6deg)" }}
              >
                Beneath the Mask
              </p>
              <p className="mt-1 flex items-center gap-2 font-type text-[10px] uppercase tracking-widest text-white/50">
                Lyn Inaizumi — Shoji Meguro
                <span
                  className={`clip-tag px-2 py-px font-display text-[9px] tracking-widest ${
                    state.mode === "mp3"
                      ? "bg-white text-black"
                      : "bg-[var(--p5-steel)] text-[var(--p5-red)]"
                  }`}
                  title={
                    state.mode === "synth"
                      ? "Mode démo : déposez votre fichier dans public/audio/beneath-the-mask.mp3"
                      : "Lecture du fichier MP3"
                  }
                >
                  {state.mode === "mp3" ? "MP3" : "SYNTH"}
                </span>
              </p>
            </div>
          </div>

          {/* Bouton lecture */}
          <button
            className="btn-p5 h-14 w-14 shrink-0 items-center justify-center px-0"
            onClick={togglePlay}
            aria-label={state.playing ? "Pause" : "Lecture"}
            style={{ boxShadow: "4px 4px 0 var(--p5-red-deep)" }}
          >
            <span>{state.playing ? Icons.pause : Icons.play}</span>
          </button>

          {/* Progression */}
          <div className="order-last w-full flex-1 basis-full lg:order-none lg:basis-auto">
            <div
              ref={barRef}
              role="slider"
              aria-label="Position de lecture"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              tabIndex={0}
              className="prog-track w-full"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seek((pos.current + 2) / pos.total);
                if (e.key === "ArrowLeft") seek((pos.current - 2) / pos.total);
              }}
            >
              <div className="prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex justify-between font-type text-[10px] uppercase tracking-widest text-white/45">
              <span>{fmt(pos.current)}</span>
              <span className="hidden text-white/30 sm:inline">
                {state.mode === "synth" ? "boucle lo-fi générée en direct — Web Audio API" : "fichier audio.mp3"}
              </span>
              <span>{fmt(pos.total)}</span>
            </div>
          </div>

          {/* Égaliseur */}
          <div
            className={`hidden h-8 items-end gap-[3px] md:flex ${state.playing ? "eq-live" : ""}`}
            aria-hidden="true"
          >
            {[0.9, 0.6, 1, 0.5, 0.75].map((h, i) => (
              <span
                key={i}
                className="eq-bar"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.13}s`, animationDuration: `${0.7 + i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-2">
            <button
              className={`btn-sq h-11 w-11 ${state.loop ? "is-on" : ""}`}
              onClick={toggleLoop}
              aria-label="Boucle"
              aria-pressed={state.loop}
              title={state.loop ? "Boucle : activée" : "Boucle : désactivée"}
            >
              {Icons.loop}
            </button>
            <button
              className={`btn-sq h-11 px-3 ${state.rain ? "is-on" : ""}`}
              onClick={toggleRain}
              aria-pressed={state.rain}
              title="Superpose une ambiance de pluie synthétisée"
            >
              <span className="gap-2 font-display text-[11px] uppercase tracking-widest">
                {Icons.rain}
                <span className="hidden sm:inline">{state.rain ? "Pluie ON" : "Mode Pluie"}</span>
              </span>
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-white/50">{Icons.vol}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(state.volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="range-p5 w-28"
                style={{ "--fill": `${state.volume * 100}%` } as React.CSSProperties}
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
