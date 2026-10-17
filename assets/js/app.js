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
  liberar();
  document.querySelectorAll(".tela").forEach((t) => t.classList.remove("ativa"));
  $("#" + id).classList.add("ativa");
  document.body.dataset.tela = id; // usado para mostrar o mascote nos jogos
}

// ---- Ouvir antes de responder ----
// Enquanto a pergunta toca, as opções do jogo ficam travadas (e um pouco
// apagadas), para a criança não tocar antes de ouvir o que foi pedido.
// Voltar (🏠) e ouvir de novo (🔊) continuam funcionando.
// O mesmo vale para o som depois de cada toque (a sílaba, a letra): só dá
// para tocar de novo depois de ouvir.
let bloqueioId = 0;
let bloqueioTimer = null;
function liberar() {
  bloqueioId++;
  clearTimeout(bloqueioTimer);
  clearTimeout(Rodada.timer);
  Rodada.id++; // o que estava agendado no jogo anterior não roda mais
  document.body.classList.remove("ouvindo", "pausa");
}
// Fala travando as opções. Devolve uma promessa que termina com a fala.
function pedir(partes, opts) {
  const id = ++bloqueioId;
  document.body.classList.add("ouvindo");
  const fim = () => {
    if (id !== bloqueioId) return;
    clearTimeout(bloqueioTimer);
    document.body.classList.remove("ouvindo");
  };
  clearTimeout(bloqueioTimer);
  bloqueioTimer = setTimeout(fim, 10000); // segurança: nunca trava para sempre
  return Promise.resolve(Audio.narrar(partes, opts)).then(fim, fim);
}
// Os toques também passam por aqui (o CSS já bloqueia; isto pega toques
// muito rápidos, no mesmo instante em que a trava liga).
function podeTocar() {
  const c = document.body.classList;
  return !c.contains("ouvindo") && !c.contains("pausa") && !Rodada.fim;
}

// ---- Rodada: conta os erros de cada rodada ----
// O adesivo e o avanço de nível vêm só no acerto de primeira, para valer
// ouvir com atenção em vez de tocar em tudo até acertar.
const Rodada = {
  id: 0,
  erros: 0,
  fim: false,
  timer: null,
  comecar() {
    this.id++;
    this.erros = 0;
    this.fim = false;
    clearTimeout(this.timer);
    document.body.classList.remove("pausa");
  },
  // Depois do acerto, nada de toques até a próxima rodada.
  encerrar() {
    this.fim = true;
    document.body.classList.add("pausa");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => document.body.classList.remove("pausa"), 8000);
  },
};

// Agenda um passo desta rodada (próxima rodada, prêmio). Se a criança sair
// do jogo ou a rodada mudar antes, o passo é descartado.
function depois(ms, fn) {
  const id = Rodada.id;
  setTimeout(() => id === Rodada.id && fn(), ms);
}
function quando(promessa, fn) {
  const id = Rodada.id;
  promessa.then(() => id === Rodada.id && fn());
}

// Palavras liberadas para o nível atual da criança (cumulativo: nível 1
// até o nível de agora), garantindo dificuldade crescente.
function palavrasDoNivel() {
  const n = Progresso.nivel;
  const pool = BANCO_PALAVRAS.filter((p) => p.nivel <= n);
  return pool.length ? pool : BANCO_PALAVRAS;
}

// ---- Mascote (coruja Lili) que reage durante os jogos ----
const Mascote = {
  el: null,
  init() {
    this.el = $("#mascote");
  },
  reagir(classe, ms) {
    if (!this.el) return;
    this.el.classList.remove("feliz", "incentiva");
    void this.el.offsetWidth; // reinicia a animação
    this.el.classList.add(classe);
    setTimeout(() => this.el && this.el.classList.remove(classe), ms);
  },
  comemorar() {
    this.reagir("feliz", 1000);
  },
  incentivar() {
    this.reagir("incentiva", 600);
  },
};

