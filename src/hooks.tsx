/* ============================================================
   Hooks & petits composants partagés
   ============================================================ */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { engine, LOOP_TOTAL, type Position, type SourceMode } from "./audio/engine";

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Révélation brutale au scroll (IntersectionObserver) ---------- */
export function useRevealAll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (prefersReduced()) {
      els.forEach((el) => el.classList.add("on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- Titre "décodage" façon glitch Persona ---------- */
const GLYPHS = "█▓▒░<>/\\#%&$@!?";

export function Scramble({
  text,
  className = "",
  children,
}: {
  text: string;
  className?: string;
  children?: ReactNode;
}) {
  const [out, setOut] = useState(() => (prefersReduced() ? text : ""));
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (prefersReduced()) {
      setOut(text);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const step = () => {
          frame++;
          const solved = Math.floor(frame / 2);
          const s = text
            .split("")
            .map((c, i) =>
              c === " " || i < solved
                ? c
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            )
            .join("");
          setOut(s);
          if (solved <= text.length) raf = requestAnimationFrame(step);
          else setOut(text);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || "\u00A0"}
      {children}
    </span>
  );
}

/* ---------- État global du lecteur ---------- */
export interface PlayerState {
  playing: boolean;
  started: boolean;
  loop: boolean;
  rain: boolean;
  volume: number;
  mode: SourceMode;
  mp3Ready: boolean;
}

export function usePlayer() {
  const [state, setState] = useState<PlayerState>({
    playing: engine.playing,
    started: engine.started,
    loop: engine.loop,
    rain: engine.rainOn,
    volume: engine.volume,
    mode: engine.mode,
    mp3Ready: engine.mp3Ready,
  });
  const [pos, setPos] = useState<Position>({ current: 0, total: LOOP_TOTAL });

  useEffect(() => {
    const sync = () => {
      setPos(engine.getPosition());
      setState({
        playing: engine.playing,
        started: engine.started,
        loop: engine.loop,
        rain: engine.rainOn,
        volume: engine.volume,
        mode: engine.mode,
        mp3Ready: engine.mp3Ready,
      });
    };
    const id = window.setInterval(sync, 200);
    return () => window.clearInterval(id);
  }, []);

  return {
    state,
    pos,
    togglePlay: () => {
      engine.uiClick(engine.playing ? "tick" : "confirm");
      engine.toggle();
    },
    setVolume: (v: number) => engine.setVolume(v),
    toggleLoop: () => {
      engine.uiClick("tick");
      engine.setLoop(!engine.loop);
    },
    toggleRain: () => {
      engine.uiClick("confirm");
      engine.setRain(!engine.rainOn);
    },
    seek: (frac: number) => engine.seek(frac),
  };
}
