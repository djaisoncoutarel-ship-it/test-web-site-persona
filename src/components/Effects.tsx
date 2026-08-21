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
/* ============================================================
   SCÈNES VECTORIELLES — 100 % locales, aucun asset externe
   ============================================================ */

/* --- Rue pluvieuse de Tokyo (Hero) --- */
export function RainyStreetScene({ className }: { className?: string }) {
  const buildings: [number, number, number][] = [
    [0, 210, 450], [210, 150, 520], [360, 190, 390], [550, 140, 470],
    [690, 220, 350], [910, 160, 500], [1070, 200, 420], [1270, 150, 540], [1420, 180, 400],
  ];
  const windows: [number, number][] = [];
  buildings.forEach(([bx, bw, bh]) => {
    for (let x = bx + 22; x < bx + bw - 24; x += 46) {
      for (let y = 640 - bh + 30; y < 600; y += 64) {
        if ((x * 7 + y * 13) % 5 < 2) windows.push([x, y]);
      }
    }
  });
  const umbrellas: [number, number, number][] = [
    [250, 618, 1.1], [480, 648, 0.78], [770, 600, 1.32],
    [1020, 640, 0.95], [1240, 610, 1.18], [1440, 655, 0.7],
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="rs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040404" />
          <stop offset="0.6" stopColor="#0c0a0b" />
          <stop offset="1" stopColor="#191014" />
        </linearGradient>
        <linearGradient id="rs-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171216" />
          <stop offset="1" stopColor="#090809" />
        </linearGradient>
        <radialGradient id="rs-neon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e60012" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e60012" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rs-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7d" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffcf7d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#rs-sky)" />

      {/* immeubles */}
      {buildings.map(([x, w, h], i) => (
        <rect key={i} x={x} y={640 - h} width={w} height={h} fill={i % 2 ? "#0d0c0e" : "#0a090b"} />
      ))}
      {windows.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={13} height={18} fill={i % 7 === 0 ? "#8a6a3a" : "#3d3326"} opacity={i % 7 === 0 ? 0.8 : 0.5} />
      ))}

      {/* enseignes néon */}
      <ellipse cx="1150" cy="330" rx="220" ry="260" fill="url(#rs-neon)" />
      <rect x="1128" y="190" width="44" height="290" fill="#e60012" opacity="0.92" transform="skewY(-2)" />
      <rect x="1136" y="206" width="28" height="258" fill="#ff4a52" opacity="0.35" />
      <ellipse cx="330" cy="190" rx="200" ry="90" fill="url(#rs-neon)" opacity="0.7" />
      <rect x="240" y="168" width="190" height="42" fill="#e60012" opacity="0.85" transform="skewX(-8)" />
      <circle cx="640" cy="250" r="34" fill="#e60012" opacity="0.75" />
      <circle cx="640" cy="250" r="52" fill="url(#rs-neon)" />

      {/* route */}
      <rect x="0" y="640" width="1600" height="260" fill="url(#rs-road)" />
      <ellipse cx="1150" cy="780" rx="400" ry="130" fill="url(#rs-neon)" />
      <ellipse cx="620" cy="820" rx="300" ry="90" fill="url(#rs-lamp)" />

      {/* passage piéton */}
      <g fill="#2b2b30" opacity="0.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={180 + i * 210} y="700" width="52" height="170" transform={`skewX(-34) translate(${i * 4} 0)`} />
        ))}
      </g>

      {/* lampadaire */}
      <rect x="616" y="330" width="8" height="310" fill="#050505" />
      <path d="M620 330 q0 -26 34 -26 h40" stroke="#050505" strokeWidth="8" fill="none" />
      <circle cx="700" cy="304" r="10" fill="#ffcf7d" />
      <ellipse cx="700" cy="310" rx="60" ry="40" fill="url(#rs-lamp)" />

      {/* feu rouge */}
      <rect x="1330" y="420" width="10" height="220" fill="#050505" />
      <rect x="1312" y="368" width="46" height="76" rx="8" fill="#0a0a0a" stroke="#1e1e1e" strokeWidth="3" />
      <circle cx="1335" cy="394" r="13" fill="#e60012" />
      <ellipse cx="1335" cy="394" rx="46" ry="34" fill="url(#rs-neon)" />

      {/* silhouettes aux parapluies */}
      {umbrellas.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            d="M-74 0 A74 54 0 0 1 74 0 L64 -7 L48 3 L32 -8 L16 3 L0 -8 L-16 3 L-32 -8 L-48 3 L-64 -7 Z"
            fill="#020202"
            stroke="#26222a"
            strokeWidth="2"
          />
          <rect x="-2.5" y="-4" width="5" height="66" fill="#020202" />
          <path d="M-2 62 q0 12 12 12" stroke="#020202" strokeWidth="5" fill="none" />
          <path d="M-18 2 q18 30 36 0 l8 96 q-26 16 -52 0 Z" fill="#050405" />
        </g>
      ))}
    </svg>
  );
}

