/* ============================================================
   Données du site : paroles, Phantom Thieves, recettes, météo
   ============================================================ */

export interface Stanza {
  label: string;
  lines: string[];
}

/* Extrait utilisé à des fins de démonstration fan-made.
   Beneath the Mask © Shoji Meguro / Lyn Inaizumi / ATLUS. */
export const LYRICS: Stanza[] = [
  {
    label: "Verse 1",
    lines: [
      "Where have you been?",
      "I've been searching for you",
      "There was a time",
      "When your voice was all I heard",
    ],
  },
  {
    label: "Verse 2",
    lines: [
      "Where do I begin?",
      "Should I even try to break down",
      "The walls around your heart?",
      "I don't know anymore",
    ],
  },
  {
    label: "Pre-Chorus",
    lines: [
      "All the things I say",
      "All the things I do",
      "All these masks I wear",
      "I hope they fool you",
    ],
  },
  {
    label: "Chorus",
    lines: [
      "But when I'm alone",
      "I take off the disguise",
      "Wonder if you'd recognize me",
      "Beneath the mask",
    ],
  },
  {
    label: "Outro",
    lines: [
      "Where have you been?",
      "I've been searching for you…",
      "Beneath the mask.",
    ],
  },
];

export const LYRICS_FLAT: { line: string; label: string }[] = LYRICS.flatMap(
  (s) => s.lines.map((line) => ({ line, label: s.label }))
);

export interface Thief {
  id: string;
  codename: string;
  real: string;
  arcana: string;
  numeral: string;
  role: string;
  desc: string;
  quote: string;
  accent: string;
}

export const THIEVES: Thief[] = [
  {
    id: "joker",
    codename: "JOKER",
    real: "Ren Amamiya",
    arcana: "Le Bateleur",
    numeral: "I",
    role: "Leader",
    desc: "Le joker silencieux. Sous le masque blanc, un potentiel infini et des dizaines de Personas en attente.",
    quote: "Tu as déjà perdu. Tu ne le sais juste pas encore.",
    accent: "#e60012",
  },
  {
    id: "panther",
    codename: "PANTHER",
    real: "Ann Takamaki",
    arcana: "L'Amoureux",
    numeral: "VI",
    role: "Attaque",
    desc: "Quart de sang américain, modèle et fouet en main. Sa Carmen embrase les ombres les plus coriaces.",
    quote: "Mon cœur n'est le trophée de personne.",
    accent: "#e6407a",
  },
  {
    id: "skull",
    codename: "SKULL",
    real: "Ryuji Sakamoto",
    arcana: "Le Chariot",
    numeral: "VII",
    role: "Attaque",
    desc: "L'as de la vitesse de Shujin. Crâne d'argent, cœur en or, et un Captain Kidd qui frappe comme un train.",
    quote: "On fonce. On avisera APRÈS.",
    accent: "#e8a33d",
  },
  {
    id: "fox",
    codename: "FOX",
    real: "Yusuke Kitagawa",
    arcana: "L'Empereur",
    numeral: "IV",
    role: "Attaque",
    desc: "Esthète absolu, élève de Madarame. Il peint la vérité des cœurs… au katana, si nécessaire.",
    quote: "La laideur de ton cœur m'inspire une œuvre.",
    accent: "#5f7fd6",
  },
  {
    id: "queen",
    codename: "QUEEN",
    real: "Makoto Niijima",
    arcana: "La Papesse",
    numeral: "II",
    role: "Tactique",
    desc: "Présidente du conseil, poings d'acier. Johanna calcule chaque angle pendant qu'elle enfonce la ligne.",
    quote: "J'ai un plan. Comme toujours.",
    accent: "#7a86d8",
  },
  {
    id: "oracle",
    codename: "ORACLE",
    real: "Futaba Sakura",
    arcana: "L'Ermite",
    numeral: "IX",
    role: "Support",
    desc: "Navigatrice de génie enfermée chez elle. Necronomicon voit tout — surtout vos points faibles.",
    quote: "GG. Votre cœur est en PLS.",
    accent: "#3fbf7f",
  },
  {
    id: "noir",
    codename: "NOIR",
    real: "Haru Okumura",
    arcana: "L'Impératrice",
    numeral: "III",
    role: "Attaque",
    desc: "Héritière d'Okumura Foods, hache géante et manières exquises. Ne vous fiez surtout pas à sa douceur.",
    quote: "Douce ? Oui. Inoffensive ? Jamais.",
    accent: "#d98fb8",
  },
  {
    id: "mona",
    codename: "MORGANA",
    real: "…Morgana ?",
    arcana: "Le Bateleur",
    numeral: "I",
    role: "Support",
    desc: "Chat ? Humain ? Légende ? Conducteur officiel du Mona-car et conscience auto-proclamée de l'équipe.",
    quote: "Je ne suis PAS un chat !",
    accent: "#c8b45a",
  },
];

