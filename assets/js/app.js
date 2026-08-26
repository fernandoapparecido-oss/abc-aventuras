// ===================================================================
// ABC Aventura — lógica principal do jogo
// ===================================================================

// ---- Utilidades ----
const $ = (sel) => document.querySelector(sel);
const embaralhar = (arr) => arr.slice().sort(() => Math.random() - 0.5);
const sortear = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Escolhe N itens diferentes de um array.
const sortearN = (arr, n) => embaralhar(arr).slice(0, n);

// ---- Adesivos coletados (salvos no aparelho) ----
const Colecao = {
  chave: "abc-aventura:adesivos",
  ler() {
    try {
      return JSON.parse(localStorage.getItem(this.chave)) || [];
    } catch (e) {
      return [];
    }
  },
  ganhar() {
    const atuais = this.ler();
    const novo = sortear(ADESIVOS);
    atuais.push(novo);
    try {
      localStorage.setItem(this.chave, JSON.stringify(atuais));
    } catch (e) {
      /* modo privado / armazenamento bloqueado: segue sem salvar */
    }
    return novo;
  },
};

// ---- Navegação entre telas ----
function mostrarTela(id) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.remove("ativa"));
  $("#" + id).classList.add("ativa");
}

// ---- Celebração (confete de emoji) ----
function celebrar() {
  const camada = $("#confete");
  const pecas = ["⭐", "🎉", "🌈", "✨", "🎈", "💫"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.className = "confete-peca";
    s.textContent = sortear(pecas);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.3 + "s";
    s.style.fontSize = 1.5 + Math.random() * 1.5 + "rem";
    camada.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
}

// ---- Recompensa padrão de acerto ----
// "partes" é a lista de pedaços de narração (ver Audio.narrar).
function premiar(elFeedback, partes) {
  Audio.acerto();
  celebrar();
  const adesivo = Colecao.ganhar();
  if (elFeedback) elFeedback.textContent = adesivo;
  if (partes) setTimeout(() => Audio.narrar(partes), 350);
}

// ---- Efeito de "errou, tenta de novo" (nunca punitivo) ----
function tremerErro(el, narrar = ["@quase"]) {
  el.classList.add("errada");
  Audio.tentarDeNovo();
  if (narrar) Audio.narrar(narrar);
  setTimeout(() => el.classList.remove("errada"), 600);
}

// ===================================================================
// JOGO 1 — Caça ao Som
// ===================================================================
const CacaAoSom = {
  alvo: null,
  iniciar() {
    mostrarTela("tela-caca");
    this.novaRodada();
  },
  novaRodada() {
    $("#caca-feedback").textContent = "";
    const usadas = new Set();
    const opcoes = [];
    for (const item of embaralhar(BANCO_PALAVRAS)) {
      const inicial = item.palavra[0];
      if (!usadas.has(inicial)) {
        usadas.add(inicial);
        opcoes.push(item);
      }
      if (opcoes.length === 3) break;
    }
    this.alvo = sortear(opcoes);
    const grade = $("#caca-cartas");
    grade.innerHTML = "";
    embaralhar(opcoes).forEach((item) => {
      const carta = document.createElement("button");
      carta.className = "carta";
      carta.innerHTML = `<span class="carta-emoji">${item.emoji}</span>`;
      carta.setAttribute("aria-label", item.palavra);
      carta.onclick = () => this.escolher(item, carta);
      grade.appendChild(carta);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@toque_som", { f: this.alvo.palavra[0] }]);
  },
  escolher(item, carta) {
    if (item === this.alvo) {
      carta.classList.add("certa");
      premiar($("#caca-feedback"), ["@muito_bem", { p: this.alvo.palavra }]);
      setTimeout(() => this.novaRodada(), 2600);
    } else {
      tremerErro(carta);
    }
  },
};

// ===================================================================
// JOGO 2 — Monta Palavra
// ===================================================================
const MontaPalavra = {
  item: null,
  progresso: 0,
  iniciar() {
    mostrarTela("tela-monta");
    this.novaRodada();
  },
  novaRodada() {
    const candidatos = BANCO_PALAVRAS.filter((p) => p.silabas.length >= 2);
    this.item = sortear(candidatos);
    this.progresso = 0;
    $("#monta-emoji").textContent = this.item.emoji;
    $("#monta-feedback").textContent = "";
    const alvo = $("#monta-alvo");
    alvo.innerHTML = "";
    this.item.silabas.forEach(() => {
      const vaga = document.createElement("span");
      vaga.className = "vaga";
      alvo.appendChild(vaga);
    });
    const banco = $("#monta-pecas");
    banco.innerHTML = "";
    embaralhar(this.item.silabas).forEach((sil) => {
      const peca = document.createElement("button");
      peca.className = "peca";
      peca.textContent = sil;
      peca.onclick = () => this.tocarPeca(sil, peca);
      banco.appendChild(peca);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@monte", { p: this.item.palavra }]);
  },
  tocarPeca(sil, peca) {
    if (sil === this.item.silabas[this.progresso]) {
      const vagas = document.querySelectorAll("#monta-alvo .vaga");
      vagas[this.progresso].textContent = sil;
      vagas[this.progresso].classList.add("preenchida");
      peca.disabled = true;
      peca.classList.add("usada");
      this.progresso++;
      Audio.narrar([{ s: sil }], { taxa: 0.8 });
      if (this.progresso === this.item.silabas.length) {
        premiar($("#monta-feedback"), ["@isso", { p: this.item.palavra }]);
        setTimeout(() => this.novaRodada(), 3000);
      }
    } else {
      tremerErro(peca, null);
    }
  },
};

// ===================================================================
// JOGO 3 — Rimas
// ===================================================================
const Rimas = {
  alvo: null,
  certa: null,
  iniciar() {
    mostrarTela("tela-rimas");
    this.novaRodada();
  },
  novaRodada() {
    $("#rimas-feedback").textContent = "";
    const grupo = sortear(GRUPOS_RIMA);
    const dois = sortearN(grupo, 2);
    this.alvo = dois[0]; // palavra mostrada
    this.certa = dois[1]; // rima correta
    // Distratores: palavras de outros grupos.
    const outras = GRUPOS_RIMA.filter((g) => g !== grupo).flat();
    const distratores = sortearN(outras, 2);
    $("#rimas-alvo").innerHTML = `
      <span class="alvo-emoji">${this.alvo.emoji}</span>
      <span class="alvo-nome">${this.alvo.palavra}</span>`;
    const grade = $("#rimas-cartas");
    grade.innerHTML = "";
    embaralhar([this.certa, ...distratores]).forEach((item) => {
      const carta = document.createElement("button");
      carta.className = "carta";
      carta.innerHTML = `<span class="carta-emoji">${item.emoji}</span>
        <span class="carta-nome">${item.palavra}</span>`;
      carta.setAttribute("aria-label", item.palavra);
      carta.onclick = () => this.escolher(item, carta);
      grade.appendChild(carta);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@qual_rima", { p: this.alvo.palavra }]);
  },
  escolher(item, carta) {
    if (item === this.certa) {
      carta.classList.add("certa");
      premiar($("#rimas-feedback"), [
        "@isso",
        { p: this.alvo.palavra },
        "@rima_com",
        { p: this.certa.palavra },
      ]);
      setTimeout(() => this.novaRodada(), 2800);
    } else {
      tremerErro(carta);
    }
  },
};

// ===================================================================
// JOGO 4 — Bate as Sílabas
// ===================================================================
const BateSilabas = {
  item: null,
  batidas: 0,
  iniciar() {
    mostrarTela("tela-bate");
    this.novaRodada();
  },
  novaRodada() {
    const candidatos = BANCO_PALAVRAS.filter((p) => p.silabas.length >= 2);
    this.item = sortear(candidatos);
    this.batidas = 0;
    $("#bate-emoji").textContent = this.item.emoji;
    $("#bate-feedback").textContent = "";
    const pontos = $("#bate-pontos");
    pontos.innerHTML = "";
    this.item.silabas.forEach(() => {
      const p = document.createElement("span");
      p.className = "ponto";
      pontos.appendChild(p);
    });
    $("#bate-tambor").disabled = false;
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@bata", { p: this.item.palavra }]);
  },
  bater() {
    if (this.batidas >= this.item.silabas.length) return;
    const pontos = document.querySelectorAll("#bate-pontos .ponto");
    pontos[this.batidas].classList.add("aceso");
    Audio.narrar([{ s: this.item.silabas[this.batidas] }], { taxa: 0.75 });
    const tambor = $("#bate-tambor");
    tambor.classList.remove("batendo");
    void tambor.offsetWidth; // reinicia a animação
    tambor.classList.add("batendo");
    this.batidas++;
    if (this.batidas === this.item.silabas.length) {
      $("#bate-tambor").disabled = true;
      setTimeout(
        () =>
          premiar($("#bate-feedback"), [{ p: this.item.palavra }, "@muito_bem"]),
        500
      );
      setTimeout(() => this.novaRodada(), 3000);
    }
  },
};

// ===================================================================
// JOGO 5 — Pescaria de Letras
// ===================================================================
const Pescaria = {
  alvo: null,
  iniciar() {
    mostrarTela("tela-pesca");
    this.novaRodada();
  },
  novaRodada() {
    $("#pesca-feedback").textContent = "";
    const letras = sortearN(ALFABETO, 6);
    this.alvo = sortear(letras);
    const lago = $("#pesca-lago");
    lago.innerHTML = "";
    letras.forEach((letra, i) => {
      const bolha = document.createElement("button");
      bolha.className = "bolha";
      bolha.textContent = letra;
      bolha.style.left = 6 + (i % 3) * 30 + Math.random() * 6 + "%";
      bolha.style.top = 8 + Math.floor(i / 3) * 42 + Math.random() * 8 + "%";
      bolha.style.animationDelay = Math.random() * 2 + "s";
      bolha.setAttribute("aria-label", letra);
      bolha.onclick = () => this.escolher(letra, bolha);
      lago.appendChild(bolha);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@pesque_som", { f: this.alvo }]);
  },
  escolher(letra, bolha) {
    if (letra === this.alvo) {
      bolha.classList.add("certa");
      premiar($("#pesca-feedback"), ["@peguei", "@rotulo_letra", { l: this.alvo }]);
      setTimeout(() => this.novaRodada(), 2600);
    } else {
      tremerErro(bolha);
    }
  },
};

// ===================================================================
// JOGO 6 — Par das Letras (memória maiúscula/minúscula)
// ===================================================================
const ParLetras = {
  cartas: [],
  virada: null,
  travado: false,
  paresRestantes: 0,
  iniciar() {
    mostrarTela("tela-par");
    this.novaRodada();
  },
  novaRodada() {
    $("#par-feedback").textContent = "";
    this.virada = null;
    this.travado = false;
    const letras = sortearN(ALFABETO, 4);
    this.paresRestantes = letras.length;
    let baralho = [];
    letras.forEach((L) => {
      baralho.push({ letra: L, face: L });
      baralho.push({ letra: L, face: L.toLowerCase() });
    });
    baralho = embaralhar(baralho);
    const grade = $("#par-grade");
    grade.innerHTML = "";
    baralho.forEach((c) => {
      const carta = document.createElement("button");
      carta.className = "memo-carta";
      carta.innerHTML = `<span class="memo-face">${c.face}</span>`;
      carta.dataset.letra = c.letra;
      carta.onclick = () => this.virar(carta);
      grade.appendChild(carta);
    });
    Audio.narrar(["@ache_pares"]);
  },
  repetir() {
    Audio.narrar(["@ache_pares"]);
  },
  virar(carta) {
    if (
      this.travado ||
      carta.classList.contains("aberta") ||
      carta.classList.contains("achada")
    )
      return;
    carta.classList.add("aberta");
    if (!this.virada) {
      this.virada = carta;
      return;
    }
    // Segunda carta virada: compara.
    if (this.virada.dataset.letra === carta.dataset.letra) {
      const par = [this.virada, carta];
      this.virada = null;
      par.forEach((c) => c.classList.add("achada"));
      Audio.narrar(["@rotulo_letra", { l: carta.dataset.letra }], { taxa: 0.9 });
      Audio.acerto();
      this.paresRestantes--;
      if (this.paresRestantes === 0) {
        premiar($("#par-feedback"), ["@achou_pares"]);
        setTimeout(() => this.novaRodada(), 3000);
      }
    } else {
      this.travado = true;
      const anterior = this.virada;
      this.virada = null;
      Audio.tentarDeNovo();
      setTimeout(() => {
        anterior.classList.remove("aberta");
        carta.classList.remove("aberta");
        this.travado = false;
      }, 900);
    }
  },
};

// ===================================================================
// JOGO 7 — Qual Sílaba Falta?
// ===================================================================
const QualSilaba = {
  item: null,
  faltante: "",
  indice: 0,
  iniciar() {
    mostrarTela("tela-silaba");
    this.novaRodada();
  },
  novaRodada() {
    $("#silaba-feedback").textContent = "";
    const candidatos = BANCO_PALAVRAS.filter((p) => p.silabas.length >= 2);
    this.item = sortear(candidatos);
    this.indice = Math.floor(Math.random() * this.item.silabas.length);
    this.faltante = this.item.silabas[this.indice];
    $("#silaba-emoji").textContent = this.item.emoji;
    // Mostra a palavra com um espaço vazio no lugar da sílaba que falta.
    const alvo = $("#silaba-alvo");
    alvo.innerHTML = "";
    this.item.silabas.forEach((sil, i) => {
      const vaga = document.createElement("span");
      vaga.className = "vaga";
      if (i === this.indice) {
        vaga.classList.add("faltando");
        vaga.textContent = "?";
      } else {
        vaga.textContent = sil;
        vaga.classList.add("preenchida");
      }
      alvo.appendChild(vaga);
    });
    // Opções: a sílaba certa + 2 sílabas de outras palavras.
    const outras = BANCO_PALAVRAS.flatMap((p) => p.silabas).filter(
      (s) => s !== this.faltante
    );
    const opcoes = embaralhar([this.faltante, ...sortearN([...new Set(outras)], 2)]);
    const banco = $("#silaba-opcoes");
    banco.innerHTML = "";
    opcoes.forEach((sil) => {
      const peca = document.createElement("button");
      peca.className = "peca";
      peca.textContent = sil;
      peca.onclick = () => this.escolher(sil, peca);
      banco.appendChild(peca);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@qual_silaba", { p: this.item.palavra }]);
  },
  escolher(sil, peca) {
    if (sil === this.faltante) {
      const vaga = document.querySelector("#silaba-alvo .faltando");
      vaga.textContent = sil;
      vaga.classList.remove("faltando");
      vaga.classList.add("preenchida");
      premiar($("#silaba-feedback"), ["@isso", { p: this.item.palavra }]);
      setTimeout(() => this.novaRodada(), 2800);
    } else {
      tremerErro(peca, null);
    }
  },
};

// ===================================================================
// JOGO 8 — Caça à Palavra (reconhecer a palavra escrita)
// ===================================================================
const CacaPalavra = {
  alvo: null,
  iniciar() {
    mostrarTela("tela-palavra");
    this.novaRodada();
  },
  novaRodada() {
    $("#palavra-feedback").textContent = "";
    const tres = sortearN(BANCO_PALAVRAS, 3);
    this.alvo = sortear(tres);
    const banco = $("#palavra-opcoes");
    banco.innerHTML = "";
    tres.forEach((item) => {
      const b = document.createElement("button");
      b.className = "palavra-opcao";
      b.textContent = item.palavra;
      b.onclick = () => this.escolher(item, b);
      banco.appendChild(b);
    });
    this.repetir();
  },
  repetir() {
    Audio.narrar(["@onde_escrito", { p: this.alvo.palavra }]);
  },
  escolher(item, b) {
    if (item === this.alvo) {
      b.classList.add("certa");
      b.textContent = `${this.alvo.emoji} ${this.alvo.palavra}`;
      premiar($("#palavra-feedback"), ["@isso", { p: this.alvo.palavra }]);
      setTimeout(() => this.novaRodada(), 2600);
    } else {
      tremerErro(b, null);
    }
  },
};

// ===================================================================
// JOGO 9 — Desenha a Letra (traçado com o dedo)
// ===================================================================
const DesenhaLetra = {
  letra: "A",
  ctx: null,
  canvas: null,
  desenhando: false,
  pronto: false,
  iniciar() {
    mostrarTela("tela-desenha");
    if (!this.ctx) this.montar();
    this.novaLetra();
  },
  montar() {
    this.canvas = $("#desenha-canvas");
    this.ctx = this.canvas.getContext("2d");
    const pos = (e) => {
      const r = this.canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return {
        x: ((p.clientX - r.left) / r.width) * this.canvas.width,
        y: ((p.clientY - r.top) / r.height) * this.canvas.height,
      };
    };
    const comecar = (e) => {
      e.preventDefault();
      this.desenhando = true;
      const { x, y } = pos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    };
    const mover = (e) => {
      if (!this.desenhando) return;
      e.preventDefault();
      const { x, y } = pos(e);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    };
    const parar = () => {
      this.desenhando = false;
    };
    this.canvas.addEventListener("pointerdown", comecar);
    this.canvas.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", parar);
  },
  ajustarTamanho() {
    // Casa a resolução do canvas com o tamanho exibido (nitidez).
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = r.width || 320;
    this.canvas.height = r.height || 320;
  },
  novaLetra() {
    this.letra = sortear(ALFABETO);
    this.pronto = false;
    $("#desenha-feedback").textContent = "";
    this.ajustarTamanho();
    this.redesenhar();
    this.repetir();
  },
  redesenhar() {
    const c = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    c.clearRect(0, 0, w, h);
    // Letra-guia clarinha ao fundo.
    c.fillStyle = "rgba(255,255,255,0.28)";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `bold ${h * 0.72}px "Baloo 2", "Comic Sans MS", sans-serif`;
    c.fillText(this.letra, w / 2, h / 2);
    // Configura o traço colorido do dedo.
    c.strokeStyle = "#ffd43b";
    c.lineWidth = Math.max(10, w * 0.045);
    c.lineCap = "round";
    c.lineJoin = "round";
  },
  limpar() {
    this.redesenhar();
  },
  concluir() {
    if (this.pronto) return;
    this.pronto = true;
    premiar($("#desenha-feedback"), ["@boa_essa", { l: this.letra }]);
    setTimeout(() => this.novaLetra(), 2800);
  },
  repetir() {
    Audio.narrar(["@desenhe", { l: this.letra }, "@faz_som", { f: this.letra }]);
  },
};

// ===================================================================
// Álbum de adesivos
// ===================================================================
const Album = {
  iniciar() {
    mostrarTela("tela-album");
    const grade = $("#album-grade");
    const adesivos = Colecao.ler();
    if (adesivos.length === 0) {
      grade.innerHTML =
        '<p class="album-vazio">Jogue para ganhar adesivos! 🎁</p>';
      Audio.narrar(["@jogue_adesivos"]);
      return;
    }
    grade.innerHTML = "";
    adesivos.forEach((a) => {
      const s = document.createElement("span");
      s.className = "album-adesivo";
      s.textContent = a;
      grade.appendChild(s);
    });
    Audio.falar(`Você tem ${adesivos.length} adesivos! Que legal!`);
  },
};

// ===================================================================
// Menu inicial (montado a partir desta lista)
// ===================================================================
const JOGOS = [
  { nome: "Caça ao Som", icone: "🔎", cor: "c1", jogo: CacaAoSom },
  { nome: "Monta Palavra", icone: "🧩", cor: "c2", jogo: MontaPalavra },
  { nome: "Rimas", icone: "🎵", cor: "c3", jogo: Rimas },
  { nome: "Bate as Sílabas", icone: "🥁", cor: "c4", jogo: BateSilabas },
  { nome: "Pescaria", icone: "🎣", cor: "c5", jogo: Pescaria },
  { nome: "Par das Letras", icone: "🃏", cor: "c6", jogo: ParLetras },
  { nome: "Sílaba que Falta", icone: "❓", cor: "c1", jogo: QualSilaba },
  { nome: "Caça à Palavra", icone: "📖", cor: "c2", jogo: CacaPalavra },
  { nome: "Desenha a Letra", icone: "✏️", cor: "c3", jogo: DesenhaLetra },
  { nome: "Meus Adesivos", icone: "🏆", cor: "c4", jogo: Album },
];

// Mapa nome->módulo para os botões "ouvir de novo".
const MODULOS = {
  CacaAoSom, MontaPalavra, Rimas, BateSilabas, Pescaria,
  ParLetras, QualSilaba, CacaPalavra, DesenhaLetra,
};

// ===================================================================
// Início
// ===================================================================
window.addEventListener("DOMContentLoaded", () => {
  // Monta os botões do menu.
  const menu = $("#menu");
  JOGOS.forEach((j) => {
    const b = document.createElement("button");
    b.className = "botao-jogo " + j.cor;
    b.innerHTML = `<span class="botao-icone">${j.icone}</span>
      <span class="botao-texto">${j.nome}</span>`;
    b.onclick = () => j.jogo.iniciar();
    menu.appendChild(b);
  });

  // Botões "voltar para o início".
  document.querySelectorAll("[data-voltar]").forEach((b) => {
    b.onclick = () => mostrarTela("tela-inicio");
  });

  // Botões "ouvir de novo".
  document.querySelectorAll("[data-repetir]").forEach((b) => {
    b.onclick = () => {
      const m = MODULOS[b.dataset.repetir];
      if (m && m.repetir) m.repetir();
    };
  });

  // Botões do quadro de desenho.
  $("#desenha-limpar").onclick = () => DesenhaLetra.limpar();
  $("#desenha-pronto").onclick = () => DesenhaLetra.concluir();

  // Tambor do jogo Bate as Sílabas.
  $("#bate-tambor").onclick = () => BateSilabas.bater();

  // Saudação inicial (só fala após o primeiro toque, por regra dos
  // navegadores de áudio).
  const saudar = () => {
    Audio.narrar(["@saudacao"]);
    document.removeEventListener("pointerdown", saudar);
  };
  document.addEventListener("pointerdown", saudar);
});
