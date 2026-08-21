/* ============================================================
   THE PHANTOM LOUNGE — cartes de l'équipe avec effet
   "Calling Card" au survol (flip 3D + flash rouge)
   ============================================================ */
import { THIEVES } from "../data";
import { engine } from "../audio/engine";
import { Scramble } from "../hooks";
import { ArcanaMask } from "./Effects";

export function Lounge() {
  return (
    <section id="lounge" className="slash-stripes relative bg-[var(--p5-ink)] py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-10 h-[calc(100%-5rem)] w-2 bg-[var(--p5-red)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="reveal mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-type text-xs uppercase tracking-[0.3em] text-[var(--p5-red)]">
              04 — The Phantom Lounge
            </p>
            <h2 className="headline-skew mt-2 text-5xl text-white sm:text-7xl">
              <Scramble text="VOLEURS FANTÔMES" />
            </h2>
          </div>
          <p className="max-w-sm border-l-4 border-[var(--p5-red)] pl-4 font-type text-sm leading-relaxed text-white/60">
            Huit cœurs, huit arcanes. Survolez une carte — la face cachée
            ressemble toujours à un avertissement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {THIEVES.map((t, i) => (
            <div
              key={t.id}
              className="reveal flip-card h-[400px] cursor-pointer outline-none"
              style={{ "--rd": `${(i % 4) * 90}ms` } as React.CSSProperties}
              tabIndex={0}
              role="button"
              aria-label={`${t.codename} — ${t.arcana}. Retourner la carte.`}
              onClick={() => engine.uiClick("tick")}
            >
              <div className="flip-inner">
                {/* ---- RECTO : carte de membre ---- */}
                <div className="flip-face flex flex-col border-2 border-white/15 bg-black p-5 transition-colors hover:border-[var(--p5-red)]">
                  <div
                    className="absolute left-0 top-0 h-2 w-full"
                    style={{ background: t.accent }}
                  />
                  <div className="flex items-start justify-between">
                    <span
                      className="font-display text-6xl leading-none text-stroke opacity-80"
                      aria-hidden="true"
                    >
                      {t.numeral}
                    </span>
                    <div className="h-14 w-14 opacity-90">
                      <ArcanaMask accent={t.accent} />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="font-type text-[10px] uppercase tracking-[0.3em] text-white/45">
                      Arcane {t.numeral} — {t.arcana}
                    </p>
                    <h3
                      className="mt-1 font-display text-4xl uppercase leading-none text-white"
                      style={{ transform: "skewX(-6deg)" }}
                    >
                      {t.codename}
                    </h3>
                    <p className="mt-1 font-type text-xs text-[var(--p5-red)]">{t.real}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">{t.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="clip-tag px-3 py-0.5 font-display text-[10px] uppercase tracking-widest text-black"
                        style={{ background: t.accent }}
                      >
                        {t.role}
                      </span>
                      <span className="font-type text-[10px] uppercase tracking-widest text-white/40">
                        survoler ↺
                      </span>
                    </div>
                  </div>
                </div>

                {/* ---- VERSO : calling card ---- */}
                <div className="flip-back flex flex-col bg-[var(--p5-paper)] p-5 text-black">
                  <div className="flex items-center justify-between border-b-4 border-black pb-2">
                    <span className="font-display text-xs uppercase tracking-[0.25em]">Calling Card</span>
                    <span className="font-display text-xs uppercase text-[var(--p5-red)]">N° {t.numeral}</span>
                  </div>
                  <p className="mt-4 font-type text-[11px] uppercase tracking-widest">À l'attention de</p>
                  <p className="font-display text-3xl uppercase leading-none" style={{ transform: "skewX(-5deg)" }}>
                    {t.codename}
                  </p>
                  <p className="mt-5 flex-1 font-type text-lg leading-snug" style={{ transform: "rotate(-1.5deg)" }}>
                    « {t.quote} »
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="font-type text-xs italic">— Les Voleurs Fantômes</p>
                    <span
                      className="stamp px-2 py-0.5 text-sm"
                      style={{ animation: "none", opacity: 0.9 }}
                    >
                      Take your time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau d'appel */}
        <div className="reveal mt-14 flex flex-wrap items-center justify-between gap-6 border-2 border-white/15 bg-black p-6 sm:p-8">
          <div>
            <p className="font-display text-2xl uppercase text-white sm:text-3xl" style={{ transform: "skewX(-6deg)" }}>
              Un cœur corrompu à signaler ?
            </p>
            <p className="mt-1 font-type text-sm text-white/55">
              Rédigez votre propre avertissement — le prochain chapitre est fait pour ça.
            </p>
          </div>
          <a href="#carte" className="btn-p5 px-6 py-3 text-base" onClick={() => engine.uiClick("confirm")}>
            <span>
              Forger ma Calling Card
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M4 11 H16 L11 6 L13 4 L22 12 L13 20 L11 18 L16 13 H4 Z" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
