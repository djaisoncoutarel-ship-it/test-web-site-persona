/* ============================================================
   CALLING CARD GENERATOR — lettres découpées façon rançon,
   timbre "ENVOYÉE", secousse et sons d'interface.
   ============================================================ */
import { useMemo, useState } from "react";
import { engine } from "../audio/engine";
import { Scramble } from "../hooks";
import { MaskLogo } from "./Effects";

const PRESETS = [
  { target: "Ma procrastination", message: "Ce soir, je volerai ton empire de « demain » et je rendrai mes nuits à leur vraie propriétaire : moi." },
  { target: "Le réveil du lundi", message: "Tes 6h30 tyranniques prennent fin. Ton cœur appartiendra bientôt au club des grasses matinées." },
  { target: "M. Burnout", message: "Tu as dévoré trop de soirées. Prépare-toi : on vient récupérer chaque minute volée." },
];

interface WordStyle {
  cls: string;
  rot: number;
  size: number;
  dy: number;
}

export function Generator() {
  const [target, setTarget] = useState("Ma procrastination");
  const [message, setMessage] = useState(
    "Ce soir, nous volerons ton empire de remises au lendemain. Ton cœur nous appartient déjà."
  );
  const [signature, setSignature] = useState("Les Voleurs Fantômes de Cœurs");
  const [nonce, setNonce] = useState(0);
  const [sent, setSent] = useState(false);

  /* Styles aléatoires par mot — re-tirés à chaque génération */
  const words = useMemo<WordStyle[]>(() => {
    return message
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(() => ({
        cls: `r${Math.floor(Math.random() * 5)}`,
        rot: Math.round((Math.random() * 16 - 8) * 10) / 10,
        size: Math.round((0.85 + Math.random() * 0.6) * 100) / 100,
        dy: Math.round((Math.random() * 8 - 4) * 10) / 10,
      }));
  }, [message, nonce]);

  const tokens = message.trim().split(/\s+/).filter(Boolean);

  const regenerate = () => {
    engine.uiClick("tick");
    setSent(false);
    setNonce((n) => n + 1);
  };

  const send = () => {
    engine.uiClick("confirm");
    setSent(true);
    window.setTimeout(() => setSent(false), 3200);
  };

  return (
    <section id="carte" className="relative bg-black py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1/4 opacity-[0.05]"
        style={{ background: "var(--p5-red)", transform: "skewX(14deg) scaleX(1.8)" }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="reveal mb-14">
          <p className="font-type text-xs uppercase tracking-[0.3em] text-[var(--p5-red)]">
            05 — Calling Card Generator
          </p>
          <h2 className="headline-skew mt-2 text-5xl text-white sm:text-7xl">
            <Scramble text="FORGE TON AVERTISSEMENT" />
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Dans le Metaverse, rien ne change sans avertissement. Tapez votre
            cible, choisissez vos mots — chaque lettre sera découpée dans un
            journal différent.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          {/* -------- Formulaire -------- */}
          <div className="reveal p5-panel h-fit p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="clip-tag bg-[var(--p5-red)] px-4 py-1 font-display text-xs uppercase tracking-widest text-white">
                Formulaire du voleur
              </span>
              <span className="h-[2px] flex-1 bg-white/10" />
            </div>

            <label className="block">
              <span className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-white/60">
                Cible de la carte
              </span>
              <input
                className="input-p5"
                value={target}
                maxLength={40}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Ex : le voleur de mes nuits"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-white/60">
                Votre avertissement
              </span>
              <textarea
                className="input-p5 min-h-[110px] resize-y"
                value={message}
                maxLength={220}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez la phrase qui sera découpée…"
              />
              <span className="mt-1 block text-right font-type text-[10px] text-white/35">
                {message.length} / 220
              </span>
            </label>

            <label className="mt-2 block">
              <span className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-white/60">
                Signature
              </span>
              <input
                className="input-p5"
                value={signature}
                maxLength={48}
                onChange={(e) => setSignature(e.target.value)}
              />
            </label>

            {/* Presets */}
            <p className="mb-2 mt-6 font-display text-xs uppercase tracking-[0.25em] text-white/60">
              Cibles suggérées
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.target}
                  className="btn-sq px-3 py-2 font-type text-xs"
                  onClick={() => {
                    engine.uiClick("tick");
                    setTarget(p.target);
                    setMessage(p.message);
                    setSent(false);
                    setNonce((n) => n + 1);
                  }}
                >
                  <span>{p.target}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn-ghost px-5 py-3 text-sm" onClick={regenerate}>
                <span>↻ Redécouper les lettres</span>
              </button>
              <button className="btn-p5 px-6 py-3 text-sm" onClick={send} disabled={tokens.length === 0}>
                <span>
                  Envoyer la carte
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M2 12 L22 3 L15 21 L11 14 Z M11 14 L22 3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* -------- Aperçu de la carte -------- */}
          <div className="reveal reveal-r" style={{ "--rd": "120ms" } as React.CSSProperties}>
            <div
              key={nonce + (sent ? "-sent" : "")}
              className={`paper-card relative mx-auto max-w-xl p-7 sm:p-10 ${sent ? "shake" : ""}`}
              style={{ transform: "rotate(-1.2deg)" }}
            >
              {/* En-tête */}
              <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-3">
                <span className="font-display text-sm uppercase tracking-[0.3em]">Avertissement</span>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm uppercase text-[var(--p5-red)]">P5</span>
                  <MaskLogo className="h-7 w-7" />
                </div>
              </div>

              <p className="font-type text-xs uppercase tracking-[0.25em]">À l'attention de</p>
              <p
                className="mt-1 font-display text-3xl uppercase leading-tight sm:text-4xl"
                style={{ transform: "skewX(-4deg)" }}
              >
                {target || "…"}
              </p>

              <p className="mt-6 flex flex-wrap items-baseline text-xl leading-loose">
                {tokens.length === 0 && (
                  <span className="font-type text-base text-black/40">
                    (votre menace apparaîtra ici, lettre par lettre…)
                  </span>
                )}
                {tokens.map((w, i) => {
                  const s = words[i];
                  return (
                    <span
                      key={`${nonce}-${i}`}
                      className={`ransom ${s.cls}`}
                      style={{
                        transform: `rotate(${s.rot}deg) translateY(${s.dy}px)`,
                        fontSize: `${s.size}em`,
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </p>

              <div className="mt-8 flex items-end justify-between gap-4">
                <p className="font-type text-sm italic" style={{ transform: "rotate(-2deg)" }}>
                  — {signature}
                </p>
                <span className="font-type text-[10px] uppercase tracking-widest text-black/50">
                  Nuit de pluie · Yongenjaya
                </span>
              </div>

              {sent && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="stamp bg-[var(--p5-paper)]/60 px-8 py-3 text-5xl">Envoyée ✓</span>
                </div>
              )}
            </div>

            <p className="mt-6 text-center font-type text-xs uppercase tracking-widest text-white/40">
              {sent
                ? "La carte file vers le Palace… le changement est en marche."
                : "Astuce : « Redécouper les lettres » redistribue les polices au hasard."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
