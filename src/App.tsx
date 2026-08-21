/* ============================================================
   BENEATH THE MASK — Expérience Persona 5 (single page dense)
   Hero → Paroles → Café Leblanc → Phantom Lounge → Calling Card
   + lecteur audio fixe + mode pluie global + flash métavers
   ============================================================ */
import { useCallback, useState } from "react";
import { engine } from "./audio/engine";
import { prefersReduced, usePlayer, useRevealAll } from "./hooks";
import { MetaverseFlash, MaskLogo, NoiseOverlay, RainCanvas } from "./components/Effects";
import { Hero } from "./components/Hero";
import { Lyrics } from "./components/Lyrics";
import { Leblanc } from "./components/Leblanc";
import { Lounge } from "./components/Lounge";
import { Generator } from "./components/Generator";
import { Player } from "./components/Player";

const NAV_LINKS = [
  { href: "#paroles", label: "Paroles" },
  { href: "#leblanc", label: "Leblanc" },
  { href: "#lounge", label: "Lounge" },
  { href: "#carte", label: "Calling Card" },
];

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-[70] border-b-2 border-[var(--p5-red)] bg-black/92">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
        <a
          href="#metaverse"
          className="flex items-center gap-2.5"
          onClick={() => engine.uiClick("tick")}
          aria-label="Retour en haut — Beneath the Mask"
        >
          <MaskLogo className="h-8 w-8" />
          <span className="font-display text-lg uppercase tracking-wide text-white" style={{ transform: "skewX(-6deg)" }}>
            BtM<span className="text-[var(--p5-red)]">_005</span>
          </span>
        </a>
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto sm:gap-2">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link text-xs sm:text-sm" onClick={() => engine.uiClick("tick")}>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative border-t-2 border-white/10 bg-[var(--p5-ink)] pb-48 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <MaskLogo className="h-10 w-10" />
              <p className="font-display text-2xl uppercase text-white" style={{ transform: "skewX(-6deg)" }}>
                Beneath <span className="text-[var(--p5-red)]">the Mask</span>
              </p>
            </div>
            <p className="mt-4 max-w-xs font-type text-xs leading-relaxed text-white/50">
              Une nuit de pluie, un café qui fume, huit voleurs fantômes.
              Site conçu comme un hommage interactif à Persona 5.
            </p>
          </div>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.25em] text-[var(--p5-red)]">Chapitres</p>
            <ul className="mt-4 space-y-2 font-type text-sm text-white/60">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition hover:text-[var(--p5-red)]">
                    ▸ {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.25em] text-[var(--p5-red)]">Mentions du voleur</p>
            <p className="mt-4 font-type text-xs leading-relaxed text-white/50">
              Projet fan-made non officiel, sans but lucratif.
              <br />
              « Beneath the Mask » © Shoji Meguro / Lyn Inaizumi / ATLUS —
              Persona 5. Paroles : extrait à des fins de démonstration.
              <br />
              Audio : piste officielle via YouTube si en ligne ; sinon votre
              fichier <code className="text-[var(--p5-red)]">public/audio/beneath-the-mask.mp3</code> ;
              sinon un moteur lo-fi jazz synthétisé en direct (Web Audio API).
              <br />
              ★ Polices, visuels et moteur audio embarqués : le site
              fonctionne 100 % hors-ligne.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="font-type text-[11px] uppercase tracking-widest text-white/35">
            © Nuit pluvieuse — Yongenjaya. Take your time.
          </p>
          <a href="#metaverse" className="btn-ghost px-5 py-2 text-xs" onClick={() => engine.uiClick("tick")}>
            <span>▲ Remonter à la surface</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const player = usePlayer();
  const [flash, setFlash] = useState(false);
  useRevealAll();

  const enterMetaverse = useCallback(() => {
    engine.uiClick("confirm");
    setFlash(true);
  }, []);

  /* À la fin du flash : musique + pluie, plongée dans les paroles */
  const onFlashDone = useCallback(() => {
    setFlash(false);
    if (!engine.playing) engine.play();
    if (!engine.rainOn) engine.setRain(true);
    document.getElementById("paroles")?.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <RainCanvas on={player.state.rain} />
      <NoiseOverlay />
      <MetaverseFlash active={flash} onDone={onFlashDone} />

      <main>
        <Hero onEnter={enterMetaverse} />
        <Lyrics />
        <Leblanc rain={player.state.rain} />
        <Lounge />
        <Generator />
      </main>

      <Footer />
      <Player p={player} />
    </div>
  );
}
