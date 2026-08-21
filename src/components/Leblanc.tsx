/* ============================================================
   CAFÉ LEBLANC — ambiance, widget météo pluvieuse,
   recette interactive (café / curry de Sojiro)
   ============================================================ */
import { useState } from "react";
import { RECIPES, WEATHER } from "../data";
import { engine } from "../audio/engine";
import { prefersReduced, Scramble } from "../hooks";
import { Icons } from "./Effects";

/* Pluie SVG animée (SMIL — aucune CSS nécessaire) */
function WidgetRain({ intensity }: { intensity: number }) {
  const count = 8 + intensity * 6;
  const reduced = prefersReduced();
  return (
    <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 37) % 100;
        const dur = 0.7 + ((i * 13) % 10) / 12;
        return (
          <line
            key={i}
            x1={x}
            y1={-8}
            x2={x - 3}
            y2={2}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.1"
          >
            {!reduced && (
              <animate
                attributeName="y1"
                values="-8;60"
                dur={`${dur / intensity}s`}
                begin={`${(i % 7) * 0.13}s`}
                repeatCount="indefinite"
              />
            )}
            {!reduced && (
              <animate
                attributeName="y2"
                values="2;70"
                dur={`${dur / intensity}s`}
                begin={`${(i % 7) * 0.13}s`}
                repeatCount="indefinite"
              />
            )}
          </line>
        );
      })}
    </svg>
  );
}

