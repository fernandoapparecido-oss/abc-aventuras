// ===================================================================
// Dados do jogo ABC Aventura
// Palavras representadas por emoji (sem precisar baixar imagens).
// Tudo em português do Brasil.
// ===================================================================

// Banco de palavras: emoji + palavra + sílabas (para "Monta Palavra")
// A primeira letra é usada no jogo "Caça ao Som".
const BANCO_PALAVRAS = [
  { emoji: "🐱", palavra: "GATO",   silabas: ["GA", "TO"] },
  { emoji: "🦆", palavra: "PATO",   silabas: ["PA", "TO"] },
  { emoji: "🏠", palavra: "CASA",   silabas: ["CA", "SA"] },
  { emoji: "🐸", palavra: "SAPO",   silabas: ["SA", "PO"] },
  { emoji: "🍰", palavra: "BOLO",   silabas: ["BO", "LO"] },
  { emoji: "🌙", palavra: "LUA",    silabas: ["LU", "A"]  },
  { emoji: "☀️", palavra: "SOL",    silabas: ["SOL"]      },
  { emoji: "🎲", palavra: "DADO",   silabas: ["DA", "DO"] },
  { emoji: "🐮", palavra: "VACA",   silabas: ["VA", "CA"] },
  { emoji: "🧳", palavra: "MALA",   silabas: ["MA", "LA"] },
  { emoji: "🐟", palavra: "PEIXE",  silabas: ["PEI", "XE"] },
  { emoji: "🌸", palavra: "FLOR",   silabas: ["FLOR"]     },
  { emoji: "🍇", palavra: "UVA",    silabas: ["U", "VA"]  },
  { emoji: "🥚", palavra: "OVO",    silabas: ["O", "VO"]  },
  { emoji: "🐀", palavra: "RATO",   silabas: ["RA", "TO"] },
  { emoji: "🐝", palavra: "ABELHA", silabas: ["A", "BE", "LHA"] },
  { emoji: "🍌", palavra: "BANANA", silabas: ["BA", "NA", "NA"] },
  { emoji: "🐵", palavra: "MACACO", silabas: ["MA", "CA", "CO"] },
  { emoji: "🐴", palavra: "CAVALO", silabas: ["CA", "VA", "LO"] },
  { emoji: "🦁", palavra: "LEAO",   silabas: ["LE", "AO"] },
  { emoji: "🐘", palavra: "ELEFANTE", silabas: ["E", "LE", "FAN", "TE"] },
  { emoji: "🚢", palavra: "NAVIO",  silabas: ["NA", "VI", "O"] },
  { emoji: "🌳", palavra: "ARVORE", silabas: ["AR", "VO", "RE"] },
  { emoji: "🔑", palavra: "CHAVE",  silabas: ["CHA", "VE"] },
];

// Como falar o "som" de cada letra inicial no jogo Caça ao Som.
// Usamos o som (fonema) esticado, não o nome da letra — é assim que
// se ensina na alfabetização ("fffф" em vez de "efe").
const SOM_DA_LETRA = {
  A: "ãaa", B: "beh", C: "cah", D: "deh", E: "eh",
  F: "fffe", G: "gah", H: "ah",  I: "iii", J: "jjje",
  L: "lle",  M: "mme", N: "nne", O: "óó",  P: "peh",
  R: "rre",  S: "sse", T: "teh", U: "uu",  V: "vve",
  X: "xxe",  Z: "zze",
};

// Grupos de palavras que rimam (para o Jogo das Rimas).
// Cada grupo tem palavras com a mesma terminação sonora.
const GRUPOS_RIMA = [
  [
    { emoji: "🐱", palavra: "GATO" },
    { emoji: "🦆", palavra: "PATO" },
    { emoji: "🐀", palavra: "RATO" },
  ],
  [
    { emoji: "🍞", palavra: "PAO" },
    { emoji: "🐕", palavra: "CAO" },
    { emoji: "✋", palavra: "MAO" },
  ],
  [
    { emoji: "🍳", palavra: "PANELA" },
    { emoji: "🪟", palavra: "JANELA" },
    { emoji: "🕯️", palavra: "VELA" },
  ],
  [
    { emoji: "👄", palavra: "BOCA" },
    { emoji: "🦭", palavra: "FOCA" },
    { emoji: "🪱", palavra: "MINHOCA" },
  ],
];

// Alfabeto usado nos jogos de letras (só letras com som definido acima).
const ALFABETO = Object.keys(SOM_DA_LETRA);

// Adesivos que a criança coleciona (recompensa visual).
const ADESIVOS = [
  "⭐", "🌈", "🎈", "🦄", "🚀", "🍭", "🎉", "🏆",
  "🐣", "🌟", "🎁", "🦋", "🌻", "🍀", "🎯", "👑",
];