export interface Recipe {
  name: string;
  price: string;
  tagline: string;
  steps: { title: string; detail: string }[];
}

export const RECIPES: Record<"cafe" | "curry", Recipe> = {
  cafe: {
    name: "Café Leblanc",
    price: "¥500",
    tagline: "Le blend secret du patron, torréfié sur place.",
    steps: [
      { title: "Choisir les grains", detail: "Un blend maison fraîchement torréfié, jamais plus de deux semaines après cuisson." },
      { title: "Moudre au dernier moment", detail: "Mouture moyenne-fine. Le parfum doit envahir l'atelier avant même l'eau." },
      { title: "Ébouillanter le matériel", detail: "Dripper en céramique, filtre et tasse : tout doit être brûlant pour ne rien voler à l'arôme." },
      { title: "Premier filet d'eau", detail: "Verser en spirale depuis le centre. Le café gonfle et « respire » pendant 30 secondes." },
      { title: "Extraction lente", detail: "Deux minutes trente, en trois versements. Pas une seconde de plus — Sojiro y tient." },
      { title: "Servir immédiatement", detail: "Tasse chaude, comptoir en bois, pluie sur la vitre. La règle du Leblanc." },
    ],
  },
  curry: {
    name: "Curry de Sojiro",
    price: "¥800",
    tagline: "La recette gardée secrète depuis des années.",
    steps: [
      { title: "Oignons caramélisés", detail: "Quarante minutes à feu doux, sans jamais brûler. C'est la base de tout, gamin." },
      { title: "Pomme & miel", detail: "Le sucré discret qui arrondit le piquant. Personne n'y croit, tout le monde y goûte." },
      { title: "Épices secrètes", detail: "Cardamome, cannelle, une pointe de chocolat noir… et un ingrédient que Sojiro ne révélera jamais." },
      { title: "Saisir le bœuf", detail: "Morceaux généreux, saisis fort pour sceller les sucs avant le long mijotage." },
      { title: "Mijoter 3 heures", detail: "À très petits bouillons. On remue, on goûte, on se tait. Le curry n'aime pas la précipitation." },
      { title: "Dresser", detail: "Riz blanc, curry à gauche — jamais mélangé — et un œuf mollet pour les soirs de pluie." },
    ],
  },
};

export interface WeatherState {
  name: string;
  temp: number;
  humidity: number;
  wind: string;
  vibe: string;
  intensity: 1 | 2 | 3;
}

export const WEATHER: WeatherState[] = [
  {
    name: "Bruine fine",
    temp: 17,
    humidity: 82,
    wind: "8 km/h SO",
    vibe: "Une pluie de velours. Parfaite pour un blend et un vieux jazz.",
    intensity: 1,
  },
  {
    name: "Pluie battante",
    temp: 15,
    humidity: 91,
    wind: "14 km/h S",
    vibe: "Les néons se noient dans les flaques. Le Metaverse s'agite…",
    intensity: 2,
  },
  {
    name: "Orage lointain",
    temp: 14,
    humidity: 95,
    wind: "22 km/h SE",
    vibe: "Le tonnerre gronde sur Yongenjaya. Nuit idéale pour un casse.",
    intensity: 3,
  },
];

export const TICKER_ITEMS = [
  "TAKE YOUR TIME",
  "BENEATH THE MASK",
  "PERSONA 5",
  "CAFÉ LEBLANC",
  "THE PHANTOM THIEVES",
  "LAST SURPRISE",
  "YONGENJAYA — TOKYO",
  "CALLING CARD",
];

/* Emplacement audio officiel : déposez votre fichier dans
   public/audio/beneath-the-mask.mp3 — le lecteur le chargera
   automatiquement. Priorité des sources : YouTube > MP3 > synthé. */
export const MP3_SRC = "/audio/beneath-the-mask.mp3";

/* Piste officielle Beneath the Mask (Lyn Inaizumi) — lue via
   l'API YouTube IFrame, contrôlée entièrement par le lecteur P5. */
export const YOUTUBE_ID = "SlUYv-CUoOo";