// ---- Avisos rápidos (toasts) ----
function toast(msg) {
  const cx = $("#toast");
  if (!cx) return;
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = msg;
  cx.appendChild(t);
  setTimeout(() => t.classList.add("show"), 20);
  setTimeout(() => t.classList.remove("show"), 3200);
  setTimeout(() => t.remove(), 3600);
}

// ---- Home: nível e saudação ----
function atualizarHomeProgresso() {
  const num = $("#nivel-num");
  const barra = $("#nivel-preenchido");
  if (num) num.textContent = Progresso.nivel;
  if (barra) {
    const p = Progresso.progressoNivel();
    barra.style.width = Math.round((p.atual / p.meta) * 100) + "%";
  }
}
function atualizarSaudacao() {
  const s = $("#home-saudacao");
  if (!s) return;
  s.textContent = Progresso.temNome()
    ? "Oi, " + Progresso.nome + "! Vamos brincar?"
    : "Vamos aprender a ler brincando!";
}
function festaDeNivel(nivel) {
  celebrar();
  toast("🎉 Você subiu para o Nível " + nivel + "!");
  Mascote.comemorar();
  const nome = Progresso.temNome() ? Progresso.nome + ", " : "";
  Audio.falar("Parabéns " + nome + "você subiu para o nível " + nivel + "!");
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
  const dePrimeira = Rodada.erros === 0;
  Rodada.encerrar();
  Audio.acerto();
  Mascote.comemorar();
  if (!dePrimeira) {
    // Acertou depois de errar: elogio, sem adesivo nem avanço de nível.
    if (elFeedback) elFeedback.textContent = "👍";
    if (partes) depois(350, () => Audio.narrar(partes));
    return;
  }
  celebrar();
  const adesivo = Colecao.ganhar();
  if (elFeedback) elFeedback.textContent = adesivo;
  const r = Progresso.registrarAcerto();
  atualizarHomeProgresso();
  if (partes) depois(350, () => Audio.narrar(partes));
  if (r.subiu) setTimeout(() => festaDeNivel(r.nivel), 1400);
}