/* --- Intérieur du Café Leblanc, un soir de pluie --- */
export function LeblancScene({ className, label }: { className?: string; label?: string }) {
  const jars: [number, string][] = [
    [800, "#7a5a2e"], [852, "#4a3a28"], [904, "#8a6a3a"], [956, "#5a4630"], [1008, "#6e522e"],
  ];
  return (
    <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={label ?? "L'intérieur chaleureux du Café Leblanc, un soir de pluie"} focusable="false">
      <defs>
        <radialGradient id="lb-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7d" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffcf7d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lb-brew" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0a44a" />
          <stop offset="1" stopColor="#9c6420" />
        </linearGradient>
        <linearGradient id="lb-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120d09" />
          <stop offset="1" stopColor="#0b0806" />
        </linearGradient>
      </defs>

      {/* mur en planches */}
      <rect width="1200" height="900" fill="url(#lb-wall)" />
      <g stroke="#1d140c" strokeWidth="3">
        {[90, 180, 270, 360, 450, 540, 630, 720, 810, 900, 990, 1080].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="620" />
        ))}
      </g>

      {/* ardoise menu */}
      <rect x="90" y="120" width="270" height="350" fill="#151009" stroke="#3a2c1a" strokeWidth="8" />
      <g stroke="#cfc4ae" strokeWidth="4" strokeLinecap="round" opacity="0.5" fill="none">
        <path d="M120 175 q60 -12 120 0 t90 4" />
        <path d="M120 225 q50 -8 100 0" />
        <path d="M120 268 q70 -10 140 0 t60 6" />
        <path d="M120 312 q45 -8 90 0" />
        <path d="M120 356 q65 -10 130 0" />
      </g>
      <path d="M118 415 l90 -6" stroke="#e60012" strokeWidth="6" strokeLinecap="round" />
      <path d="M300 165 l10 22 24 3 -18 16 5 24 -21 -12 -21 12 5 -24 -18 -16 24 -3 Z" fill="#e60012" />

      {/* fenêtre sous la pluie */}
      <rect x="460" y="90" width="310" height="330" fill="#0a1017" stroke="#26190d" strokeWidth="14" />
      <ellipse cx="700" cy="160" rx="46" ry="40" fill="#2c3a48" opacity="0.7" />
      <g stroke="#5a6c7c" strokeWidth="3" opacity="0.55" strokeLinecap="round">
        {[490, 520, 555, 590, 625, 660, 695, 730].map((x, i) => (
          <line key={x} x1={x + 26} y1={100 + (i % 3) * 18} x2={x - 12} y2={250 + (i % 4) * 30} />
        ))}
      </g>
      <line x1="615" y1="90" x2="615" y2="420" stroke="#26190d" strokeWidth="10" />
      <line x1="460" y1="255" x2="770" y2="255" stroke="#26190d" strokeWidth="10" />

      {/* étagères & pots */}
      {[140, 250].map((y) => (
        <rect key={y} x="790" y={y} width="330" height="12" fill="#2b1d10" />
      ))}
      {jars.map(([x, c], i) => (
        <g key={x}>
          <rect x={x} y={i % 2 ? 190 : 84} width="42" height="56" rx="7" fill={c} />
          <rect x={x + 6} y={i % 2 ? 182 : 76} width="30" height="12" rx="4" fill="#1a120a" />
        </g>
      ))}

      {/* lampes suspendues */}
      {[250, 620, 960].map((x) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="170" stroke="#050302" strokeWidth="5" />
          <path d={`M${x - 44} 214 L${x + 44} 214 L${x + 18} 168 L${x - 18} 168 Z`} fill="#191007" stroke="#6e4e22" strokeWidth="3" />
          <circle cx={x} cy="222" r="9" fill="#ffcf7d" />
          <ellipse cx={x} cy="260" rx="150" ry="110" fill="url(#lb-lamp)" />
        </g>
      ))}

      {/* comptoir */}
      <rect x="0" y="620" width="1200" height="280" fill="#21150a" />
      <g stroke="#2e1e0f" strokeWidth="4">
        {[140, 320, 500, 680, 860, 1040].map((x) => (
          <line key={x} x1={x} y1="650" x2={x} y2="900" />
        ))}
      </g>
      <rect x="0" y="598" width="1200" height="30" fill="#3a2712" />
      <rect x="0" y="598" width="1200" height="5" fill="#c98f45" opacity="0.5" />
      <path d="M1120 700 l12 26 28 4 -20 19 5 28 -25 -14 -25 14 5 -28 -20 -19 28 -4 Z" fill="#e60012" opacity="0.85" />

      {/* siphon à café */}
      <g>
        <line x1="360" y1="598" x2="360" y2="520" stroke="#0d0805" strokeWidth="7" />
        <line x1="440" y1="598" x2="440" y2="520" stroke="#0d0805" strokeWidth="7" />
        <rect x="352" y="512" width="96" height="12" rx="4" fill="#0d0805" />
        <circle cx="400" cy="560" r="42" fill="url(#lb-brew)" stroke="#d9c9a8" strokeWidth="3" opacity="0.95" />
        <path d="M372 540 a34 34 0 0 1 20 -14" stroke="#f5e6c4" strokeWidth="5" fill="none" opacity="0.6" strokeLinecap="round" />
        <path d="M378 520 L400 452 L422 520 Z" fill="#3a3226" opacity="0.85" stroke="#d9c9a8" strokeWidth="2" />
        <rect x="394" y="506" width="12" height="22" fill="#d9c9a8" opacity="0.5" />
        <circle cx="400" cy="594" r="6" fill="#ff7a3d" />
        <ellipse cx="400" cy="594" rx="26" ry="14" fill="#ff7a3d" opacity="0.25" />
        <path className="steam" d="M398 446 q-8 -16 2 -30 q10 -14 2 -28" stroke="#e8ddc6" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* tasse fumante */}
      <g>
        <ellipse cx="580" cy="598" rx="40" ry="9" fill="#d9cbb0" />
        <path d="M552 560 h56 v18 a28 20 0 0 1 -56 0 Z" fill="#efe6d2" />
        <rect x="552" y="566" width="56" height="8" fill="#e60012" />
        <path className="steam" d="M572 548 q-8 -14 2 -26 q8 -12 0 -24" stroke="#e8ddc6" strokeWidth="4" fill="none" strokeLinecap="round" style={{ animationDelay: "0.9s" }} />
        <path className="steam" d="M590 548 q8 -14 -2 -26" stroke="#e8ddc6" strokeWidth="3" fill="none" strokeLinecap="round" style={{ animationDelay: "1.6s" }} />
      </g>

      {/* Morgana endormi sur son tabouret */}
      <g>
        <ellipse cx="900" cy="640" rx="70" ry="14" fill="#171007" />
        <line x1="860" y1="648" x2="846" y2="760" stroke="#171007" strokeWidth="9" />
        <line x1="940" y1="648" x2="954" y2="760" stroke="#171007" strokeWidth="9" />
        <path d="M830 636 q4 -46 40 -58 q10 -16 26 -18 l-4 -18 16 12 12 -10 2 16 q26 6 30 30 q20 14 16 46 Z" fill="#020202" />
        <path d="M832 640 q-26 6 -30 -14 q-2 -12 8 -16" stroke="#020202" strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="890" cy="616" rx="14" ry="18" fill="#e8e0d0" />
        <path d="M868 588 q6 5 12 0" stroke="#c8b45a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M900 586 q6 5 12 0" stroke="#c8b45a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* flacon rouge décoratif */}
      <rect x="1040" y="540" width="26" height="58" rx="6" fill="#8a1018" />
      <rect x="1047" y="528" width="12" height="14" fill="#1a120a" />
    </svg>
  );
}

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
