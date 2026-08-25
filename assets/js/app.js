// ===================================================================
// ABC Aventura — lógica principal do jogo
// ===================================================================

// ---- Utilidades ----
const $ = (sel) => document.querySelector(sel);
const embaralhar = (arr) => arr.slice().sort(() => Math.random() - 0.5);
const sortear = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

// ===================================================================
// JOGO 1 — Caça ao Som
// Mostra 3 figuras. A voz pede a que começa com um certo som.
// ===================================================================
const CacaAoSom = {
  alvo: null,

  iniciar() {
    mostrarTela("tela-caca");
    this.novaRodada();
  },

  novaRodada() {
    $("#caca-feedback").textContent = "";
    // Escolhe 3 palavras com letras iniciais diferentes.
    const usadas = new Set();
    const opcoes = [];
    const embaralhado = embaralhar(BANCO_PALAVRAS);
    for (const item of embaralhado) {
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

    this.pedir();
  },

  pedir() {
    const letra = this.alvo.palavra[0];
    const som = SOM_DA_LETRA[letra] || letra;
    Audio.falar(`Toque no que começa com o som ${som}`);
  },

  escolher(item, carta) {
    if (item === this.alvo) {
      carta.classList.add("certa");
      Audio.acerto();
      celebrar();
      const adesivo = Colecao.ganhar();
      $("#caca-feedback").textContent = adesivo;
      Audio.falar(`Muito bem! ${this.alvo.palavra}! Você ganhou um adesivo!`);
      setTimeout(() => this.novaRodada(), 2600);
    } else {
      carta.classList.add("errada");
      Audio.tentarDeNovo();
      Audio.falar("Quase! Tenta de novo.");
      setTimeout(() => carta.classList.remove("errada"), 600);
    }
  },
};

// ===================================================================
// JOGO 2 — Monta Palavra
// Mostra a figura e as sílabas embaralhadas. A criança toca as
// sílabas na ordem certa para formar a palavra.
// ===================================================================
const MontaPalavra = {
  item: null,
  progresso: 0,

  iniciar() {
    mostrarTela("tela-monta");
    this.novaRodada();
  },

  novaRodada() {
    // Palavras com pelo menos 2 sílabas ficam mais interessantes.
    const candidatos = BANCO_PALAVRAS.filter((p) => p.silabas.length >= 2);
    this.item = sortear(candidatos);
    this.progresso = 0;

    $("#monta-emoji").textContent = this.item.emoji;
    $("#monta-feedback").textContent = "";

    // Espaços a preencher (um por sílaba).
    const alvo = $("#monta-alvo");
    alvo.innerHTML = "";
    this.item.silabas.forEach(() => {
      const vaga = document.createElement("span");
      vaga.className = "vaga";
      alvo.appendChild(vaga);
    });

    // Peças de sílaba embaralhadas.
    const banco = $("#monta-pecas");
    banco.innerHTML = "";
    embaralhar(this.item.silabas).forEach((sil) => {
      const peca = document.createElement("button");
      peca.className = "peca";
      peca.textContent = sil;
      peca.onclick = () => this.tocarPeca(sil, peca);
      banco.appendChild(peca);
    });

    Audio.falar(`Monte a palavra ${this.item.palavra}`);
  },

  tocarPeca(sil, peca) {
    const esperada = this.item.silabas[this.progresso];
    if (sil === esperada) {
      const vagas = document.querySelectorAll("#monta-alvo .vaga");
      vagas[this.progresso].textContent = sil;
      vagas[this.progresso].classList.add("preenchida");
      peca.disabled = true;
      peca.classList.add("usada");
      this.progresso++;
      Audio.falar(sil, { taxa: 0.8 });

      if (this.progresso === this.item.silabas.length) {
        Audio.acerto();
        celebrar();
        const adesivo = Colecao.ganhar();
        $("#monta-feedback").textContent = adesivo;
        setTimeout(
          () =>
            Audio.falar(
              `Isso! ${this.item.palavra}! Você montou a palavra!`
            ),
          400
        );
        setTimeout(() => this.novaRodada(), 3000);
      }
    } else {
      peca.classList.add("errada");
      Audio.tentarDeNovo();
      setTimeout(() => peca.classList.remove("errada"), 600);
    }
  },
};

// ===================================================================
// Álbum de adesivos
// ===================================================================
const Album = {
  abrir() {
    mostrarTela("tela-album");
    const grade = $("#album-grade");
    const adesivos = Colecao.ler();
    if (adesivos.length === 0) {
      grade.innerHTML =
        '<p class="album-vazio">Jogue para ganhar adesivos! 🎁</p>';
      Audio.falar("Jogue para ganhar adesivos!");
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
// Ligações dos botões e início
// ===================================================================
window.addEventListener("DOMContentLoaded", () => {
  $("#btn-caca").onclick = () => CacaAoSom.iniciar();
  $("#btn-monta").onclick = () => MontaPalavra.iniciar();
  $("#btn-album").onclick = () => Album.abrir();

  document.querySelectorAll("[data-voltar]").forEach((b) => {
    b.onclick = () => mostrarTela("tela-inicio");
  });

  // Botões de repetir a instrução falada.
  $("#caca-repetir").onclick = () => CacaAoSom.pedir();
  $("#monta-repetir").onclick = () =>
    Audio.falar(`Monte a palavra ${MontaPalavra.item.palavra}`);

  // Saudação inicial (só fala depois do primeiro toque, por causa
  // das regras de áudio dos navegadores).
  const saudar = () => {
    Audio.falar("Oi! Vamos brincar de aprender a ler?");
    document.removeEventListener("pointerdown", saudar);
  };
  document.addEventListener("pointerdown", saudar);
});