// ---- Errou: "quase!" e escuta de novo o que foi pedido (nunca punitivo) ----
// No 2º erro da rodada, a resposta certa brilha: a criança aprende em vez
// de seguir chutando.
function errou(jogo, el, certo) {
  Rodada.erros++;
  el.classList.add("errada");
  setTimeout(() => el.classList.remove("errada"), 600);
  Audio.tentarDeNovo();
  Mascote.incentivar();
  pedir(["@quase", ...jogo.pergunta()]);
  if (Rodada.erros >= 2 && certo) certo.classList.add("dica");
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
    Rodada.comecar();
    $("#caca-feedback").textContent = "";
    const usadas = new Set();
    const opcoes = [];
    for (const item of embaralhar(palavrasDoNivel())) {
      const inicial = chaveTexto(item.palavra)[0]; // ÁGUA -> A
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
  pergunta() {
    return ["@toque_som", { f: chaveTexto(this.alvo.palavra)[0] }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(item, carta) {
    if (!podeTocar()) return;
    if (item === this.alvo) {
      carta.classList.add("certa");
      premiar($("#caca-feedback"), ["@muito_bem", { p: this.alvo.palavra }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#caca-cartas").children].find(
        (c) => c.getAttribute("aria-label") === this.alvo.palavra
      );
      errou(this, carta, certa);
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
    const candidatos = palavrasDoNivel().filter((p) => p.silabas.length >= 2);
    Rodada.comecar();
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
  pergunta() {
    return ["@monte", { p: this.item.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  tocarPeca(sil, peca) {
    if (!podeTocar()) return;
    if (sil === this.item.silabas[this.progresso]) {
      document.querySelectorAll("#monta-pecas .dica").forEach((d) => d.classList.remove("dica"));
      const vagas = document.querySelectorAll("#monta-alvo .vaga");
      vagas[this.progresso].textContent = sil;
      vagas[this.progresso].classList.add("preenchida");
      peca.disabled = true;
      peca.classList.add("usada");
      this.progresso++;
      // Ouve a sílaba antes de poder tocar na próxima.
      const ouvida = pedir([{ s: sil }], { taxa: 0.8 });
      if (this.progresso === this.item.silabas.length) {
        Rodada.encerrar();
        quando(ouvida, () => {
          premiar($("#monta-feedback"), ["@isso", { p: this.item.palavra }]);
          depois(2600, () => this.novaRodada());
        });
      }
    } else {
      const proxima = this.item.silabas[this.progresso];
      const certa = [...$("#monta-pecas").children].find(
        (b) => !b.disabled && b.textContent === proxima
      );
      errou(this, peca, certa);
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
    Rodada.comecar();
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
  pergunta() {
    return ["@qual_rima", { p: this.alvo.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(item, carta) {
    if (!podeTocar()) return;
    if (item === this.certa) {
      carta.classList.add("certa");
      premiar($("#rimas-feedback"), [
        "@isso",
        { p: this.alvo.palavra },
        "@rima_com",
        { p: this.certa.palavra },
      ]);
      depois(2800, () => this.novaRodada());
    } else {
      const certa = [...$("#rimas-cartas").children].find(
        (c) => c.getAttribute("aria-label") === this.certa.palavra
      );
      errou(this, carta, certa);
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
    const candidatos = palavrasDoNivel().filter((p) => p.silabas.length >= 2);
    Rodada.comecar();
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
  pergunta() {
    return ["@bata", { p: this.item.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  bater() {
    if (!podeTocar()) return;
    if (this.batidas >= this.item.silabas.length) return;
    const pontos = document.querySelectorAll("#bate-pontos .ponto");
    pontos[this.batidas].classList.add("aceso");
    // Ouve a sílaba antes da próxima batida.
    const ouvida = pedir([{ s: this.item.silabas[this.batidas] }], { taxa: 0.75 });
    const tambor = $("#bate-tambor");
    tambor.classList.remove("batendo");
    void tambor.offsetWidth; // reinicia a animação
    tambor.classList.add("batendo");
    this.batidas++;
    if (this.batidas === this.item.silabas.length) {
      $("#bate-tambor").disabled = true;
      Rodada.encerrar();
      quando(ouvida, () => {
        premiar($("#bate-feedback"), [{ p: this.item.palavra }, "@muito_bem"]);
        depois(2600, () => this.novaRodada());
      });
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
    Rodada.comecar();
    $("#pesca-feedback").textContent = "";
    const letras = sortearN(ALFABETO_COM_SOM, 6); // H é mudo: fora da pescaria de sons
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
  pergunta() {
    return ["@pesque_som", { f: this.alvo }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(letra, bolha) {
    if (!podeTocar()) return;
    if (letra === this.alvo) {
      bolha.classList.add("certa");
      premiar($("#pesca-feedback"), ["@peguei", "@rotulo_letra", { l: this.alvo }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#pesca-lago").children].find((b) => b.textContent === this.alvo);
      errou(this, bolha, certa);
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
    Rodada.comecar();
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
    this.repetir();
  },
  pergunta() {
    return ["@ache_pares"];
  },
  repetir() {
    pedir(this.pergunta());
  },
  virar(carta) {
    if (
      !podeTocar() ||
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
      Audio.acerto();
      // Ouve o nome da letra antes de virar outra carta.
      const ouvida = pedir(["@rotulo_letra", { l: carta.dataset.letra }], { taxa: 0.9 });
      this.paresRestantes--;
      if (this.paresRestantes === 0) {
        Rodada.encerrar();
        quando(ouvida, () => {
          premiar($("#par-feedback"), ["@achou_pares"]);
          depois(2600, () => this.novaRodada());
        });
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
    Rodada.comecar();
    $("#silaba-feedback").textContent = "";
    const candidatos = palavrasDoNivel().filter((p) => p.silabas.length >= 2);
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
    const outras = palavrasDoNivel().flatMap((p) => p.silabas).filter(
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
  pergunta() {
    return ["@qual_silaba", { p: this.item.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(sil, peca) {
    if (!podeTocar()) return;
    if (sil === this.faltante) {
      const vaga = document.querySelector("#silaba-alvo .faltando");
      vaga.textContent = sil;
      vaga.classList.remove("faltando");
      vaga.classList.add("preenchida");
      premiar($("#silaba-feedback"), ["@isso", { p: this.item.palavra }]);
      depois(2800, () => this.novaRodada());
    } else {
      const certa = [...$("#silaba-opcoes").children].find((b) => b.textContent === this.faltante);
      errou(this, peca, certa);
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
    Rodada.comecar();
    $("#palavra-feedback").textContent = "";
    const tres = sortearN(palavrasDoNivel(), 3);
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
  pergunta() {
    return ["@onde_escrito", { p: this.alvo.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(item, b) {
    if (!podeTocar()) return;
    if (item === this.alvo) {
      b.classList.add("certa");
      b.textContent = `${this.alvo.emoji} ${this.alvo.palavra}`;
      premiar($("#palavra-feedback"), ["@isso", { p: this.alvo.palavra }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#palavra-opcoes").children].find((x) => x.textContent === this.alvo.palavra);
      errou(this, b, certa);
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
  GRID: 48, // resolução da máscara de conferência
  mascara: null, // células que formam a letra (núcleo)
  tolerancia: null, // letra + uma banda de folga (o dedo é impreciso)
  tinta: null, // células que a criança pintou
  letterTotal: 0,
  inkTotal: 0,
  onLetter: 0, // pintado sobre a letra
  fora: 0, // pintado claramente fora (além da banda de tolerância)
  ultimo: null,
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
      this.ultimo = { x, y };
      this.marcarPonto(x, y);
    };
    const mover = (e) => {
      if (!this.desenhando) return;
      e.preventDefault();
      const { x, y } = pos(e);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      if (this.ultimo) this.marcarLinha(this.ultimo.x, this.ultimo.y, x, y);
      this.ultimo = { x, y };
    };
    const parar = () => {
      this.desenhando = false;
      this.ultimo = null;
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
    Rodada.comecar();
    this.letra = sortear(ALFABETO);
    this.pronto = false;
    $("#desenha-feedback").textContent = "";
    this.ajustarTamanho();
    this.redesenhar();
    this.construirMascara();
    this.zerarTinta();
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
  // Rasteriza a letra numa grade pequena para saber onde ela está.
  construirMascara() {
    const G = this.GRID;
    const off = document.createElement("canvas");
    off.width = G;
    off.height = G;
    const c = off.getContext("2d");
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `bold ${G * 0.72}px "Baloo 2", "Comic Sans MS", sans-serif`;
    c.fillText(this.letra, G / 2, G / 2);
    const d = c.getImageData(0, 0, G, G).data;
    this.mascara = new Uint8Array(G * G);
    this.letterTotal = 0;
    for (let i = 0; i < G * G; i++) {
      if (d[i * 4 + 3] > 40) {
        this.mascara[i] = 1;
        this.letterTotal++;
      }
    }
    // Banda de tolerância: dilata a letra alguns pixels. O dedo é grosso
    // e impreciso, então uma folga em volta não conta como "fora".
    const R = 3;
    this.tolerancia = new Uint8Array(G * G);
    for (let y = 0; y < G; y++) {
      for (let x = 0; x < G; x++) {
        if (!this.mascara[y * G + x]) continue;
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            if (dx * dx + dy * dy > R * R) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < G && ny < G) this.tolerancia[ny * G + nx] = 1;
          }
        }
      }
    }
  },
  zerarTinta() {
    this.tinta = new Uint8Array(this.GRID * this.GRID);
    this.inkTotal = 0;
    this.onLetter = 0;
    this.fora = 0;
  },
  marcarPonto(x, y) {
    const G = this.GRID;
    const cx = Math.floor((x / this.canvas.width) * G);
    const cy = Math.floor((y / this.canvas.height) * G);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const gx = cx + dx;
        const gy = cy + dy;
        if (gx < 0 || gy < 0 || gx >= G || gy >= G) continue;
        const i = gy * G + gx;
        if (!this.tinta[i]) {
          this.tinta[i] = 1;
          this.inkTotal++;
          if (this.mascara && this.mascara[i]) this.onLetter++;
          else if (this.tolerancia && !this.tolerancia[i]) this.fora++;
        }
      }
    }
  },
  marcarLinha(x0, y0, x1, y1) {
    const passos = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
    for (let s = 0; s <= passos; s++) {
      const t = s / passos;
      this.marcarPonto(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  },
  limpar() {
    this.redesenhar();
    this.zerarTinta();
  },
  concluir() {
    if (this.pronto) return;
    const cobertura = this.letterTotal ? this.onLetter / this.letterTotal : 0;
    // "O que passa fora penaliza o que passa dentro": a pontuação é o que
    // ficou sobre a letra menos o que vazou claramente para fora (além da
    // banda de tolerância). Rabiscar por cima também sai da letra, então
    // não passa — só seguir a linha, cobrindo a letra, passa.
    const pontuacao = this.letterTotal
      ? (this.onLetter - this.fora) / this.letterTotal
      : 0;
    const passou =
      this.inkTotal >= 12 && cobertura >= 0.5 && pontuacao >= 0.35;
    if (!passou) {
      Mascote.incentivar();
      Audio.tentarDeNovo();
      Audio.falar("Vamos seguir a linha da letrinha! Tente de novo.");
      this.canvas.classList.add("errada");
      setTimeout(() => this.canvas.classList.remove("errada"), 600);
      return;
    }
    this.pronto = true;
    premiar($("#desenha-feedback"), ["@boa_essa", { l: this.letra }]);
    depois(2800, () => this.novaLetra());
  },
  pergunta() {
    // O H é mudo: só diz o nome da letra, sem "ela faz o som…".
    const partes = ["@desenhe", { l: this.letra }];
    if (SOM_DA_LETRA[this.letra]) partes.push("@faz_som", { f: this.letra });
    return partes;
  },
  repetir() {
    pedir(this.pergunta());
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
// Tela do nome — a criança escreve o nome tocando nas letras
// ===================================================================
const NomeTela = {
  buffer: "",
  ALFA: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  montarTeclado() {
    const t = $("#teclado");
    if (t.childElementCount) return;
    this.ALFA.forEach((L) => {
      const b = document.createElement("button");
      b.className = "tecla";
      b.textContent = L;
      b.onclick = () => this.digitar(L);
      t.appendChild(b);
    });
  },
  abrir() {
    this.montarTeclado();
    this.buffer = Progresso.nome || "";
    this.render();
    mostrarTela("tela-nome");
    Audio.falar("Qual é o seu nome? Toque nas letrinhas.");
  },
  digitar(L) {
    if (this.buffer.length >= 12) return;
    this.buffer += L;
    this.render();
    Audio.narrar([{ l: L }]);
  },
  apagar() {
    this.buffer = this.buffer.slice(0, -1);
    this.render();
  },
  render() {
    const m = $("#nome-mostrador");
    m.innerHTML = "";
    if (this.buffer.length === 0) {
      m.innerHTML = '<span class="nome-vazio">_</span>';
    } else {
      this.buffer.split("").forEach((L) => {
        const s = document.createElement("span");
        s.className = "nome-letra";
        s.textContent = L;
        m.appendChild(s);
      });
    }
    $("#nome-pronto").disabled = this.buffer.trim().length === 0;
  },
  confirmar() {
    if (this.buffer.trim().length === 0) return;
    Progresso.definirNome(this.buffer);
    atualizarSaudacao();
    atualizarHomeProgresso();
    mostrarTela("tela-inicio");
    celebrar();
    Audio.falar("Oi, " + Progresso.nome + "! Vamos brincar?");
  },
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

  // Tela do nome.
  $("#nome-apagar").onclick = () => NomeTela.apagar();
  $("#nome-pronto").onclick = () => NomeTela.confirmar();
  $("#trocar-nome").onclick = () => NomeTela.abrir();

  // Mascote, saudação e progresso.
  Mascote.init();
  atualizarSaudacao();
  atualizarHomeProgresso();

  // Primeiro acesso pede o nome; depois vai direto para a home.
  if (Progresso.temNome()) {
    mostrarTela("tela-inicio");
  } else {
    NomeTela.abrir();
  }
});
