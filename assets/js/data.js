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
  // --- Animais ---
  { emoji: "🐶", palavra: "CACHORRO", silabas: ["CA", "CHOR", "RO"] },
  { emoji: "🐷", palavra: "PORCO",  silabas: ["POR", "CO"] },
  { emoji: "🐔", palavra: "GALINHA", silabas: ["GA", "LI", "NHA"] },
  { emoji: "🐢", palavra: "TARTARUGA", silabas: ["TAR", "TA", "RU", "GA"] },
  { emoji: "🐍", palavra: "COBRA",  silabas: ["CO", "BRA"] },
  { emoji: "🐙", palavra: "POLVO",  silabas: ["POL", "VO"] },
  { emoji: "🦋", palavra: "BORBOLETA", silabas: ["BOR", "BO", "LE", "TA"] },
  // --- Comidas ---
  { emoji: "🍉", palavra: "MELANCIA", silabas: ["ME", "LAN", "CI", "A"] },
  { emoji: "🍓", palavra: "MORANGO", silabas: ["MO", "RAN", "GO"] },
  { emoji: "🍊", palavra: "LARANJA", silabas: ["LA", "RAN", "JA"] },
  { emoji: "🥕", palavra: "CENOURA", silabas: ["CE", "NOU", "RA"] },
  { emoji: "🥔", palavra: "BATATA", silabas: ["BA", "TA", "TA"] },
  { emoji: "🍅", palavra: "TOMATE", silabas: ["TO", "MA", "TE"] },
  { emoji: "🥛", palavra: "LEITE",  silabas: ["LEI", "TE"] },
  { emoji: "🧀", palavra: "QUEIJO", silabas: ["QUEI", "JO"] },
  // --- Natureza ---
  { emoji: "🌻", palavra: "GIRASSOL", silabas: ["GI", "RAS", "SOL"] },
  { emoji: "⭐", palavra: "ESTRELA", silabas: ["ES", "TRE", "LA"] },
  { emoji: "🌧️", palavra: "CHUVA", silabas: ["CHU", "VA"] },
  { emoji: "🔥", palavra: "FOGO",   silabas: ["FO", "GO"] },
  { emoji: "💧", palavra: "AGUA",   silabas: ["A", "GUA"] },
  // --- Objetos e lugares ---
  { emoji: "🏫", palavra: "ESCOLA", silabas: ["ES", "CO", "LA"] },
  { emoji: "🚗", palavra: "CARRO",  silabas: ["CAR", "RO"] },
  { emoji: "✈️", palavra: "AVIAO",  silabas: ["A", "VI", "AO"] },
  { emoji: "🚀", palavra: "FOGUETE", silabas: ["FO", "GUE", "TE"] },
  { emoji: "⚽", palavra: "BOLA",   silabas: ["BO", "LA"] },
  { emoji: "🎈", palavra: "BALAO",  silabas: ["BA", "LAO"] },
  { emoji: "👟", palavra: "SAPATO", silabas: ["SA", "PA", "TO"] },
  { emoji: "🪑", palavra: "CADEIRA", silabas: ["CA", "DEI", "RA"] },
  { emoji: "🦷", palavra: "DENTE",  silabas: ["DEN", "TE"] },
  { emoji: "👃", palavra: "NARIZ",  silabas: ["NA", "RIZ"] },
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
    { emoji: "👟", palavra: "SAPATO" },
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
    { emoji: "⭐", palavra: "ESTRELA" },
  ],
  [
    { emoji: "👄", palavra: "BOCA" },
    { emoji: "🦭", palavra: "FOCA" },
    { emoji: "🪱", palavra: "MINHOCA" },
  ],
  [
    { emoji: "🌧️", palavra: "CHUVA" },
    { emoji: "🍇", palavra: "UVA" },
  ],
];

// Alfabeto usado nos jogos de letras (só letras com som definido acima).
const ALFABETO = Object.keys(SOM_DA_LETRA);

// Adesivos que a criança coleciona (recompensa visual).
const ADESIVOS = [
  "⭐", "🌈", "🎈", "🦄", "🚀", "🍭", "🎉", "🏆",
  "🐣", "🌟", "🎁", "🦋", "🌻", "🍀", "🎯", "👑",
];
