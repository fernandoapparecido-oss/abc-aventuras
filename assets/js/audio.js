// ===================================================================
// Áudio: narração por voz (fala) + efeitos sonoros
// A narração é o coração do jogo — a criança ainda não lê, então
// todas as instruções são faladas em português.
// ===================================================================

const Audio = (() => {
  let vozPtBr = null;

  // Procura uma voz em português do Brasil entre as disponíveis.
  function escolherVoz() {
    const vozes = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    vozPtBr =
      vozes.find((v) => /pt[-_]br/i.test(v.lang)) ||
      vozes.find((v) => /^pt/i.test(v.lang)) ||
      null;
  }

  if (window.speechSynthesis) {
    escolherVoz();
    // A lista de vozes costuma carregar de forma assíncrona.
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  // Fala um texto. Devolve uma Promise que resolve ao terminar de falar.
  function falar(texto, { taxa = 0.9, tom = 1.15 } = {}) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      speechSynthesis.cancel(); // interrompe fala anterior
      // Falamos em minúsculas: texto curto em MAIÚSCULAS (ex.: "MA") faz
      // muitos sintetizadores soletrarem letra a letra ("M", "A") em vez
      // de ler como sílaba. O que aparece na tela continua maiúsculo.
      const u = new SpeechSynthesisUtterance(String(texto).toLowerCase());
      u.lang = "pt-BR";
      if (vozPtBr) u.voice = vozPtBr;
      u.rate = taxa; // um pouco mais devagar, para crianças
      u.pitch = tom; // voz mais aguda, amigável
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  // ---- Efeitos sonoros gerados na hora (sem arquivos) ----
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

  // Som alegre de acerto (arpejo subindo).
  function acerto() {
    tocarNotas([
      { freq: 523, dur: 0.14 }, // dó
      { freq: 659, dur: 0.14 }, // mi
      { freq: 784, dur: 0.14 }, // sol
      { freq: 1047, dur: 0.22 }, // dó agudo
    ]);
  }

  // Som suave de "tenta de novo" (nunca punitivo).
  function tentarDeNovo() {
    tocarNotas([
      { freq: 392, dur: 0.15 },
      { freq: 349, dur: 0.2 },
    ]);
  }

  return { falar, acerto, tentarDeNovo };
})();
