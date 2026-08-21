/* ============================================================
   Effets visuels : pluie canvas, grain, flash métavers, logo masque
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "../hooks";

/* ---------- Pluie plein écran (canvas) ---------- */
export function RainCanvas({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let drops: { x: number; y: number; l: number; v: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(220, Math.floor(window.innerWidth / 6));
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: 12 + Math.random() * 22,
        v: 9 + Math.random() * 13,
      }));
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.22, d.y + d.l);
        ctx.stroke();
      });
    };

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,0.13)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      drops.forEach((d) => {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.22, d.y + d.l);
        d.y += d.v;
        d.x -= d.v * 0.22;
        if (d.y > canvas.height) {
          d.y = -d.l;
          d.x = Math.random() * (canvas.width + 80);
        }
      });
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    };

    if (!on) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    resize();
    window.addEventListener("resize", resize);
    if (prefersReduced()) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [on]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ---------- Grain / bruit de film ---------- */
export function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] opacity-[0.07]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ---------- Flash de transition "Metaverse" ---------- */
export function MetaverseFlash({
  active,
  onDone,
}: {
  active: boolean;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "wipe" | "flash">("idle");

  /* Referme proprement l'overlay quand la séquence est terminée */
  useEffect(() => {
    if (!active) setPhase("idle");
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const reduced = prefersReduced();
    setPhase("wipe");
    const t1 = window.setTimeout(() => setPhase("flash"), reduced ? 120 : 780);
    const t2 = window.setTimeout(onDone, reduced ? 350 : 1750);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [active, onDone]);

  if (!active && phase === "idle") return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
      onTransitionEnd={() => {
        if (!active) setPhase("idle");
      }}
    >
      {phase !== "idle" && (
        <>
          <div
            className="absolute inset-y-0 left-0 w-[130%] bg-[var(--p5-red)]"
            style={{
              animation: "wipeIn 0.4s cubic-bezier(0.7,0,0.2,1) both",
              transform: "skewX(-16deg)",
              marginLeft: "-15%",
            }}
          />
          <div
            className="absolute inset-y-0 left-0 w-[130%] bg-black"
            style={{
              animation: "wipeIn2 0.45s 0.12s cubic-bezier(0.7,0,0.2,1) both",
              transform: "skewX(-16deg)",
              marginLeft: "-15%",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="glitch font-display text-4xl uppercase tracking-widest text-[var(--p5-red)] sm:text-7xl"
              data-text="MÉTABASING…"
              style={{ animationDelay: "0.1s" }}
            >
              MÉTABASING…
            </p>
          </div>
          {phase === "flash" && (
            <div
              className="absolute inset-0 bg-white"
              style={{ animation: "hardFlash 0.7s steps(2) both" }}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Logo masque (SVG dessiné main) ---------- */
export function MaskLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M6 24 L58 18 L53 45 L32 40 L11 47 Z" fill="var(--p5-red)" />
      <path d="M14 29 L27 27 L25 38 L16 40 Z" fill="#000" />
      <path d="M39 26 L52 24 L50 36 L41 37 Z" fill="#000" />
      <path d="M29 30 L35 29 L34 36 L30 36 Z" fill="#000" opacity="0.85" />
    </svg>
  );
}

/* ---------- Masque d'arcane générique pour les cartes ---------- */
export function ArcanaMask({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path d="M8 22 L56 16 L51 46 L32 41 L13 48 Z" fill={accent} />
      <path d="M16 28 L28 26 L26 38 L18 40 Z" fill="#000" />
      <path d="M38 25 L50 23 L48 35 L40 36 Z" fill="#000" />
      <path d="M30 44 L34 43 L33 48 L31 48 Z" fill="#000" />
    </svg>
  );
}

/* ---------- Pictos SVG des contrôles ---------- */
export const Icons = {
  play: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M6 3 L21 12 L6 21 Z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M5 3 H10 V21 H5 Z M14 3 H19 V21 H14 Z" />
    </svg>
  ),
  loop: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M4 10 L8 6 L12 10 M8 6 V16 a3 3 0 0 0 3 3 h1" />
      <path d="M20 14 L16 18 L12 14 M16 18 V8 a3 3 0 0 0 -3 -3 h-1" />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M6 9 a6 5 0 0 1 11 -1 a4 4 0 0 1 1 8 H7 a4 4 0 0 1 -1 -7 Z" />
      <path d="M8 19 L7 22 M12 19 L11 22 M16 19 L15 22" />
    </svg>
  ),
  vol: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M3 9 H8 L14 4 V20 L8 15 H3 Z" />
      <path d="M17 8 a5 5 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6 4 H9 V20 H6 Z M20 4 L10 12 L20 20 Z" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M15 4 H18 V20 H15 Z M4 4 L14 12 L4 20 Z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2 L14.6 8.6 L22 9.3 L16.5 14 L18.2 21.5 L12 17.6 L5.8 21.5 L7.5 14 L2 9.3 L9.4 8.6 Z" />
    </svg>
  ),
};