export function Leblanc({ rain }: { rain: boolean }) {
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [tab, setTab] = useState<"cafe" | "curry">("cafe");
  const [done, setDone] = useState(0);

  /* Le mode pluie global force au moins une averse */
  const effIdx = rain ? Math.max(weatherIdx, 1) : weatherIdx;
  const w = WEATHER[effIdx];
  const recipe = RECIPES[tab];
  const finished = done >= recipe.steps.length;

  const resetRecipe = () => {
    engine.uiClick("tick");
    setDone(0);
  };

  return (
    <section id="leblanc" className="relative bg-black py-24 sm:py-32">
      {/* Grande diagonale rouge de fond */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-[0.05]"
        style={{ background: "var(--p5-red)", transform: "skewX(-14deg) scaleX(1.6)" }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="reveal mb-14">
          <p className="font-type text-xs uppercase tracking-[0.3em] text-[var(--p5-red)]">
            03 — Café Leblanc Experience
          </p>
          <h2 className="headline-skew mt-2 text-5xl text-white sm:text-7xl">
            <Scramble text="CAFÉ LEBLANC" />
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Un comptoir de bois, un siphon qui gargouille, un chat qui dort.
            Le Leblanc n'est pas un café — c'est le quartier général des cœurs
            fatigués, quelque part dans les ruelles de Yongenjaya.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* -------- Colonne gauche : image + carte du soir -------- */}
          <div className="space-y-8">
            <div className="reveal p5-panel relative overflow-hidden">
              <div className="overflow-hidden">
                <img
                  src="https://image.qwenlm.ai/generated-images/d3984ec5-e685-4a93-8435-ae31f87e5cf9/_result.png"
                  alt="L'intérieur chaleureux du Café Leblanc, un soir de pluie"
                  className="kenburns h-72 w-full object-cover sm:h-96"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black via-black/60 to-transparent p-5 pt-16">
                <div>
                  <p className="font-display text-2xl uppercase text-white" style={{ transform: "skewX(-6deg)" }}>
                    Yongenjaya, <span className="text-[var(--p5-red)]">Tokyo</span>
                  </p>
                  <p className="font-type text-xs uppercase tracking-widest text-white/60">
                    Ouvert quand il pleut — c'est-à-dire souvent
                  </p>
                </div>
                <span className="clip-tag bg-[var(--p5-red)] px-3 py-1 font-display text-xs uppercase text-white">
                  {w.name}
                </span>
              </div>
            </div>

            {/* Menu du soir */}
            <div className="reveal p5-panel p-6 sm:p-8" style={{ "--rd": "100ms" } as React.CSSProperties}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-2xl uppercase text-white" style={{ transform: "skewX(-6deg)" }}>
                  La carte du soir
                </h3>
                <span className="font-type text-xs uppercase tracking-widest text-white/40">sojiro's picks</span>
              </div>
              <ul className="space-y-3 text-sm sm:text-base">
                {[
                  ["Café Leblanc — blend du patron", "¥500"],
                  ["Curry du chef, œuf mollet", "¥800"],
                  ["Thé glacé au comptoir", "¥400"],
                  ["Conseil de vie non sollicité", "Offert"],
                ].map(([name, price]) => (
                  <li key={name} className="group flex items-baseline">
                    <span className="font-type text-white/85 transition group-hover:text-white">{name}</span>
                    <span className="dot-leader" />
                    <span className="font-display text-[var(--p5-red)]">{price}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/10 pt-4 font-type text-xs italic text-white/45">
                « Un bon café, c'est 80 % de patience et 20 % de mystère. » — Sojiro Sakura
              </p>
            </div>
          </div>

          {/* -------- Colonne droite : météo + recette -------- */}
          <div className="space-y-8">
            {/* Widget météo pluvieuse */}
            <div className="reveal reveal-r p5-panel overflow-hidden">
              <div className="relative h-36 overflow-hidden bg-[#0a141c]">
                <div className="halftone absolute inset-0 opacity-30" />
                <WidgetRain intensity={w.intensity} />
                {w.intensity === 3 && (
                  <div
                    className="absolute inset-0 bg-white opacity-0"
                    style={{ animation: prefersReduced() ? "none" : "hardFlash 6s steps(1) infinite", animationDelay: "2s" }}
                  />
                )}
                <div className="absolute bottom-3 left-4">
                  <p className="font-display text-4xl text-white" style={{ transform: "skewX(-6deg)" }}>
                    {w.temp}°C
                  </p>
                </div>
                <div className="absolute right-4 top-3 text-right">
                  <p className="font-display text-sm uppercase tracking-widest text-[var(--p5-red)]">{w.name}</p>
                  <p className="font-type text-[10px] uppercase tracking-widest text-white/50">Yongenjaya — 23:47</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="font-type text-xs text-white/60">
                  <p>Humidité {w.humidity}% · Vent {w.wind}</p>
                  <p className="mt-1 italic text-white/45">{w.vibe}</p>
                </div>
                <button
                  className="btn-sq h-11 shrink-0 px-4 font-display text-[11px] uppercase tracking-widest"
                  onClick={() => {
                    engine.uiClick("tick");
                    setWeatherIdx((i) => (i + 1) % WEATHER.length);
                  }}
                >
                  <span>
                    {Icons.rain}
                    Changer la nuit
                  </span>
                </button>
              </div>
            </div>

            {/* Recette interactive */}
            <div className="reveal reveal-r p5-panel p-6 sm:p-7" style={{ "--rd": "120ms" } as React.CSSProperties}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {(["cafe", "curry"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        engine.uiClick("tick");
                        setTab(k);
                        setDone(0);
                      }}
                      className={`px-4 py-2 font-display text-xs uppercase tracking-widest transition-all sm:text-sm ${
                        tab === k
                          ? "-skew-x-6 bg-[var(--p5-red)] text-white"
                          : "-skew-x-6 bg-[var(--p5-steel)] text-white/60 hover:text-white"
                      }`}
                    >
                      {k === "cafe" ? "☕ Café" : "🍛 Curry"}
                    </button>
                  ))}
                </div>
                <span className="font-display text-lg text-[var(--p5-red)]">{recipe.price}</span>
              </div>

              <p className="mb-4 font-type text-sm italic text-white/60">{recipe.tagline}</p>

              {/* Progression */}
              <div className="prog-track mb-5">
                <div
                  className="prog-fill"
                  style={{ width: `${(done / recipe.steps.length) * 100}%` }}
                />
              </div>

              <ol className="space-y-2">
                {recipe.steps.map((s, i) => {
                  const isDone = i < done;
                  const isNext = i === done;
                  return (
                    <li key={s.title}>
                      <button
                        onClick={() => {
                          engine.uiClick("tick");
                          setDone(i >= done ? i + 1 : i);
                        }}
                        className={`group w-full border-2 p-3 text-left transition-all ${
                          isDone
                            ? "border-[var(--p5-red)] bg-[var(--p5-red)]/10"
                            : isNext
                              ? "border-white bg-white/5"
                              : "border-white/10 opacity-50 hover:opacity-80"
                        }`}
                        style={{ transform: isNext ? "skewX(-2deg)" : undefined }}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center font-display text-xs ${
                              isDone ? "bg-[var(--p5-red)] text-white" : "bg-[var(--p5-steel)] text-white/70"
                            }`}
                          >
                            {isDone ? "✓" : i + 1}
                          </span>
                          <span>
                            <span className={`font-display text-sm uppercase tracking-wide sm:text-base ${isDone ? "text-[var(--p5-red)]" : "text-white"}`}>
                              {s.title}
                            </span>
                            <span className={`block font-type text-xs leading-relaxed text-white/55 ${isNext ? "text-white/75" : ""}`}>
                              {s.detail}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 flex items-center justify-between gap-4">
                {finished ? (
                  <>
                    <div className="relative">
                      <span className="stamp px-4 py-1 text-xl">Servi !</span>
                      <div className="steam pointer-events-none absolute -top-2 left-1/2 h-16 w-10">
                        <span style={{ left: "10%", animationDelay: "0s" }} />
                        <span style={{ left: "45%", animationDelay: "0.7s" }} />
                        <span style={{ left: "78%", animationDelay: "1.3s" }} />
                      </div>
                    </div>
                    <button className="btn-ghost px-5 py-2 text-sm" onClick={resetRecipe}>
                      <span>Recommencer</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-type text-xs uppercase tracking-widest text-white/45">
                      Étape {Math.min(done + 1, recipe.steps.length)} / {recipe.steps.length}
                    </p>
                    <button
                      className="btn-p5 px-5 py-2 text-sm"
                      onClick={() => {
                        engine.uiClick("confirm");
                        setDone((d) => Math.min(recipe.steps.length, d + 1));
                      }}
                    >
                      <span>
                        Étape suivante
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                          <path d="M4 11 H16 L11 6 L13 4 L22 12 L13 20 L11 18 L16 13 H4 Z" />
                        </svg>
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
