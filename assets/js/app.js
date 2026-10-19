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
  Sessao.jogo = null;
  if (typeof Descanso !== "undefined") Descanso.esconder();
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
  Rodada.fim = false; // trocar de tela zera a rodada (senão os toques ficam travados)
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

// Quantas opções mostrar: no nível 1 são só 2 (menos chance de errar).
function nOpcoes(padrao) {
  return Progresso.nivel <= 1 ? 2 : padrao;
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

// ---- Começo calmo de cada rodada ----
// As opções aparecem já travadas e a pergunta vem depois de uma pausinha.
// Na primeira rodada de cada jogo, a coruja convida: "Vamos ouvir com
// atenção?". A cada 10 rodadas, ela sugere um descanso.
const Sessao = { jogo: null, rodadas: 0, DESCANSO_A_CADA: 10 };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
function perguntar(jogo) {
  document.body.classList.add("ouvindo");
  if (Sessao.rodadas >= Sessao.DESCANSO_A_CADA) {
    Sessao.rodadas = 0;
    Descanso.mostrar(jogo);
    return;
  }
  const primeira = Sessao.jogo !== jogo;
  Sessao.jogo = jogo;
  depois(primeira ? 400 : 700, () => {
    if (!primeira) return jogo.repetir();
    Mascote.incentivar();
    const id = Rodada.id;
    Promise.race([Audio.narrar(["@ouvir_atencao"]), espera(5000)]).then(
      () => id === Rodada.id && jogo.repetir()
    );
  });
}

const Descanso = {
  jogo: null,
  mostrar(jogo) {
    this.jogo = jogo;
    $("#descanso").hidden = false;
    Mascote.comemorar();
    Audio.narrar(["@descanso"]);
  },
  esconder() {
    $("#descanso").hidden = true;
  },
  descansar() {
    this.esconder();
    Audio.parar();
    mostrarTela("tela-inicio");
  },
  continuar() {
    this.esconder();
    if (this.jogo) perguntar(this.jogo);
  },
};

// ---- Estatísticas para os pais (salvas no aparelho) ----
// Só os jogos de escolha, onde dá para chutar.
const JOGOS_COM_ESCOLHA = {
  "tela-caca": "Caça ao Som",
  "tela-monta": "Monta Palavra",
  "tela-rimas": "Rimas",
  "tela-pesca": "Pescaria",
  "tela-silaba": "Sílaba que Falta",
  "tela-palavra": "Caça à Palavra",
  "tela-meunome": "Letras do Meu Nome",
  "tela-trem": "Trem das Vogais",
  "tela-vogal": "Vogal que Falta",
  "tela-encontro": "Ai! Oi! Ui!",
  "tela-quantos": "Quantos Tem?",
  "tela-bingo": "Bingo (marcações)",
};
const Estatisticas = {
  chave: "abc-aventura:estatisticas",
  ler() {
    try {
      return Object.assign({ jogos: {}, dias: {} }, JSON.parse(localStorage.getItem(this.chave)) || {});
    } catch (e) {
      return { jogos: {}, dias: {} };
    }
  },
  hoje() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  },
  registrar(tela, dePrimeira) {
    if (!JOGOS_COM_ESCOLHA[tela]) return;
    const e = this.ler();
    const campo = dePrimeira ? "primeira" : "depois";
    const j = (e.jogos[tela] = e.jogos[tela] || { primeira: 0, depois: 0 });
    j[campo]++;
    const dia = (e.dias[this.hoje()] = e.dias[this.hoje()] || { primeira: 0, depois: 0 });
    dia[campo]++;
    // Guarda só os últimos 60 dias.
    Object.keys(e.dias).sort().slice(0, -60).forEach((k) => delete e.dias[k]);
    try {
      localStorage.setItem(this.chave, JSON.stringify(e));
    } catch (_) {}
  },
  zerar() {
    try {
      localStorage.removeItem(this.chave);
    } catch (_) {}
  },
};

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
  Sessao.rodadas++;
  Estatisticas.registrar(document.body.dataset.tela, dePrimeira);
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
      if (opcoes.length === nOpcoes(3)) break;
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
    perguntar(this);
  },
  pergunta() {
    // Fala o NOME da letra ("éfe"), não o som ("fff"): é mais fácil de entender.
    return ["@toque_letra", { l: chaveTexto(this.alvo.palavra)[0] }];
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
    perguntar(this);
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
    const distratores = sortearN(outras, nOpcoes(3) - 1);
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
    perguntar(this);
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
    perguntar(this);
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
    // Pede a letra pelo nome (então o H também entra). Menos peixes no começo.
    const qtd = Progresso.nivel <= 1 ? 3 : Progresso.nivel === 2 ? 4 : 6;
    const letras = sortearN(ALFABETO, qtd);
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
    perguntar(this);
  },
  pergunta() {
    return ["@pesque_letra", { l: this.alvo }];
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
    const letras = sortearN(ALFABETO, Progresso.nivel <= 1 ? 3 : 4);
    this.paresRestantes = letras.length;
    let baralho = [];
    letras.forEach((L) => {
      baralho.push({ letra: L, face: L });
      baralho.push({ letra: L, face: L.toLowerCase() });
    });
    baralho = embaralhar(baralho);
    const grade = $("#par-grade");
    grade.innerHTML = "";
    grade.classList.toggle("tres-pares", letras.length === 3);
    baralho.forEach((c) => {
      const carta = document.createElement("button");
      carta.className = "memo-carta";
      carta.innerHTML = `<span class="memo-face">${c.face}</span>`;
      carta.dataset.letra = c.letra;
      carta.onclick = () => this.virar(carta);
      grade.appendChild(carta);
    });
    perguntar(this);
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
    const opcoes = embaralhar([this.faltante, ...sortearN([...new Set(outras)], nOpcoes(3) - 1)]);
    const banco = $("#silaba-opcoes");
    banco.innerHTML = "";
    opcoes.forEach((sil) => {
      const peca = document.createElement("button");
      peca.className = "peca";
      peca.textContent = sil;
      peca.onclick = () => this.escolher(sil, peca);
      banco.appendChild(peca);
    });
    perguntar(this);
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
    const tres = sortearN(palavrasDoNivel(), nOpcoes(3));
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
    perguntar(this);
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
  modo: "letra", // "letra" ou "numero" (o mesmo quadro serve para os dois)
  iniciar(modo) {
    this.modo = modo === "numero" ? "numero" : "letra";
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
    this.letra =
      this.modo === "numero"
        ? sortear((Progresso.nivel <= 1 ? "12345" : "0123456789").split(""))
        : sortear(ALFABETO);
    this.pronto = false;
    $("#desenha-feedback").textContent = "";
    this.ajustarTamanho();
    this.redesenhar();
    this.construirMascara();
    this.zerarTinta();
    perguntar(this);
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
      Audio.falar(
        this.modo === "numero"
          ? "Vamos seguir a linha do número! Tente de novo."
          : "Vamos seguir a linha da letrinha! Tente de novo."
      );
      this.canvas.classList.add("errada");
      setTimeout(() => this.canvas.classList.remove("errada"), 600);
      return;
    }
    this.pronto = true;
    premiar(
      $("#desenha-feedback"),
      this.modo === "numero" ? ["@muito_bem", { n: +this.letra }] : ["@boa_essa", { l: this.letra }]
    );
    depois(2800, () => this.novaLetra());
  },
  pergunta() {
    if (this.modo === "numero") return ["@desenhe_numero", { n: +this.letra }];
    return ["@desenhe", { l: this.letra }];
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

// ===================================================================
// VOGAIS — Trem das Vogais (com qual vogal a palavra começa)
// ===================================================================
const TremVogais = {
  alvo: null,
  certa: "",
  iniciar() {
    mostrarTela("tela-trem");
    this.novaRodada();
  },
  // Palavras que começam com vogal (sem "ES", que muita gente fala "is").
  palavras() {
    return BANCO_PALAVRAS.concat(PALAVRAS_EXTRAS).filter((p) => {
      const k = chaveTexto(p.palavra);
      return VOGAIS.includes(k[0]) && !k.startsWith("ES");
    });
  },
  novaRodada() {
    Rodada.comecar();
    $("#trem-feedback").textContent = "";
    const lista = this.palavras();
    // Sorteia a vogal primeiro (todas aparecem por igual), depois a palavra.
    this.certa = sortear(VOGAIS.filter((v) => lista.some((p) => chaveTexto(p.palavra)[0] === v)));
    this.alvo = sortear(lista.filter((p) => chaveTexto(p.palavra)[0] === this.certa));
    $("#trem-emoji").textContent = this.alvo.emoji;
    const n = Progresso.nivel <= 1 ? 2 : Progresso.nivel === 2 ? 3 : 5;
    const escolhidas = [this.certa, ...sortearN(VOGAIS.filter((v) => v !== this.certa), n - 1)];
    const trem = $("#trem-vagoes");
    trem.innerHTML = '<span class="locomotiva" aria-hidden="true">🚂</span>';
    // Vagões sempre na ordem A E I O U.
    VOGAIS.filter((v) => escolhidas.includes(v)).forEach((v) => {
      const b = document.createElement("button");
      b.className = "vagao";
      b.textContent = v;
      b.setAttribute("aria-label", v);
      b.onclick = () => this.escolher(v, b);
      trem.appendChild(b);
    });
    perguntar(this);
  },
  pergunta() {
    return ["@vogal_comeca", { p: this.alvo.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(v, b) {
    if (!podeTocar()) return;
    if (v === this.certa) {
      b.classList.add("certa");
      premiar($("#trem-feedback"), ["@isso", { p: this.alvo.palavra }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#trem-vagoes").querySelectorAll(".vagao")].find((x) => x.textContent === this.certa);
      errou(this, b, certa);
    }
  },
};

// ===================================================================
// VOGAIS — Vogal que Falta (G_TO)
// ===================================================================
const VogalFalta = {
  item: null,
  indice: 0,
  faltante: "",
  iniciar() {
    mostrarTela("tela-vogal");
    this.novaRodada();
  },
  // Posições que dá para esconder: vogal sem acento; não o U mudo de QU/GU;
  // nem o E/O do fim (fala-se "i"/"u": PEIXE soa "peixi").
  posicoes(palavra) {
    const L = [...palavra];
    return L.map((c, i) => {
      if (!VOGAIS.includes(c)) return -1;
      if (c === "U" && /[QG]/.test(L[i - 1] || "") && /[EI]/.test(L[i + 1] || "")) return -1;
      if (i === L.length - 1 && (c === "E" || c === "O")) return -1;
      return i;
    }).filter((i) => i >= 0);
  },
  novaRodada() {
    Rodada.comecar();
    $("#vogal-feedback").textContent = "";
    const cand = palavrasDoNivel().filter((p) => this.posicoes(p.palavra).length);
    this.item = sortear(cand);
    this.indice = sortear(this.posicoes(this.item.palavra));
    const letras = [...this.item.palavra];
    this.faltante = letras[this.indice];
    $("#vogal-emoji").textContent = this.item.emoji;
    const alvo = $("#vogal-alvo");
    alvo.innerHTML = "";
    letras.forEach((c, i) => {
      const vaga = document.createElement("span");
      vaga.className = "vaga letra-vaga";
      if (i === this.indice) {
        vaga.classList.add("faltando");
        vaga.textContent = "?";
      } else {
        vaga.textContent = c;
        vaga.classList.add("preenchida");
      }
      alvo.appendChild(vaga);
    });
    const escolhidas = [this.faltante, ...sortearN(VOGAIS.filter((v) => v !== this.faltante), nOpcoes(3) - 1)];
    const banco = $("#vogal-opcoes");
    banco.innerHTML = "";
    VOGAIS.filter((v) => escolhidas.includes(v)).forEach((v) => {
      const b = document.createElement("button");
      b.className = "peca";
      b.textContent = v;
      b.onclick = () => this.escolher(v, b);
      banco.appendChild(b);
    });
    perguntar(this);
  },
  pergunta() {
    return ["@vogal_falta", { p: this.item.palavra }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(v, b) {
    if (!podeTocar()) return;
    if (v === this.faltante) {
      const vaga = $("#vogal-alvo .faltando");
      vaga.textContent = v;
      vaga.classList.remove("faltando");
      vaga.classList.add("preenchida");
      premiar($("#vogal-feedback"), ["@isso", { p: this.item.palavra }]);
      depois(2800, () => this.novaRodada());
    } else {
      const certa = [...$("#vogal-opcoes").children].find((x) => x.textContent === this.faltante);
      errou(this, b, certa);
    }
  },
};

// ===================================================================
// VOGAIS — Ai! Oi! Ui! (encontros de vogais)
// ===================================================================
const Encontros = {
  alvo: null,
  iniciar() {
    mostrarTela("tela-encontro");
    this.novaRodada();
  },
  novaRodada() {
    Rodada.comecar();
    $("#encontro-feedback").textContent = "";
    const opcoes = sortearN(ENCONTROS, nOpcoes(3));
    this.alvo = sortear(opcoes);
    // Figuras ajudam no começo; do nível 3 em diante, só a escrita.
    const comFigura = Progresso.nivel <= 2;
    const grade = $("#encontro-cartas");
    grade.innerHTML = "";
    opcoes.forEach((e) => {
      const c = document.createElement("button");
      c.className = "carta";
      c.innerHTML = (comFigura ? `<span class="carta-emoji">${e.emoji}</span>` : "") +
        `<span class="carta-nome carta-encontro">${e.s}</span>`;
      c.setAttribute("aria-label", e.s);
      c.onclick = () => this.escolher(e, c);
      grade.appendChild(c);
    });
    perguntar(this);
  },
  pergunta() {
    return ["@onde_escrito", { s: this.alvo.s }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  escolher(e, c) {
    if (!podeTocar()) return;
    if (e === this.alvo) {
      c.classList.add("certa");
      premiar($("#encontro-feedback"), ["@isso", { s: e.s }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#encontro-cartas").children].find((x) => x.getAttribute("aria-label") === this.alvo.s);
      errou(this, c, certa);
    }
  },
};

// ===================================================================
// LETRAS — Letras do Meu Nome (monta o próprio nome)
// ===================================================================
const MeuNome = {
  nome: "",
  progresso: 0,
  iniciar() {
    if (!Progresso.temNome()) {
      NomeTela.abrir();
      return;
    }
    mostrarTela("tela-meunome");
    this.novaRodada();
  },
  novaRodada() {
    Rodada.comecar();
    $("#meunome-feedback").textContent = "";
    this.nome = chaveTexto(Progresso.nome).replace(/[^A-Z]/g, "").slice(0, 10);
    this.progresso = 0;
    const alvo = $("#meunome-alvo");
    alvo.innerHTML = "";
    [...this.nome].forEach(() => {
      const v = document.createElement("span");
      v.className = "vaga letra-vaga";
      alvo.appendChild(v);
    });
    // Letras do nome + 1 ou 2 letras que não estão nele.
    const extras = sortearN(ALFABETO.filter((L) => !this.nome.includes(L)), Progresso.nivel <= 1 ? 1 : 2);
    const banco = $("#meunome-pecas");
    banco.innerHTML = "";
    embaralhar([...this.nome, ...extras]).forEach((L) => {
      const b = document.createElement("button");
      b.className = "peca";
      b.textContent = L;
      b.onclick = () => this.tocarPeca(L, b);
      banco.appendChild(b);
    });
    perguntar(this);
  },
  // No começo convida; depois de um erro (ou no meio), diz qual letra procurar.
  pergunta() {
    if (this.progresso === 0 && Rodada.erros === 0) return ["@monte_nome"];
    return ["@rotulo_letra", { l: this.nome[this.progresso] }];
  },
  repetir() {
    pedir(this.pergunta());
  },
  tocarPeca(L, peca) {
    if (!podeTocar()) return;
    if (L === this.nome[this.progresso]) {
      document.querySelectorAll("#meunome-pecas .dica").forEach((d) => d.classList.remove("dica"));
      const vagas = document.querySelectorAll("#meunome-alvo .vaga");
      vagas[this.progresso].textContent = L;
      vagas[this.progresso].classList.add("preenchida");
      peca.disabled = true;
      peca.classList.add("usada");
      this.progresso++;
      const ouvida = pedir([{ l: L }]);
      if (this.progresso === this.nome.length) {
        Rodada.encerrar();
        quando(ouvida, () => {
          premiar($("#meunome-feedback"), ["@muito_bem"]);
          depois(3000, () => this.novaRodada());
        });
      }
    } else {
      const proxima = this.nome[this.progresso];
      const certa = [...$("#meunome-pecas").children].find((b) => !b.disabled && b.textContent === proxima);
      errou(this, peca, certa);
    }
  },
};

// ===================================================================
// NÚMEROS — Quantos Tem? (contar tocando e escolher o número)
// ===================================================================
const Quantos = {
  n: 0,
  contados: 0,
  iniciar() {
    mostrarTela("tela-quantos");
    this.novaRodada();
  },
  maximo() {
    const nv = Progresso.nivel;
    return nv <= 1 ? 3 : nv === 2 ? 5 : nv === 3 ? 7 : 10;
  },
  novaRodada() {
    Rodada.comecar();
    $("#quantos-feedback").textContent = "";
    const max = this.maximo();
    this.n = 1 + Math.floor(Math.random() * max);
    this.contados = 0;
    const figura = sortear(FIGURAS_CONTAR);
    const area = $("#quantos-itens");
    area.innerHTML = "";
    for (let i = 0; i < this.n; i++) {
      const b = document.createElement("button");
      b.className = "contar-item";
      b.textContent = figura;
      b.setAttribute("aria-label", "contar");
      b.onclick = () => this.contar(b);
      area.appendChild(b);
    }
    // Opções: o número certo + vizinhos (2 ou 3, ali perto).
    const vizinhos = embaralhar([this.n - 1, this.n + 1, this.n - 2, this.n + 2].filter((x) => x >= 1 && x <= 10));
    const escolhidas = [this.n, ...vizinhos.slice(0, nOpcoes(3) - 1)].sort((a, b) => a - b);
    const banco = $("#quantos-opcoes");
    banco.innerHTML = "";
    escolhidas.forEach((num) => {
      const b = document.createElement("button");
      b.className = "peca peca-numero";
      b.textContent = num;
      b.onclick = () => this.escolher(num, b);
      banco.appendChild(b);
    });
    perguntar(this);
  },
  pergunta() {
    return ["@quantos"];
  },
  repetir() {
    pedir(this.pergunta());
  },
  // Tocar numa figura conta em voz alta (uma de cada vez).
  contar(b) {
    if (!podeTocar() || b.classList.contains("contado")) return;
    this.contados++;
    b.classList.add("contado");
    b.dataset.num = this.contados;
    pedir([{ n: this.contados }]);
  },
  escolher(num, b) {
    if (!podeTocar()) return;
    if (num === this.n) {
      b.classList.add("certa");
      premiar($("#quantos-feedback"), ["@isso", { n: this.n }]);
      depois(2600, () => this.novaRodada());
    } else {
      const certa = [...$("#quantos-opcoes").children].find((x) => +x.textContent === this.n);
      errou(this, b, certa);
    }
  },
};

// ===================================================================
// BINGO — base comum (cartelas, linhas, itens)
// ===================================================================
const BingoBase = {
  // Linhas que valem bingo numa cartela n×n: linhas, colunas e diagonais.
  linhas(n) {
    const L = [];
    const seq = (f) => [...Array(n)].map((_, j) => f(j));
    for (let i = 0; i < n; i++) {
      L.push(seq((j) => i * n + j));
      L.push(seq((j) => j * n + i));
    }
    L.push(seq((j) => j * n + j));
    L.push(seq((j) => j * n + (n - 1 - j)));
    return L;
  },
  // Primeira linha completa (lista de casas) ou null.
  linhaCompleta(n, marcado) {
    return this.linhas(n).find((l) => l.every((i) => marcado(i))) || null;
  },
  item(tipo, x) {
    if (tipo === "letras") return { id: x, texto: x, fala: [{ l: x }] };
    return { id: chaveTexto(x.palavra), texto: x.palavra, emoji: x.emoji, fala: [{ p: x.palavra }] };
  },
  semRepetir(lista) {
    const vistos = new Set();
    return lista.filter((p) => {
      const k = chaveTexto(p.palavra);
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
  },
  // Lista fixa do modo família: igual em todos os celulares.
  poolFamilia(tipo) {
    if (tipo === "letras") return ALFABETO.map((L) => this.item("letras", L));
    return this.semRepetir(BANCO_PALAVRAS.filter((p) => p.nivel <= 2)).map((p) => this.item("palavras", p));
  },
  // Números "aleatórios" a partir de uma semente: o número da cartela gera
  // sempre a mesma cartela, em qualquer celular (sem internet).
  rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  cartelaFamilia(tipo, tam, numero) {
    const r = this.rng(numero * 7919 + (tipo === "palavras" ? 104729 : 0) + tam * 31);
    const p = this.poolFamilia(tipo).slice();
    for (let i = p.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p.slice(0, tam * tam);
  },
  // Desenha a cartela: cada casa é um botão grande.
  desenhar(el, itens, tam, aoTocar, comFigura) {
    el.innerHTML = "";
    el.style.gridTemplateColumns = `repeat(${tam}, 1fr)`;
    el.classList.toggle("tam4", tam === 4);
    return itens.map((it, i) => {
      const b = document.createElement("button");
      const fig = it.emoji && comFigura;
      b.className = "bingo-casa" + (fig ? " com-figura" : "") + (it.id.length > 1 ? " casa-palavra" : "");
      b.innerHTML = (fig ? `<span class="casa-emoji">${it.emoji}</span>` : "") + `<span class="casa-texto">${it.texto}</span>`;
      b.setAttribute("aria-label", it.texto);
      b.onclick = () => aoTocar(i, b);
      el.appendChild(b);
      return b;
    });
  },
  mostrarNaBola(el, it) {
    el.innerHTML = it.emoji ? `<span class="bola-emoji">${it.emoji}</span><span class="bola-texto">${it.texto}</span>` : `<span class="bola-texto">${it.texto}</span>`;
    el.classList.add("revelada");
  },
};

// ===================================================================
// BINGO — solo contra a coruja
// A coruja ganha de vez em quando (cerca de 3 em cada 10 partidas).
// ===================================================================
const Bingo = {
  tipo: "letras",
  tam: 3,
  partida: 0,
  pool: [],
  cartela: [],
  coruja: [],
  ordem: [],
  vez: -1,
  atual: null,
  acabou: false,
  marcadas: new Set(),
  marcadasCoruja: new Set(),
  casas: [],
  iniciar(tipo) {
    this.tipo = tipo === "palavras" ? "palavras" : "letras";
    mostrarTela("tela-bingo");
    this.novoJogo();
  },
  vivo(p) {
    return p === this.partida && document.body.dataset.tela === "tela-bingo";
  },
  poolDoNivel() {
    // Letras: sempre cantadas pelo nome.
    if (this.tipo === "letras") return ALFABETO.map((L) => BingoBase.item("letras", L));
    return BingoBase.semRepetir(palavrasDoNivel()).map((p) => BingoBase.item("palavras", p));
  },
  // Em que sorteio a cartela fecha uma linha, para esta ordem.
  turno(cartela, ordem) {
    const pos = new Map(cartela.map((x, i) => [x.id, i]));
    const m = new Set();
    for (let t = 0; t < ordem.length; t++) {
      if (pos.has(ordem[t].id)) m.add(pos.get(ordem[t].id));
      if (BingoBase.linhaCompleta(this.tam, (i) => m.has(i))) return t;
    }
    return Infinity;
  },
  planejar() {
    const criancaGanha = Math.random() < 0.7;
    let ordem = embaralhar(this.pool);
    for (let k = 0; k < 150; k++) {
      ordem = embaralhar(this.pool);
      const a = this.turno(this.cartela, ordem);
      const b = this.turno(this.coruja, ordem);
      if (criancaGanha ? a <= b : b < a) break;
    }
    return ordem;
  },
  novoJogo() {
    this.partida++;
    Rodada.comecar();
    this.acabou = false;
    this.atual = null;
    $("#bingo-fim").hidden = true;
    $("#bingo-feedback").textContent = "";
    const bola = $("#bingo-bola");
    bola.textContent = "🔊";
    bola.classList.remove("revelada");
    this.tam = Progresso.nivel <= 2 ? 3 : 4;
    const N = this.tam * this.tam;
    const todos = this.poolDoNivel();
    // Itens da partida: as duas cartelas saem daqui, mais uns que ninguém tem.
    this.pool = sortearN(todos, Math.min(todos.length, N * 2 + 2));
    this.cartela = sortearN(this.pool, N);
    this.coruja = sortearN(this.pool, N);
    this.ordem = this.planejar();
    this.vez = -1;
    this.marcadas = new Set();
    this.marcadasCoruja = new Set();
    this.casas = BingoBase.desenhar($("#bingo-cartela"), this.cartela, this.tam, (i, b) => this.tocar(i, b), Progresso.nivel <= 2);
    const mini = $("#bingo-mini");
    mini.innerHTML = "";
    mini.style.gridTemplateColumns = `repeat(${this.tam}, 1fr)`;
    this.coruja.forEach(() => {
      const d = document.createElement("span");
      d.className = "mini-casa";
      mini.appendChild(d);
    });
    document.body.classList.add("ouvindo");
    const p = this.partida;
    setTimeout(() => {
      if (!this.vivo(p)) return;
      pedir(["@bingo_comeca"]).then(() => this.vivo(p) && this.proxima());
    }, 400);
  },
  proxima() {
    if (this.acabou) return;
    this.vez++;
    if (this.vez >= this.ordem.length) return this.fim(false, null);
    Rodada.comecar();
    this.atual = this.ordem[this.vez];
    const bola = $("#bingo-bola");
    bola.textContent = "🔊";
    bola.classList.remove("revelada");
    document.body.classList.add("ouvindo");
    const p = this.partida;
    setTimeout(() => this.vivo(p) && this.repetir(), 700);
  },
  pergunta() {
    return this.atual ? this.atual.fala : [];
  },
  repetir() {
    if (this.atual && !this.acabou) pedir(this.atual.fala);
  },
  tem() {
    return this.atual ? this.cartela.findIndex((x) => x.id === this.atual.id) : -1;
  },
  tocar(i, b) {
    if (!podeTocar() || this.acabou || !this.atual || this.marcadas.has(i)) return;
    if (this.cartela[i].id === this.atual.id) {
      this.marcadas.add(i);
      b.classList.add("marcada");
      Audio.acerto();
      this.resolver();
    } else {
      this.errar(b, ["@bingo_nao_saiu", ...this.atual.fala]);
    }
  },
  naoTenho() {
    if (!podeTocar() || this.acabou || !this.atual) return;
    if (this.tem() < 0) this.resolver();
    else this.errar($("#bingo-naotenho"), ["@bingo_tem", ...this.atual.fala]);
  },
  // Engano: avisa com calma e fala de novo; no 2º engano, mostra a resposta.
  errar(el, fala) {
    Rodada.erros++;
    el.classList.add("errada");
    setTimeout(() => el.classList.remove("errada"), 600);
    Audio.tentarDeNovo();
    Mascote.incentivar();
    pedir(fala);
    if (Rodada.erros >= 2) {
      const k = this.tem();
      (k >= 0 ? this.casas[k] : $("#bingo-naotenho")).classList.add("dica");
    }
  },
  resolver() {
    Estatisticas.registrar("tela-bingo", Rodada.erros === 0);
    document.querySelectorAll("#tela-bingo .dica").forEach((d) => d.classList.remove("dica"));
    Rodada.encerrar(); // nada de toques até o próximo sorteio
    BingoBase.mostrarNaBola($("#bingo-bola"), this.atual);
    // A coruja marca a dela.
    const k = this.coruja.findIndex((x) => x.id === this.atual.id);
    if (k >= 0) {
      this.marcadasCoruja.add(k);
      $("#bingo-mini").children[k].classList.add("marcada");
    }
    const n = this.tam;
    const linhaC = BingoBase.linhaCompleta(n, (i) => this.marcadas.has(i));
    const linhaO = BingoBase.linhaCompleta(n, (i) => this.marcadasCoruja.has(i));
    const p = this.partida;
    if (linhaC) return setTimeout(() => this.vivo(p) && this.fim(true, linhaC), 700);
    if (linhaO) return setTimeout(() => this.vivo(p) && this.fim(false, linhaO), 900);
    setTimeout(() => this.vivo(p) && this.proxima(), 1300);
  },
  fim(ganhou, linha) {
    this.acabou = true;
    Rodada.encerrar();
    if (ganhou) {
      linha.forEach((i) => this.casas[i].classList.add("linha"));
      celebrar();
      Mascote.comemorar();
      Audio.acerto();
      $("#bingo-feedback").textContent = Colecao.ganhar();
      const r = Progresso.registrarAcerto();
      atualizarHomeProgresso();
      if (r.subiu) setTimeout(() => festaDeNivel(r.nivel), 2200);
      Sessao.rodadas++;
      pedir(["@bingo", "@bingo_ganhou"]);
      $("#bingo-fim-texto").textContent = "🎉 BINGO! Você ganhou!";
    } else {
      if (linha) linha.forEach((i) => $("#bingo-mini").children[i].classList.add("linha"));
      Mascote.incentivar();
      pedir(["@bingo_coruja"]);
      $("#bingo-fim-texto").textContent = "🦉 A coruja ganhou dessa vez!";
    }
    $("#bingo-fim").hidden = false;
  },
};

// ===================================================================
// BINGO DA FAMÍLIA — um celular canta, cada criança tem a sua cartela
// Tudo sem internet: a cartela nasce do número dela, e o celular do
// cantor confere qualquer cartela pelo número.
// ===================================================================
const BingoFamilia = {
  tipo: "letras",
  tam: 3,
  carregar() {
    try {
      const c = JSON.parse(localStorage.getItem("abc-bingo-cfg")) || {};
      if (c.tipo === "letras" || c.tipo === "palavras") this.tipo = c.tipo;
      if (c.tam === 3 || c.tam === 4) this.tam = c.tam;
    } catch (_) {}
  },
  salvar() {
    try {
      localStorage.setItem("abc-bingo-cfg", JSON.stringify({ tipo: this.tipo, tam: this.tam }));
    } catch (_) {}
  },
  iniciar() {
    this.carregar();
    mostrarTela("tela-bfam");
    this.marcar();
  },
  marcar() {
    document.querySelectorAll("#tela-bfam [data-tipo]").forEach((b) => b.classList.toggle("ativa", b.dataset.tipo === this.tipo));
    document.querySelectorAll("#tela-bfam [data-tam]").forEach((b) => b.classList.toggle("ativa", +b.dataset.tam === this.tam));
  },
  escolher(campo, valor) {
    this[campo] = valor;
    this.salvar();
    this.marcar();
  },
  rotulo() {
    return (this.tipo === "letras" ? "🔤 Letras" : "🍎 Palavras") + " · " + this.tam + "×" + this.tam;
  },
};

const BingoCantor = {
  chave: "abc-bingo-cantor",
  sorteados: [],
  atual: null,
  iniciar() {
    BingoFamilia.carregar();
    mostrarTela("tela-bcantor");
    // Continua o jogo salvo (se a tela apagar ou recarregar), se for do mesmo tipo.
    this.sorteados = [];
    try {
      const s = JSON.parse(localStorage.getItem(this.chave));
      if (s && s.tipo === BingoFamilia.tipo && s.tam === BingoFamilia.tam) this.sorteados = s.ids || [];
    } catch (_) {}
    const pool = this.pool();
    this.atual = this.sorteados.length ? pool.find((x) => x.id === this.sorteados[this.sorteados.length - 1]) : null;
    $("#bcantor-resultado").innerHTML = "";
    this.render();
  },
  pool() {
    return BingoBase.poolFamilia(BingoFamilia.tipo);
  },
  salvar() {
    try {
      localStorage.setItem(this.chave, JSON.stringify({ tipo: BingoFamilia.tipo, tam: BingoFamilia.tam, ids: this.sorteados }));
    } catch (_) {}
  },
  sortear() {
    if (!podeTocar()) return;
    const resta = this.pool().filter((x) => !this.sorteados.includes(x.id));
    if (!resta.length) return toast("Todas já saíram!");
    this.atual = sortear(resta);
    this.sorteados.push(this.atual.id);
    this.salvar();
    this.render();
    this.repetir();
  },
  repetir() {
    if (this.atual) pedir(this.atual.fala);
  },
  render() {
    $("#bcantor-info").textContent = BingoFamilia.rotulo() + " · " + this.sorteados.length + " sorteada" + (this.sorteados.length === 1 ? "" : "s");
    const bola = $("#bcantor-bola");
    if (this.atual) BingoBase.mostrarNaBola(bola, this.atual);
    else {
      bola.textContent = "?";
      bola.classList.remove("revelada");
    }
    const pool = this.pool();
    $("#bcantor-historico").innerHTML = this.sorteados
      .slice()
      .reverse()
      .map((id) => {
        const it = pool.find((x) => x.id === id);
        return `<span class="bcantor-chip">${it ? it.texto : id}</span>`;
      })
      .join("");
  },
  conferir() {
    const n = parseInt($("#bcantor-num").value, 10);
    const res = $("#bcantor-resultado");
    if (!(n >= 1 && n <= 99)) {
      res.innerHTML = "<p>Digite o número da cartela (de 1 a 99).</p>";
      return;
    }
    const tam = BingoFamilia.tam;
    const cart = BingoBase.cartelaFamilia(BingoFamilia.tipo, tam, n);
    const saiu = (i) => this.sorteados.includes(cart[i].id);
    const linha = BingoBase.linhaCompleta(tam, saiu) || [];
    const quantas = cart.filter((_, i) => saiu(i)).length;
    const grade = cart
      .map((it, i) => `<span class="bconf-casa${saiu(i) ? " saiu" : ""}${linha.includes(i) ? " linha" : ""}">${it.texto}</span>`)
      .join("");
    res.innerHTML =
      `<p class="bconf-msg">${linha.length ? `✅ <strong>BINGO!</strong> A cartela ${n} fechou uma linha.` : `Ainda não. Saíram ${quantas} de ${cart.length} da cartela ${n}.`}</p>` +
      `<div class="bconf-grade" style="grid-template-columns:repeat(${tam},1fr)">${grade}</div>` +
      `<p class="bconf-dica">Confira se é a mesma cartela do celular da criança (${BingoFamilia.rotulo()}).</p>`;
    if (linha.length) {
      celebrar();
      pedir(["@bingo"]);
    }
  },
  novo() {
    if (this.sorteados.length && !confirm("Começar um jogo novo? O que já saiu será apagado.")) return;
    this.sorteados = [];
    this.atual = null;
    this.salvar();
    $("#bcantor-resultado").innerHTML = "";
    this.render();
  },
};

const BingoCartela = {
  chave: "abc-bingo-cartela",
  numero: 1,
  marcadas: new Set(),
  casas: [],
  iniciar() {
    BingoFamilia.carregar();
    mostrarTela("tela-bcartela");
    let ok = false;
    try {
      const s = JSON.parse(localStorage.getItem(this.chave));
      if (s && s.tipo === BingoFamilia.tipo && s.tam === BingoFamilia.tam && s.numero) {
        this.numero = s.numero;
        this.marcadas = new Set(s.marcadas || []);
        ok = true;
      }
    } catch (_) {}
    if (!ok) this.sortearNumero();
    this.render();
  },
  sortearNumero() {
    this.numero = 1 + Math.floor(Math.random() * 99);
    this.marcadas = new Set();
    this.salvar();
  },
  nova() {
    if (this.marcadas.size && !confirm("Trocar de cartela? As marcações serão apagadas.")) return;
    this.sortearNumero();
    this.render();
  },
  salvar() {
    try {
      localStorage.setItem(this.chave, JSON.stringify({ tipo: BingoFamilia.tipo, tam: BingoFamilia.tam, numero: this.numero, marcadas: [...this.marcadas] }));
    } catch (_) {}
  },
  render() {
    const tam = BingoFamilia.tam;
    $("#bcartela-num").innerHTML = `${BingoFamilia.rotulo()}<br /><strong>Cartela ${this.numero}</strong>`;
    $("#bcartela-num").classList.remove("destaque");
    const itens = BingoBase.cartelaFamilia(BingoFamilia.tipo, tam, this.numero);
    this.casas = BingoBase.desenhar($("#bcartela-grade"), itens, tam, (i, b) => this.tocar(i, b), tam === 3);
    this.marcadas.forEach((i) => this.casas[i] && this.casas[i].classList.add("marcada"));
    this.verificar();
  },
  // A criança marca e desmarca (quem confere é o adulto, pelo número).
  tocar(i, b) {
    if (this.marcadas.has(i)) this.marcadas.delete(i);
    else this.marcadas.add(i);
    b.classList.toggle("marcada", this.marcadas.has(i));
    this.salvar();
    this.verificar();
  },
  verificar() {
    const linha = BingoBase.linhaCompleta(BingoFamilia.tam, (i) => this.marcadas.has(i));
    this.casas.forEach((c, i) => c.classList.toggle("linha", !!linha && linha.includes(i)));
    $("#bcartela-bingo").hidden = !linha;
  },
  gritar() {
    celebrar();
    Mascote.comemorar();
    Audio.narrar(["@bingo"]);
    $("#bcartela-num").classList.add("destaque");
    toast("Mostre para o adulto conferir: Cartela " + this.numero);
  },
};

// Desenha o Número usa o mesmo quadro do Desenha a Letra.
const DesenhaNumero = { iniciar: () => DesenhaLetra.iniciar("numero") };

const JOGOS = [
  { mundo: "letras", nome: "Caça ao Som", icone: "🔎", cor: "c1", jogo: CacaAoSom },
  { mundo: "letras", nome: "Monta Palavra", icone: "🧩", cor: "c2", jogo: MontaPalavra },
  { mundo: "letras", nome: "Rimas", icone: "🎵", cor: "c3", jogo: Rimas },
  { mundo: "letras", nome: "Bate as Sílabas", icone: "🥁", cor: "c4", jogo: BateSilabas },
  { mundo: "letras", nome: "Pescaria", icone: "🎣", cor: "c5", jogo: Pescaria },
  { mundo: "letras", nome: "Par das Letras", icone: "🃏", cor: "c6", jogo: ParLetras },
  { mundo: "letras", nome: "Sílaba que Falta", icone: "❓", cor: "c1", jogo: QualSilaba },
  { mundo: "letras", nome: "Caça à Palavra", icone: "📖", cor: "c2", jogo: CacaPalavra },
  { mundo: "letras", nome: "Desenha a Letra", icone: "✏️", cor: "c3", jogo: DesenhaLetra },
  { mundo: "letras", nome: "Letras do Meu Nome", icone: "🙂", cor: "c4", jogo: MeuNome },
  { mundo: "letras", nome: "Bingo das Letras", icone: "🎱", cor: "c5", jogo: { iniciar: () => Bingo.iniciar("letras") } },
  { mundo: "letras", nome: "Bingo das Palavras", icone: "🎟️", cor: "c6", jogo: { iniciar: () => Bingo.iniciar("palavras") } },
  { mundo: "letras", nome: "Bingo da Família", icone: "👨‍👩‍👧", cor: "c1", jogo: BingoFamilia },
  { mundo: "vogais", nome: "Trem das Vogais", icone: "🚂", cor: "c5", jogo: TremVogais },
  { mundo: "vogais", nome: "Vogal que Falta", icone: "🔡", cor: "c6", jogo: VogalFalta },
  { mundo: "vogais", nome: "Ai! Oi! Ui!", icone: "😮", cor: "c2", jogo: Encontros },
  { mundo: "numeros", nome: "Quantos Tem?", icone: "🍎", cor: "c1", jogo: Quantos },
  { mundo: "numeros", nome: "Desenha o Número", icone: "✏️", cor: "c3", jogo: DesenhaNumero },
];

// ===================================================================
// Mundos: a tela inicial mostra 3 mundos; cada um tem seus jogos
// ===================================================================
const MUNDOS = [
  { id: "letras", nome: "Letras", icone: "🔤", cor: "c1" },
  { id: "vogais", nome: "Vogais", icone: "🅰️", cor: "c3" },
  { id: "numeros", nome: "Números", icone: "🔢", cor: "c5" },
];
const Mundo = {
  atual: null,
  abrir(id) {
    const m = MUNDOS.find((x) => x.id === id);
    if (!m) return mostrarTela("tela-inicio");
    this.atual = id;
    mostrarTela("tela-mundo");
    $("#mundo-titulo").textContent = m.icone + " " + m.nome;
    const menu = $("#mundo-menu");
    menu.innerHTML = "";
    JOGOS.filter((j) => j.mundo === id).forEach((j) => menu.appendChild(botaoMenu(j)));
  },
};
function botaoMenu(j) {
  const b = document.createElement("button");
  b.className = "botao-jogo " + j.cor;
  b.innerHTML = `<span class="botao-icone">${j.icone}</span>
      <span class="botao-texto">${j.nome}</span>`;
  b.onclick = () => j.jogo.iniciar();
  return b;
}
// Voltar: de um jogo, volta para o mundo dele; do mundo, para o início.
function voltar() {
  const t = document.body.dataset.tela;
  if (t === "tela-bcantor" || t === "tela-bcartela") return BingoFamilia.iniciar();
  if (Mundo.atual && t !== "tela-mundo" && JOGOS.some((j) => j.mundo === Mundo.atual)) {
    const telaDeJogo = !["tela-inicio", "tela-album", "tela-pais", "tela-nome"].includes(t);
    if (telaDeJogo) return Mundo.abrir(Mundo.atual);
  }
  Mundo.atual = null;
  mostrarTela("tela-inicio");
}

// ===================================================================
// Para os pais — acertos de primeira x depois de errar
// Abre segurando o botão por 2 segundos (portão simples para crianças).
// ===================================================================
const Pais = {
  abrir() {
    mostrarTela("tela-pais");
    const e = Estatisticas.ler();
    const pct = (o) => {
      const t = (o.primeira || 0) + (o.depois || 0);
      return t ? Math.round((o.primeira / t) * 100) : null;
    };
    const somar = (dias) =>
      dias.reduce((a, k) => {
        const d = e.dias[k] || {};
        a.primeira += d.primeira || 0;
        a.depois += d.depois || 0;
        return a;
      }, { primeira: 0, depois: 0 });
    const hoje = Estatisticas.hoje();
    const ultimos7 = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      ultimos7.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
    }
    const resumo = (rotulo, o) => {
      const t = o.primeira + o.depois;
      const p = pct(o);
      return `<div class="pais-resumo"><span class="pais-rotulo">${rotulo}</span>
        <strong>${t ? p + "%" : "—"}</strong>
        <small>${t ? `de primeira em ${t} rodada${t > 1 ? "s" : ""}` : "nenhuma rodada"}</small></div>`;
    };
    let html = resumo("Hoje", somar([hoje])) + resumo("Últimos 7 dias", somar(ultimos7));
    html += '<div class="pais-tabela">';
    Object.entries(JOGOS_COM_ESCOLHA).forEach(([tela, nome]) => {
      const o = e.jogos[tela] || { primeira: 0, depois: 0 };
      const t = o.primeira + o.depois;
      const p = pct(o);
      html += `<div class="pais-linha"><span class="pais-jogo">${nome}</span>
        <span class="pais-barra"><span style="width:${p || 0}%"></span></span>
        <span class="pais-num">${t ? p + "%" : "—"}<small>${t ? " · " + t : ""}</small></span></div>`;
    });
    html += "</div>";
    $("#pais-conteudo").innerHTML = html;
  },
  zerar() {
    if (confirm("Zerar as estatísticas deste aparelho?")) {
      Estatisticas.zerar();
      this.abrir();
    }
  },
  // Botão que só abre se for segurado (criança tocando rápido não abre).
  ligarPortao(botao) {
    let t = null;
    const soltar = () => {
      clearTimeout(t);
      botao.classList.remove("segurando");
    };
    botao.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      botao.classList.add("segurando");
      t = setTimeout(() => {
        soltar();
        this.abrir();
      }, 2000);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((n) => botao.addEventListener(n, soltar));
    botao.addEventListener("contextmenu", (ev) => ev.preventDefault());
  },
};

// Mapa nome->módulo para os botões "ouvir de novo".
const MODULOS = {
  CacaAoSom, MontaPalavra, Rimas, BateSilabas, Pescaria,
  ParLetras, QualSilaba, CacaPalavra, DesenhaLetra,
  TremVogais, VogalFalta, Encontros, MeuNome, Quantos,
  Bingo, BingoCantor,
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
  // Tela inicial: os 3 mundos + o álbum de adesivos.
  const menu = $("#menu");
  MUNDOS.forEach((m) => {
    const b = botaoMenu({ nome: m.nome, icone: m.icone, cor: m.cor + " botao-mundo", jogo: { iniciar: () => Mundo.abrir(m.id) } });
    b.dataset.mundo = m.id;
    menu.appendChild(b);
  });
  menu.appendChild(botaoMenu({ nome: "Meus Adesivos", icone: "🏆", cor: "c4", jogo: Album }));

  // Botões "voltar" (do jogo para o mundo; do mundo para o início).
  document.querySelectorAll("[data-voltar]").forEach((b) => {
    b.onclick = () => voltar();
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

  // Bingo (solo e família).
  $("#bingo-naotenho").onclick = () => Bingo.naoTenho();
  $("#bingo-denovo").onclick = () => Bingo.novoJogo();
  document.querySelectorAll("#tela-bfam [data-tipo]").forEach((b) => (b.onclick = () => BingoFamilia.escolher("tipo", b.dataset.tipo)));
  document.querySelectorAll("#tela-bfam [data-tam]").forEach((b) => (b.onclick = () => BingoFamilia.escolher("tam", +b.dataset.tam)));
  $("#bfam-cantor").onclick = () => BingoCantor.iniciar();
  $("#bfam-cartela").onclick = () => BingoCartela.iniciar();
  $("#bcantor-sortear").onclick = () => BingoCantor.sortear();
  $("#bcantor-conf").onclick = () => BingoCantor.conferir();
  $("#bcantor-num").addEventListener("keydown", (e) => e.key === "Enter" && BingoCantor.conferir());
  $("#bcantor-novo").onclick = () => BingoCantor.novo();
  $("#bcartela-bingo").onclick = () => BingoCartela.gritar();
  $("#bcartela-nova").onclick = () => BingoCartela.nova();

  // Descanso e painel dos pais.
  $("#descanso-sim").onclick = () => Descanso.descansar();
  $("#descanso-nao").onclick = () => Descanso.continuar();
  Pais.ligarPortao($("#abrir-pais"));
  $("#pais-zerar").onclick = () => Pais.zerar();

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
