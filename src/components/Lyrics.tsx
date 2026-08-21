/* ============================================================
   PAROLES — Visionneuse façon Visual Novel (bulle de dialogue)
   avec machine à écrire, défilement auto et traduction FR.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { LYRICS, LYRICS_FLAT } from "../data";
import { engine } from "../audio/engine";
import { prefersReduced, Scramble } from "../hooks";
import { Icons } from "./Effects";

const TRAD: Record<string, string> = {
  "Where have you been?": "Où étais-tu passé ?",
  "I've been searching for you": "Je t'ai cherché partout",
  "There was a time": "Il fut un temps",
  "When your voice was all I heard": "Où ta voix était tout ce que j'entendais",
  "Where do I begin?": "Par où commencer ?",
  "Should I even try to break down": "Devrais-je seulement essayer de briser",
  "The walls around your heart?": "Les murs autour de ton cœur ?",
  "I don't know anymore": "Je ne sais même plus",
  "All the things I say": "Tout ce que je dis",
  "All the things I do": "Tout ce que je fais",
  "All these masks I wear": "Tous ces masques que je porte",
  "I hope they fool you": "J'espère qu'ils te trompent",
  "But when I'm alone": "Mais quand je suis seul",
  "I take off the disguise": "Je retire le déguisement",
  "Wonder if you'd recognize me": "Me reconnaîtrais-tu",
  "Beneath the mask": "Sous le masque",
  "I've been searching for you…": "Je t'ai cherché partout…",
  "Beneath the mask.": "Sous le masque.",
};

export function Lyrics() {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [typed, setTyped] = useState(0);
  const [showTrad, setShowTrad] = useState(true);
  const lineRef = useRef<HTMLLIElement>(null);

  const line = LYRICS_FLAT[idx];

  /* Machine à écrire */
  useEffect(() => {
    if (prefersReduced()) {
      setTyped(line.line.length);
      return;
    }
    setTyped(0);
    const id = window.setInterval(() => {
      setTyped((t) => {
        if (t >= line.line.length) {
          window.clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 42);
    return () => window.clearInterval(id);
  }, [idx, line.line]);

  /* Avance automatique */
  useEffect(() => {
    if (!auto) return;
    const wait = 2600 + line.line.length * 55;
    const id = window.setTimeout(
      () => setIdx((i) => (i + 1) % LYRICS_FLAT.length),
      wait
    );
    return () => window.clearTimeout(id);
  }, [auto, idx, line.line]);

  /* Auto-scroll de la liste (ignoré au tout premier rendu pour ne
     pas déplacer la page au chargement) */
  const firstScroll = useRef(true);
  useEffect(() => {
    if (firstScroll.current) {
      firstScroll.current = false;
      return;
    }
    lineRef.current?.scrollIntoView({
      block: "center",
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  }, [idx]);

  let flatCursor = -1;

  return (
    <section id="paroles" className="slash-stripes relative bg-[var(--p5-ink)] py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-[var(--p5-red)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* En-tête de section */}
        <div className="reveal mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-type text-xs uppercase tracking-[0.3em] text-[var(--p5-red)]">
              02 — Lyrics Viewer
            </p>
            <h2 className="headline-skew mt-2 text-5xl text-white sm:text-7xl">
              <Scramble text="PAROLES" />
              <span className="text-[var(--p5-red)]">_</span>
            </h2>
          </div>
          <p className="max-w-sm border-l-4 border-[var(--p5-red)] pl-4 font-type text-sm leading-relaxed text-white/60">
            Les mots de Lyn défilent dans la bulle, comme une nuit de
            confession sous la pluie. Extrait — © Shoji Meguro / ATLUS.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* ---- Bulle de dialogue VN ---- */}
          <div className="reveal flex flex-col" style={{ "--rd": "80ms" } as React.CSSProperties}>
            <div className="p5-panel scanlines relative flex min-h-[340px] flex-col p-6 sm:p-8">
              {/* Onglet supérieur */}
              <div className="absolute -top-4 left-6 flex gap-2">
                <span className="clip-tag bg-[var(--p5-red)] px-4 py-1 font-display text-xs uppercase tracking-widest text-white">
                  S.E.S — Lyrics Link
                </span>
                <span className="clip-tag hidden bg-white px-4 py-1 font-display text-xs uppercase tracking-widest text-black sm:block">
                  Vocal : Lyn
                </span>
              </div>

              <div className="mt-4 flex items-start gap-4">
                {/* Avatar */}
                <div className="hidden shrink-0 sm:block">
                  <div className="clip-blade flex h-20 w-20 items-center justify-center bg-[var(--p5-red)]">
                    <span className="font-display text-3xl text-white" style={{ transform: "skewX(8deg)" }}>
                      ♪
                    </span>
                  </div>
                  <p className="mt-2 text-center font-display text-[11px] uppercase tracking-widest text-white/60">
                    Lyn
                  </p>
                </div>

                {/* Ligne tapée */}
                <div className="min-h-[120px] flex-1">
                  <p className="font-type text-2xl leading-snug text-white sm:text-3xl">
                    {line.line.slice(0, typed)}
                    <span className="caret text-[var(--p5-red)]">▌</span>
                  </p>
                  {showTrad && typed >= line.line.length && (
                    <p className="mt-3 inline-block border-l-2 border-[var(--p5-red)] pl-3 text-sm italic text-white/55">
                      {TRAD[line.line] ?? ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Jauge de progression des lignes */}
              <div className="mt-auto flex items-center gap-[3px] pt-6">
                {LYRICS_FLAT.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Aller à la ligne ${i + 1}`}
                    onClick={() => {
                      engine.uiClick("tick");
                      setIdx(i);
                    }}
                    className="h-2 flex-1 -skew-x-12 transition-colors"
                    style={{
                      background:
                        i < idx ? "var(--p5-red)" : i === idx ? "var(--p5-white)" : "var(--p5-steel)",
                    }}
                  />
                ))}
              </div>

              {/* Contrôles */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    className="btn-sq h-10 w-10"
                    aria-label="Ligne précédente"
                    onClick={() => {
                      engine.uiClick("tick");
                      setIdx((i) => (i - 1 + LYRICS_FLAT.length) % LYRICS_FLAT.length);
                    }}
                  >
                    {Icons.prev}
                  </button>
                  <button
                    className="btn-sq h-10 w-10"
                    aria-label="Ligne suivante"
                    onClick={() => {
                      engine.uiClick("tick");
                      setIdx((i) => (i + 1) % LYRICS_FLAT.length);
                    }}
                  >
                    {Icons.next}
                  </button>
                  <button
                    className={`btn-sq h-10 px-4 font-display text-xs uppercase tracking-widest ${auto ? "is-on" : ""}`}
                    onClick={() => {
                      engine.uiClick("tick");
                      setAuto((a) => !a);
                    }}
                  >
                    <span>Auto {auto ? "ON" : "OFF"}</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="font-type text-xs uppercase tracking-widest text-white/60 underline decoration-[var(--p5-red)] underline-offset-4 transition hover:text-white"
                    onClick={() => setShowTrad((s) => !s)}
                  >
                    Trad FR {showTrad ? "✓" : "×"}
                  </button>
                  <span className="font-display text-sm tracking-widest text-[var(--p5-red)]">
                    {String(idx + 1).padStart(2, "0")} / {LYRICS_FLAT.length}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 font-type text-[11px] uppercase tracking-widest text-white/40">
              ▼ Astuce : lancez le lecteur en bas de page pour l'ambiance complète.
            </p>
          </div>

          {/* ---- Liste complète des paroles ---- */}
          <div className="reveal reveal-r" style={{ "--rd": "160ms" } as React.CSSProperties}>
            <div className="p5-panel max-h-[520px] overflow-y-auto p-6 sm:p-8">
              <ul className="space-y-7">
                {LYRICS.map((st, si) => (
                  <li key={si}>
                    <p className="mb-2 flex items-center gap-3">
                      <span className="clip-tag bg-[var(--p5-red)] px-3 py-0.5 font-display text-[10px] uppercase tracking-[0.25em] text-white">
                        {st.label}
                      </span>
                      <span className="h-[2px] flex-1 bg-white/10" />
                    </p>
                    <ul className="space-y-1.5">
                      {st.lines.map((l) => {
                        flatCursor++;
                        const isActive = flatCursor === idx;
                        const isPast = flatCursor < idx;
                        return (
                          <li
                            key={l + flatCursor}
                            ref={flatCursor === idx ? lineRef : undefined}
                          >
                            <button
                              onClick={() => {
                                engine.uiClick("tick");
                                setIdx(flatCursor);
                              }}
                              className={`w-full text-left font-type text-base transition-all duration-200 sm:text-lg ${
                                isActive
                                  ? "bg-[var(--p5-red)] px-3 py-1 font-bold text-white"
                                  : isPast
                                    ? "px-3 py-1 text-white/35"
                                    : "px-3 py-1 text-white/75 hover:bg-white/5 hover:text-white"
                              }`}
                              style={isActive ? { transform: "skewX(-4deg)" } : undefined}
                            >
                              {isActive && <span className="mr-2 text-black">▶</span>}
                              {l}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
