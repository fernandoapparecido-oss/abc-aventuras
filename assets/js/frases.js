// ===================================================================
// Frases de áudio — fonte única de verdade
// Mapeia uma "chave" de clipe para o texto que deve ser sintetizado.
// Usado pelo jogo (para o fallback de voz e para saber as chaves) e
// pelo gerador de áudios (tools/gerar-audios.mjs).
//
// A narração é montada por "pedaços" (frase fixa + palavra/sílaba/
// letra/som), então geramos poucos clipes reaproveitáveis em vez de
// gravar cada frase inteira.
// ===================================================================

// Nome falado de cada letra (não o som — o nome, como se lê o alfabeto).
const NOMES_LETRA = {
  A: "á", B: "bê", C: "cê", D: "dê", E: "é",
  F: "éfe", G: "gê", H: "agá", I: "i", J: "jóta",
  L: "éle", M: "ême", N: "êne", O: "ó", P: "pê",
  R: "érre", S: "ésse", T: "tê", U: "u", V: "vê",
  X: "xis", Z: "zê",
};

// Frases fixas (carregadores e falas prontas).
const FRASES_FIXAS = {
  saudacao: "Oi! Vamos brincar de aprender a ler?",
  quase: "Quase! Tenta de novo.",
  toque_som: "Toque no que começa com o som",
  muito_bem: "Muito bem!",
  monte: "Monte a palavra",
  isso: "Isso!",
  qual_rima: "Qual rima com",
  rima_com: "rima com",
  bata: "Bata uma vez para cada pedaço de",
  pesque_som: "Pesque a letra que faz o som",
  peguei: "Peguei!",
  rotulo_letra: "Letra",
  ache_pares: "Ache os pares: a letra grande e a pequena",
  achou_pares: "Você achou todos os pares!",
  qual_silaba: "Qual sílaba falta em",
  onde_escrito: "Onde está escrito",
  desenhe: "Desenhe a letra",
  faz_som: "Ela faz o som",
  boa_essa: "Boa! Essa é a letra",
  jogue_adesivos: "Jogue para ganhar adesivos!",
};

// Monta o mapa completo {chave: texto} a partir dos dados do jogo.
// Depende de BANCO_PALAVRAS, SOM_DA_LETRA, ALFABETO e GRUPOS_RIMA
// (definidos em data.js, carregado antes deste arquivo).
function construirFrases() {
  const f = Object.assign({}, FRASES_FIXAS);

  const addPalavra = (palavra) => {
    f["pal_" + palavra] = palavra.toLowerCase();
  };

  BANCO_PALAVRAS.forEach((p) => {
    addPalavra(p.palavra);
    p.silabas.forEach((s) => {
      f["sil_" + s] = s.toLowerCase();
    });
  });

  // Palavras dos grupos de rima (algumas não estão no banco principal).
  GRUPOS_RIMA.flat().forEach((item) => addPalavra(item.palavra));

  ALFABETO.forEach((L) => {
    f["letra_" + L] = NOMES_LETRA[L] || L.toLowerCase();
    f["som_" + L] = SOM_DA_LETRA[L] || L.toLowerCase();
  });

  return f;
}

const FRASES = construirFrases();

// Permite usar em Node (gerador) além do navegador.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { FRASES, NOMES_LETRA, FRASES_FIXAS, construirFrases };
}
