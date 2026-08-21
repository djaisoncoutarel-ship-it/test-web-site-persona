/* ============================================================
   EN-TÊTE — ouverture Persona 5 : HUD, titre glitch, ticker
   ============================================================ */
import { TICKER_ITEMS } from "../data";
import { engine } from "../audio/engine";
import { Icons, MaskLogo, RainyStreetScene } from "./Effects";

export function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <header id="metaverse" className="relative min-h-[100svh] overflow-hidden bg-black">
      {/* Fond : pluie de nuit à Shibuya — scène vectorielle 100 % locale,
          animée en direct par le canvas de pluie */}
      <div className="absolute inset-0">
        <RainyStreetScene className="kenburns h-full w-full opacity-80" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(0,0,0,0.96) 8%, rgba(0,0,0,0.55) 45%, rgba(230,0,18,0.28) 100%)",
          }}
        />
        <div className="halftone absolute inset-0 opacity-40" />
        {/* grandes diagonales rouges */}
        <div
          className="absolute -right-24 top-0 h-[160%] w-40 bg-[var(--p5-red)] opacity-90"
          style={{ transform: "skewX(-16deg)" }}
        />
        <div
          className="absolute -right-8 top-0 h-[160%] w-3 bg-white"
          style={{ transform: "skewX(-16deg)" }}
        />
      </div>

      {/* HUD façon menu P5 */}
      <div className="absolute left-4 top-20 z-10 sm:left-8 sm:top-24">
        <div className="flex items-center gap-2">
          <span className="clip-tag bg-[var(--p5-red)] px-3 py-1 font-display text-xs uppercase tracking-widest text-white sm:text-sm">
            Ven 11/11
          </span>
          <span className="clip-tag bg-black/80 px-3 py-1 font-display text-xs uppercase tracking-widest text-[var(--p5-red)] ring-1 ring-[var(--p5-red)] sm:text-sm">
            Pluie — Nuit
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[var(--p5-red)]">
          <span className="pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--p5-red)]" />
          <span className="font-type text-[11px] uppercase tracking-widest text-white/70">
            Mémentos : instable
          </span>
        </div>
      </div>

      {/* Masque rotatif décoratif */}
      <div className="pointer-events-none absolute -right-16 top-1/2 z-10 hidden w-64 -translate-y-1/2 opacity-25 md:block lg:-right-8 lg:w-80">
        <div className="spin-slow">
          <MaskLogo className="w-full drop-shadow-[0_0_30px_rgba(230,0,18,0.55)]" />
        </div>
      </div>

      {/* Contenu principal — aligné à gauche, jamais centré */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-28 pt-40 sm:px-8">
        <div className="max-w-4xl">
          <p
            className="reveal on mb-4 inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.35em] text-[var(--p5-red)] sm:text-base"
            style={{ transform: "skewX(-6deg)" }}
          >
            <span className="inline-block h-[3px] w-12 bg-[var(--p5-red)]" />
            Persona 5 — Night Track 005
          </p>

          <h1 className="font-display uppercase leading-[0.86] text-white">
            <span
              className="glitch block text-[16vw] sm:text-[11vw] lg:text-[8.5rem]"
              data-text="BENEATH"
            >
              BENEATH
            </span>
            <span className="block text-[16vw] text-[var(--p5-red)] sm:text-[11vw] lg:text-[8.5rem]">
              <span className="glitch inline-block" data-text="THE MASK">
                THE MASK
              </span>
            </span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-type text-xs uppercase tracking-widest text-white/75 sm:text-sm">
            <span>
              Composé par <strong className="text-white">Shoji Meguro</strong>
            </span>
            <span className="hidden h-4 w-[2px] -skew-x-12 bg-[var(--p5-red)] sm:block" />
            <span>
              Chant : <strong className="text-white">Lyn Inaizumi</strong>
            </span>
            <span className="hidden h-4 w-[2px] -skew-x-12 bg-[var(--p5-red)] sm:block" />
            <span>Thème du <strong className="text-white">Café Leblanc</strong></span>
          </div>

          <p className="mt-5 max-w-xl border-l-4 border-[var(--p5-red)] pl-4 text-base leading-relaxed text-white/85 sm:text-lg">
            Il pleut sur Yongenjaya. Quelque part entre deux gorgées de café,
            un voleur fantôme retire son masque — et la ville entière retient
            son souffle.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button className="btn-p5 px-7 py-4 text-lg sm:text-xl" onClick={onEnter}>
              <span>
                {Icons.play}
                Enter the Metaverse
              </span>
            </button>
            <button
              className="btn-ghost px-6 py-4 text-base"
              onClick={() => {
                engine.uiClick("tick");
                engine.toggle();
              }}
            >
              <span>Écouter le titre</span>
            </button>
          </div>

          {/* Sticker All-Out Attack */}
          <div className="float-y mt-10 inline-block">
            <div className="clip-blade bg-white px-5 py-2">
              <p className="font-display text-sm uppercase tracking-widest text-black" style={{ transform: "skewX(8deg)" }}>
                ★ 1 More — Bonus track en boucle ★
              </p>
            </div>
          </div>
        </div>

        {/* Indice de scroll */}
        <div className="mt-12 flex items-center gap-3 text-white/60">
          <span className="font-display text-xs uppercase tracking-[0.3em]" style={{ transform: "skewX(-6deg)" }}>
            Scroll
          </span>
          <span className="relative inline-block h-[2px] w-24 overflow-hidden bg-white/20">
            <span
              className="absolute inset-y-0 left-0 w-1/3 bg-[var(--p5-red)]"
              style={{ animation: "marquee 1.6s linear infinite" }}
            />
          </span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bounce" fill="currentColor" aria-hidden="true">
            <path d="M12 16 L4 8 H20 Z" />
          </svg>
        </div>
      </div>

      {/* Ticker façon bande P5 */}
      <div className="absolute bottom-14 left-0 z-10 w-full -rotate-1">
        <div className="marquee border-y-2 border-white bg-[var(--p5-red)] py-2">
          <div className="marquee-track font-display text-lg uppercase tracking-wider text-white">
            {[0, 1].map((k) => (
              <span key={k} className="flex items-center gap-10" aria-hidden={k === 1}>
                {TICKER_ITEMS.map((t, i) => (
                  <span key={i} className="flex items-center gap-10">
                    {t} <span className="text-black">{Icons.star}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
