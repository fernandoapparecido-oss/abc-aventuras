// ===================================================================
// Dados do jogo ABC Aventura
// Palavras representadas por emoji (sem precisar baixar imagens).
// Tudo em português do Brasil.
// ===================================================================

// Chave usada no nome dos arquivos de áudio: maiúsculas, sem acento, e
// Ç vira S ("ÇO" soa igual a "SO", então reaproveita o mesmo áudio).
// Assim a tela mostra a grafia correta (PALHAÇO) e o arquivo fica ASCII.
function chaveTexto(t) {
  return String(t)
    .toUpperCase()
    .replace(/Ç/g, "S")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Banco de palavras GRADUADO por nível de alfabetização.
//   nivel 1 — sílabas simples (consoante+vogal), 2 sílabas
//   nivel 2 — ditongos e sílabas com coda simples (SOL, DENTE)
//   nivel 3 — palavras de 3 sílabas
//   nivel 4 — dígrafos (CH, LH, NH, RR, SS)
//   nivel 5 — encontros consonantais e palavras longas (COBRA, ELEFANTE)
// A primeira letra é usada no jogo "Caça ao Som"; as sílabas, nos jogos
// de montar/bater. O campo `nivel` é usado pelo sistema de progressão.
const BANCO_PALAVRAS = [
  // ---------------- Nível 1 — sílabas simples ----------------
  { emoji: "🐱", palavra: "GATO", silabas: ["GA", "TO"], nivel: 1 },
  { emoji: "🦆", palavra: "PATO", silabas: ["PA", "TO"], nivel: 1 },
  { emoji: "🏠", palavra: "CASA", silabas: ["CA", "SA"], nivel: 1 },
  { emoji: "🐸", palavra: "SAPO", silabas: ["SA", "PO"], nivel: 1 },
  { emoji: "🍰", palavra: "BOLO", silabas: ["BO", "LO"], nivel: 1 },
  { emoji: "🎲", palavra: "DADO", silabas: ["DA", "DO"], nivel: 1 },
  { emoji: "🐮", palavra: "VACA", silabas: ["VA", "CA"], nivel: 1 },
  { emoji: "🧳", palavra: "MALA", silabas: ["MA", "LA"], nivel: 1 },
  { emoji: "🐀", palavra: "RATO", silabas: ["RA", "TO"], nivel: 1 },
  { emoji: "🌙", palavra: "LUA",  silabas: ["LU", "A"],  nivel: 1 },
  { emoji: "🍇", palavra: "UVA",  silabas: ["U", "VA"],  nivel: 1 },
  { emoji: "🥚", palavra: "OVO",  silabas: ["O", "VO"],  nivel: 1 },
  { emoji: "⚽", palavra: "BOLA", silabas: ["BO", "LA"], nivel: 1 },
  { emoji: "🔥", palavra: "FOGO", silabas: ["FO", "GO"], nivel: 1 },
  { emoji: "🧃", palavra: "SUCO", silabas: ["SU", "CO"], nivel: 1 },
  { emoji: "🔪", palavra: "FACA", silabas: ["FA", "CA"], nivel: 1 },
  { emoji: "☝️", palavra: "DEDO", silabas: ["DE", "DO"], nivel: 1 },
  { emoji: "🧊", palavra: "GELO", silabas: ["GE", "LO"], nivel: 1 },
  { emoji: "🛵", palavra: "MOTO", silabas: ["MO", "TO"], nivel: 1 },
  { emoji: "🪁", palavra: "PIPA", silabas: ["PI", "PA"], nivel: 1 },
  { emoji: "🕯️", palavra: "VELA", silabas: ["VE", "LA"], nivel: 1 },
  { emoji: "🐺", palavra: "LOBO", silabas: ["LO", "BO"], nivel: 1 },
  { emoji: "🐓", palavra: "GALO", silabas: ["GA", "LO"], nivel: 1 },
  { emoji: "🔔", palavra: "SINO", silabas: ["SI", "NO"], nivel: 1 },
  { emoji: "🍐", palavra: "PERA", silabas: ["PE", "RA"], nivel: 1 },
  { emoji: "🦭", palavra: "FOCA", silabas: ["FO", "CA"], nivel: 1 },
  { emoji: "🌹", palavra: "ROSA", silabas: ["RO", "SA"], nivel: 1 },
  { emoji: "🛋️", palavra: "SOFÁ", silabas: ["SO", "FÁ"], nivel: 1 },
  { emoji: "🥫", palavra: "LATA", silabas: ["LA", "TA"], nivel: 1 },
  { emoji: "🪶", palavra: "PENA", silabas: ["PE", "NA"], nivel: 1 },

  // ---------------- Nível 2 — ditongos e codas simples ----------------
  { emoji: "🐟", palavra: "PEIXE", silabas: ["PEI", "XE"], nivel: 2 },
  { emoji: "🥛", palavra: "LEITE", silabas: ["LEI", "TE"], nivel: 2 },
  { emoji: "🧀", palavra: "QUEIJO", silabas: ["QUEI", "JO"], nivel: 2 },
  { emoji: "💧", palavra: "ÁGUA",  silabas: ["Á", "GUA"], nivel: 2 },
  { emoji: "🦷", palavra: "DENTE", silabas: ["DEN", "TE"], nivel: 2 },
  { emoji: "👃", palavra: "NARIZ", silabas: ["NA", "RIZ"], nivel: 2 },
  { emoji: "🐷", palavra: "PORCO", silabas: ["POR", "CO"], nivel: 2 },
  { emoji: "🐙", palavra: "POLVO", silabas: ["POL", "VO"], nivel: 2 },
  { emoji: "🧦", palavra: "MEIA",  silabas: ["MEI", "A"], nivel: 2 },
  { emoji: "🐐", palavra: "BODE",  silabas: ["BO", "DE"], nivel: 2 },
  { emoji: "☀️", palavra: "SOL",   silabas: ["SOL"], nivel: 2 },
  { emoji: "🍯", palavra: "MEL",   silabas: ["MEL"], nivel: 2 },
  { emoji: "🍞", palavra: "PÃO",   silabas: ["PÃO"], nivel: 2 },
  { emoji: "✋", palavra: "MÃO",   silabas: ["MÃO"], nivel: 2 },
  { emoji: "👑", palavra: "REI",   silabas: ["REI"], nivel: 2 },
  { emoji: "🐂", palavra: "BOI",   silabas: ["BOI"], nivel: 2 },
  { emoji: "🧂", palavra: "SAL",   silabas: ["SAL"], nivel: 2 },
  { emoji: "🌰", palavra: "NOZ",   silabas: ["NOZ"], nivel: 2 },
  { emoji: "🫙", palavra: "POTE",  silabas: ["PO", "TE"], nivel: 2 },
  { emoji: "🌉", palavra: "PONTE", silabas: ["PON", "TE"], nivel: 2 },
  { emoji: "⛲", palavra: "FONTE", silabas: ["FON", "TE"], nivel: 2 },

  // ---------------- Nível 3 — três sílabas ----------------
  { emoji: "🍌", palavra: "BANANA", silabas: ["BA", "NA", "NA"], nivel: 3 },
  { emoji: "🐴", palavra: "CAVALO", silabas: ["CA", "VA", "LO"], nivel: 3 },
  { emoji: "🐵", palavra: "MACACO", silabas: ["MA", "CA", "CO"], nivel: 3 },
  { emoji: "👟", palavra: "SAPATO", silabas: ["SA", "PA", "TO"], nivel: 3 },
  { emoji: "🥔", palavra: "BATATA", silabas: ["BA", "TA", "TA"], nivel: 3 },
  { emoji: "🍅", palavra: "TOMATE", silabas: ["TO", "MA", "TE"], nivel: 3 },
  { emoji: "🥕", palavra: "CENOURA", silabas: ["CE", "NOU", "RA"], nivel: 3 },
  { emoji: "🍓", palavra: "MORANGO", silabas: ["MO", "RAN", "GO"], nivel: 3 },
  { emoji: "🍊", palavra: "LARANJA", silabas: ["LA", "RAN", "JA"], nivel: 3 },
  { emoji: "🪆", palavra: "BONECA", silabas: ["BO", "NE", "CA"], nivel: 3 },
  { emoji: "🪑", palavra: "CADEIRA", silabas: ["CA", "DEI", "RA"], nivel: 3 },
  { emoji: "🍳", palavra: "PANELA", silabas: ["PA", "NE", "LA"], nivel: 3 },
  { emoji: "🪟", palavra: "JANELA", silabas: ["JA", "NE", "LA"], nivel: 3 },
  { emoji: "🔨", palavra: "MARTELO", silabas: ["MAR", "TE", "LO"], nivel: 3 },
  { emoji: "🐫", palavra: "CAMELO", silabas: ["CA", "ME", "LO"], nivel: 3 },
  { emoji: "✂️", palavra: "TESOURA", silabas: ["TE", "SOU", "RA"], nivel: 3 },
  { emoji: "🐜", palavra: "FORMIGA", silabas: ["FOR", "MI", "GA"], nivel: 3 },
  { emoji: "🦊", palavra: "RAPOSA", silabas: ["RA", "PO", "SA"], nivel: 3 },
  { emoji: "👦", palavra: "MENINO", silabas: ["ME", "NI", "NO"], nivel: 3 },
  { emoji: "👧", palavra: "MENINA", silabas: ["ME", "NI", "NA"], nivel: 3 },
  { emoji: "🥒", palavra: "PEPINO", silabas: ["PE", "PI", "NO"], nivel: 3 },
  { emoji: "🍦", palavra: "SORVETE", silabas: ["SOR", "VE", "TE"], nivel: 3 },
  { emoji: "🚢", palavra: "NAVIO", silabas: ["NA", "VI", "O"], nivel: 3 },
  { emoji: "🌳", palavra: "ÁRVORE", silabas: ["ÁR", "VO", "RE"], nivel: 3 },
  { emoji: "🍿", palavra: "PIPOCA", silabas: ["PI", "PO", "CA"], nivel: 3 },
  { emoji: "🧅", palavra: "CEBOLA", silabas: ["CE", "BO", "LA"], nivel: 3 },

  // ---------------- Nível 4 — dígrafos ----------------
  { emoji: "🔑", palavra: "CHAVE", silabas: ["CHA", "VE"], nivel: 4 },
  { emoji: "🌧️", palavra: "CHUVA", silabas: ["CHU", "VA"], nivel: 4 },
  { emoji: "👒", palavra: "CHAPÉU", silabas: ["CHA", "PÉU"], nivel: 4 },
  { emoji: "🐔", palavra: "GALINHA", silabas: ["GA", "LI", "NHA"], nivel: 4 },
  { emoji: "🐝", palavra: "ABELHA", silabas: ["A", "BE", "LHA"], nivel: 4 },
  { emoji: "🐰", palavra: "COELHO", silabas: ["CO", "E", "LHO"], nivel: 4 },
  { emoji: "🪱", palavra: "MINHOCA", silabas: ["MI", "NHO", "CA"], nivel: 4 },
  { emoji: "🚗", palavra: "CARRO", silabas: ["CAR", "RO"], nivel: 4 },
  { emoji: "🐶", palavra: "CACHORRO", silabas: ["CA", "CHOR", "RO"], nivel: 4 },
  { emoji: "🌍", palavra: "TERRA", silabas: ["TER", "RA"], nivel: 4 },
  { emoji: "🤡", palavra: "PALHAÇO", silabas: ["PA", "LHA", "ÇO"], nivel: 4 },
  { emoji: "🍃", palavra: "FOLHA", silabas: ["FO", "LHA"], nivel: 4 },
  { emoji: "🌽", palavra: "MILHO", silabas: ["MI", "LHO"], nivel: 4 },
  { emoji: "👂", palavra: "ORELHA", silabas: ["O", "RE", "LHA"], nivel: 4 },
  { emoji: "🪡", palavra: "AGULHA", silabas: ["A", "GU", "LHA"], nivel: 4 },
  { emoji: "🐦", palavra: "PÁSSARO", silabas: ["PÁS", "SA", "RO"], nivel: 4 },
  { emoji: "🦴", palavra: "OSSO", silabas: ["OS", "SO"], nivel: 4 },
  { emoji: "🩴", palavra: "CHINELO", silabas: ["CHI", "NE", "LO"], nivel: 4 },
  { emoji: "🪺", palavra: "NINHO", silabas: ["NI", "NHO"], nivel: 4 },
  { emoji: "💅", palavra: "UNHA", silabas: ["U", "NHA"], nivel: 4 },

  // ---------------- Nível 5 — encontros consonantais / longas ----------------
  { emoji: "🐍", palavra: "COBRA", silabas: ["CO", "BRA"], nivel: 5 },
  { emoji: "🦓", palavra: "ZEBRA", silabas: ["ZE", "BRA"], nivel: 5 },
  { emoji: "⭐", palavra: "ESTRELA", silabas: ["ES", "TRE", "LA"], nivel: 5 },
  { emoji: "🌸", palavra: "FLOR", silabas: ["FLOR"], nivel: 5 },
  { emoji: "🍽️", palavra: "PRATO", silabas: ["PRA", "TO"], nivel: 5 },
  { emoji: "📖", palavra: "LIVRO", silabas: ["LI", "VRO"], nivel: 5 },
  { emoji: "💪", palavra: "BRAÇO", silabas: ["BRA", "ÇO"], nivel: 5 },
  { emoji: "🐅", palavra: "TIGRE", silabas: ["TI", "GRE"], nivel: 5 },
  { emoji: "🚂", palavra: "TREM", silabas: ["TREM"], nivel: 5 },
  { emoji: "🪴", palavra: "PLANTA", silabas: ["PLAN", "TA"], nivel: 5 },
  { emoji: "🌐", palavra: "GLOBO", silabas: ["GLO", "BO"], nivel: 5 },
  { emoji: "🎈", palavra: "BALÃO", silabas: ["BA", "LÃO"], nivel: 5 },
  { emoji: "🦁", palavra: "LEÃO", silabas: ["LE", "ÃO"], nivel: 5 },
  { emoji: "🌻", palavra: "GIRASSOL", silabas: ["GI", "RAS", "SOL"], nivel: 5 },
  { emoji: "🐢", palavra: "TARTARUGA", silabas: ["TAR", "TA", "RU", "GA"], nivel: 5 },
  { emoji: "🐘", palavra: "ELEFANTE", silabas: ["E", "LE", "FAN", "TE"], nivel: 5 },
  { emoji: "🦋", palavra: "BORBOLETA", silabas: ["BOR", "BO", "LE", "TA"], nivel: 5 },
  { emoji: "🏫", palavra: "ESCOLA", silabas: ["ES", "CO", "LA"], nivel: 5 },
  { emoji: "✈️", palavra: "AVIÃO", silabas: ["A", "VI", "ÃO"], nivel: 5 },
  { emoji: "🍉", palavra: "MELANCIA", silabas: ["ME", "LAN", "CI", "A"], nivel: 5 },
  { emoji: "🍍", palavra: "ABACAXI", silabas: ["A", "BA", "CA", "XI"], nivel: 5 },
  { emoji: "🥁", palavra: "TAMBOR", silabas: ["TAM", "BOR"], nivel: 5 },
  { emoji: "🎸", palavra: "VIOLÃO", silabas: ["VI", "O", "LÃO"], nivel: 5 },
  { emoji: "🐉", palavra: "DRAGÃO", silabas: ["DRA", "GÃO"], nivel: 5 },
  { emoji: "🎁", palavra: "PRESENTE", silabas: ["PRE", "SEN", "TE"], nivel: 5 },
];

// Quantidade de níveis de palavras (o nível 6, de frases, vem no futuro).
const NIVEL_MAX = 5;

// Como falar o "som" de cada letra inicial no jogo Caça ao Som.
// Usamos o som (fonema) esticado, não o nome da letra — é assim que
// se ensina na alfabetização ("fffф" em vez de "efe").
const SOM_DA_LETRA = {
  A: "ãaa", B: "beh", C: "cah", D: "deh", E: "eh",
  F: "fffe", G: "gah",            I: "iii", J: "jjje",
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
    { emoji: "🍞", palavra: "PÃO" },
    { emoji: "🐕", palavra: "CÃO" },
    { emoji: "✋", palavra: "MÃO" },
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

// Alfabeto usado nos jogos de letras (memória, desenhar).
const ALFABETO = "ABCDEFGHIJLMNOPRSTUVXZ".split("");
// Letras que têm som próprio — usadas nos jogos que pedem "o som" da letra.
// O H fica de fora: em português ele é mudo.
const ALFABETO_COM_SOM = ALFABETO.filter((L) => SOM_DA_LETRA[L]);

// Adesivos que a criança coleciona (recompensa visual).
const ADESIVOS = [
  "⭐", "🌈", "🎈", "🦄", "🚀", "🍭", "🎉", "🏆",
  "🐣", "🌟", "🎁", "🦋", "🌻", "🍀", "🎯", "👑",
];

// ---- Mundo das Vogais ----
const VOGAIS = ["A", "E", "I", "O", "U"];
// Palavras que começam com I e E (o banco principal quase não tem; as com
// "ES" ficam de fora do Trem porque muita gente fala "istrela").
const PALAVRAS_EXTRAS = [
  { emoji: "✉️", palavra: "ENVELOPE" },
  { emoji: "🏝️", palavra: "ILHA" },
  { emoji: "🧲", palavra: "ÍMÃ" },
  { emoji: "⛪", palavra: "IGREJA" },
  { emoji: "🪀", palavra: "IOIÔ" },
];
// Encontros de vogais (Ai! Oi! Ui!), cada um com uma figura que lembra o som.
const ENCONTROS = [
  { s: "AI", emoji: "🤕" },
  { s: "OI", emoji: "👋" },
  { s: "UI", emoji: "😱" },
  { s: "AU", emoji: "🐶" },
  { s: "EI", emoji: "🙋" },
];

// ---- Mundo dos Números ----
const NUMEROS_FALADOS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
// Figuras para contar (uma por rodada).
const FIGURAS_CONTAR = ["🍎", "🍌", "⭐", "🐟", "🎈", "🚗", "🐞", "🌸", "🍓", "⚽"];
