// ===================================================================
// Áudio: narração + efeitos sonoros
//
// Duas camadas de voz:
//  1. Clipes .mp3 pré-gravados (voz neural de qualidade) — usados
//     quando existem (ver tools/gerar-audios.mjs + assets/audio/).
//  2. Voz do aparelho (Web Speech API) — fallback automático quando
//     um clipe não existe ainda.
//
// A narração é montada por "pedaços" (narrar([...])), cada pedaço
// vira uma chave de clipe; se todos os clipes existirem, tocam em
// sequência, senão falamos o texto equivalente.
// ===================================================================

const Audio = (() => {
  const BASE_CLIPES = "assets/audio/";

  // --------------------------------------------------------------
  // Camada 2: voz do aparelho (Web Speech API)
  // --------------------------------------------------------------
  let vozPtBr = null;

  const VOZES_PREFERIDAS = [
    "Google português do Brasil",
    "Luciana",
    "Microsoft Francisca Online (Natural)",
    "Microsoft Thalita Online (Natural)",
    "Microsoft Antonio Online (Natural)",
    "Microsoft Maria",
    "Raquel",
    "Felipe",
  ];

  function pontuarVoz(v) {
    let nota = 0;
    if (/pt[-_]br/i.test(v.lang)) nota += 100;
    else if (/^pt/i.test(v.lang)) nota += 40;
    else return -1;
    const idx = VOZES_PREFERIDAS.findIndex((nome) =>
      v.name.toLowerCase().includes(nome.toLowerCase())
    );
    if (idx >= 0) nota += 50 - idx;
    if (/natural|neural|online/i.test(v.name)) nota += 20;
    if (v.localService === false) nota += 10;
    return nota;
  }

  function escolherVoz() {
    const vozes = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    let melhor = null;
    let melhorNota = -1;
    for (const v of vozes) {
      const nota = pontuarVoz(v);
      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = v;
      }
    }
    if (melhor) vozPtBr = melhor;
  }

  if (window.speechSynthesis) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  function falar(texto, { taxa = 0.85, tom = 1.1 } = {}) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      speechSynthesis.cancel();
      // Minúsculas: texto curto em MAIÚSCULAS faz muitos sintetizadores
      // soletrarem letra a letra. O texto na tela continua maiúsculo.
      const u = new SpeechSynthesisUtterance(String(texto).toLowerCase());
      u.lang = "pt-BR";
      if (vozPtBr) u.voice = vozPtBr;
      u.rate = taxa;
      u.pitch = tom;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  // --------------------------------------------------------------
  // Camada 1: clipes de áudio pré-gravados
  // --------------------------------------------------------------
  let clipesDisponiveis = new Set();
  let formatoClipe = "mp3"; // formato padrão dos clipes (mp3 do TTS)
  let formatos = {}; // exceções por clipe (ex.: sons gravados em webm)
  const cache = {}; // chave -> HTMLAudioElement (reserva)
  const buffers = {}; // chave -> Promise<AudioBuffer> (Web Audio)
  let tocandoAgora = null;

  // Lê o manifesto (lista de clipes já gerados). Se não existir, o
  // jogo simplesmente usa a voz do aparelho.
  function carregarManifesto() {
    fetch(BASE_CLIPES + "manifest.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (m && Array.isArray(m.clips)) {
          clipesDisponiveis = new Set(m.clips);
          if (m.formato) formatoClipe = m.formato;
          if (m.formatos && typeof m.formatos === "object") formatos = m.formatos;
        }
      })
      .catch(() => {
        /* sem manifesto: seguimos com a voz do aparelho */
      });
  }
  carregarManifesto();

  function urlClipe(chave) {
    return BASE_CLIPES + chave + "." + (formatos[chave] || formatoClipe);
  }

  function clipe(chave) {
    if (!cache[chave]) {
      const a = new window.Audio(urlClipe(chave));
      a.preload = "auto";
      cache[chave] = a;
    }
    return cache[chave];
  }

  function pararTudo() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (tocandoAgora) {
      tocandoAgora.cancelado = true;
      if (tocandoAgora.parar) tocandoAgora.parar();
      tocandoAgora = null;
    }
  }

  // Decodifica um clipe para o Web Audio (fica em cache).
  function buffer(chave) {
    if (!buffers[chave]) {
      const c = contexto();
      buffers[chave] = fetch(urlClipe(chave))
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.arrayBuffer();
        })
        .then((ab) => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
        .then((b) => ((b.trecho = trechoFalado(b)), b));
      buffers[chave].catch(() => delete buffers[chave]);
    }
    return buffers[chave];
  }

  // Onde a fala começa e termina dentro do clipe. Gravações feitas no
  // celular costumam ter meio segundo de silêncio antes da palavra; aqui
  // ele é pulado (fica uma folguinha de 50 ms antes e 150 ms depois).
  function trechoFalado(b) {
    const x = b.getChannelData(0);
    const sr = b.sampleRate;
    const w = Math.max(1, Math.round(sr * 0.01)); // janelas de 10 ms
    const n = Math.floor(x.length / w);
    const e = new Float32Array(n);
    let max = 0;
    for (let i = 0; i < n; i++) {
      let soma = 0;
      for (let j = i * w; j < (i + 1) * w; j++) soma += x[j] * x[j];
      e[i] = Math.sqrt(soma / w);
      if (e[i] > max) max = e[i];
    }
    const tudo = { ini: 0, dur: b.duration };
    if (!max) return tudo;
    const lim = max * 0.01; // -40 dB do ponto mais alto
    // Início: 50 ms seguidos acima do limite (ignora estalinhos soltos).
    let a = -1;
    for (let i = 0, seguidos = 0; i < n; i++) {
      seguidos = e[i] > lim ? seguidos + 1 : 0;
      if (seguidos >= 5) { a = i - 4; break; }
    }
    let z = n - 1;
    while (z > 0 && e[z] <= lim) z--;
    if (a < 0 || z <= a) return tudo;
    const ini = Math.max(0, (a * w) / sr - 0.05);
    const fim = Math.min(b.duration, ((z + 1) * w) / sr + 0.15);
    return { ini, dur: fim - ini };
  }

  // Toca pelo Web Audio. Com o contexto de áudio já "acordado", o celular
  // não engole o começo da fala, e os pedaços emendam sem buracos. Uma
  // pequena folga antes da primeira sílaba faz o papel do silêncio inicial.
  async function tocarWebAudio(chaves, sessao) {
    const c = contexto();
    if (!c) throw new Error("sem Web Audio");
    if (c.state !== "running") {
      await Promise.race([c.resume(), new Promise((r) => setTimeout(r, 300))]);
      if (c.state !== "running") throw new Error("contexto suspenso");
    }
    const bufs = await Promise.all(chaves.map(buffer));
    if (sessao.cancelado) return;
    let t = c.currentTime + 0.08;
    const fontes = bufs.map((b) => {
      const f = c.createBufferSource();
      f.buffer = b;
      f.connect(c.destination);
      const tr = b.trecho || { ini: 0, dur: b.duration };
      f.start(t, tr.ini, tr.dur);
      t += tr.dur;
      return f;
    });
    await new Promise((res) => {
      sessao.parar = () => {
        fontes.forEach((f) => {
          try { f.stop(); } catch (_) {}
        });
        res();
      };
      fontes[fontes.length - 1].onended = res;
    });
  }

  // Reserva: elemento <audio>, um clipe após o outro.
  function tocarElementos(chaves, sessao) {
    return new Promise((resolve) => {
      let i = 0;
      let atual = null;
      sessao.parar = () => {
        if (atual) atual.pause();
        resolve();
      };
      const proximo = () => {
        if (sessao.cancelado || i >= chaves.length) return resolve();
        atual = clipe(chaves[i]);
        i++;
        atual.currentTime = 0;
        atual.onended = proximo;
        atual.onerror = proximo;
        const p = atual.play();
        if (p && p.catch) p.catch(proximo);
      };
      proximo();
    });
  }

  // Toca uma sequência de clipes (Web Audio; se não der, <audio>).
  function tocarClipes(chaves) {
    const sessao = { cancelado: false };
    tocandoAgora = sessao;
    return tocarWebAudio(chaves, sessao)
      .catch(() => (sessao.cancelado ? null : tocarElementos(chaves, sessao)))
      .finally(() => {
        if (tocandoAgora === sessao) tocandoAgora = null;
      });
  }

  // --------------------------------------------------------------
  // narrar(): monta a fala a partir de pedaços
  //   "@chave"  -> frase fixa
  //   {p:"GATO"} -> palavra   {s:"MA"} -> sílaba
  //   {l:"A"}    -> nome da letra   {f:"A"} -> som da letra
  //   {n:3}      -> número (só na voz do aparelho)
  // --------------------------------------------------------------
  function chaveDe(parte) {
    if (typeof parte === "string") return parte.replace(/^@/, "");
    // Mesma regra de nome de arquivo do frases.js (sem acento, Ç -> S).
    if (parte.p != null) return "pal_" + chaveTexto(parte.p);
    if (parte.s != null) return "sil_" + chaveTexto(parte.s);
    if (parte.l != null) return "letra_" + parte.l;
    if (parte.f != null) return "som_" + parte.f;
    return null; // {n:...} não tem clipe
  }

  function textoDe(parte) {
    const chave = chaveDe(parte);
    const mapa = typeof FRASES !== "undefined" ? FRASES : {};
    if (chave && mapa[chave] != null) return mapa[chave];
    // Fallbacks sem depender do mapa (ex.: file:// sem fetch).
    if (typeof parte === "string") return "";
    if (parte.p != null) return String(parte.p).toLowerCase();
    if (parte.s != null) return String(parte.s).toLowerCase();
    if (parte.l != null)
      return (typeof NOMES_LETRA !== "undefined" && NOMES_LETRA[parte.l]) ||
        String(parte.l).toLowerCase();
    if (parte.f != null)
      return (typeof SOM_DA_LETRA !== "undefined" && SOM_DA_LETRA[parte.f]) ||
        String(parte.f).toLowerCase();
    if (parte.n != null) return String(parte.n);
    return "";
  }

  function narrar(partes, opts) {
    pararTudo();
    const lista = Array.isArray(partes) ? partes : [partes];
    const chaves = lista.map(chaveDe);
    const temTodos =
      clipesDisponiveis.size > 0 &&
      chaves.every((c) => c && clipesDisponiveis.has(c));
    if (temTodos) return tocarClipes(chaves);
    const texto = lista.map(textoDe).join(" ").trim();
    return falar(texto, opts);
  }

  // --------------------------------------------------------------
  // Efeitos sonoros gerados na hora (sem arquivos)
  // --------------------------------------------------------------
  let ctx = null;
  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  function tocarNotas(notas) {
    const c = contexto();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    let t = c.currentTime;
    notas.forEach(({ freq, dur }) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.85;
    });
  }

  function acerto() {
    tocarNotas([
      { freq: 523, dur: 0.14 },
      { freq: 659, dur: 0.14 },
      { freq: 784, dur: 0.14 },
      { freq: 1047, dur: 0.22 },
    ]);
  }

  function tentarDeNovo() {
    tocarNotas([
      { freq: 392, dur: 0.15 },
      { freq: 349, dur: 0.2 },
    ]);
  }

  return { falar, narrar, acerto, tentarDeNovo, parar: pararTudo };
})();
