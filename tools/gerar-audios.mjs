#!/usr/bin/env node
// ===================================================================
// Gerador de áudios do ABC Aventura
//
// Gera um arquivo .mp3 para cada frase/palavra/sílaba/letra/som do
// jogo usando uma voz neural na nuvem, e escreve o manifesto que o
// jogo usa para saber quais clipes existem.
//
// Rode na SUA máquina (não neste repositório na nuvem), com a chave
// de API do provedor escolhido:
//
//   Google Cloud Text-to-Speech (recomendado):
//     export GOOGLE_TTS_API_KEY="sua-chave"
//     node tools/gerar-audios.mjs
//
//   ElevenLabs:
//     export ELEVENLABS_API_KEY="sua-chave"
//     export ELEVENLABS_VOICE_ID="id-da-voz"
//     node tools/gerar-audios.mjs
//
// Opções:
//   --force   regenera todos os clipes (por padrão pula os que já existem)
//
// Depois de gerar, confira o resultado e faça commit dos .mp3 e do
// manifest.json.
// ===================================================================

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");
const DIR_AUDIO = join(RAIZ, "assets", "audio");
const FORCE = process.argv.includes("--force");

// --- Carrega o mapa de frases reaproveitando os arquivos do jogo ---
async function carregarFrases() {
  const dataSrc = await readFile(join(RAIZ, "assets/js/data.js"), "utf8");
  const frasesSrc = await readFile(join(RAIZ, "assets/js/frases.js"), "utf8");
  // Executa os dois scripts num escopo isolado e devolve FRASES.
  // (Dentro de uma Function, `module` não existe, então o guard de
  //  exportação do frases.js é ignorado sem erro.)
  const fn = new Function(dataSrc + "\n" + frasesSrc + "\n;return FRASES;");
  return fn();
}

// --- Provedores de TTS ---------------------------------------------
function escolherProvedor() {
  if (process.env.GOOGLE_TTS_API_KEY) {
    const nome = process.env.GOOGLE_TTS_VOICE || "pt-BR-Neural2-C";
    return {
      nome: `Google Cloud TTS (${nome})`,
      async sintetizar(texto) {
        const url =
          "https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
          encodeURIComponent(process.env.GOOGLE_TTS_API_KEY);
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text: texto },
            voice: { languageCode: "pt-BR", name: nome },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: Number(process.env.GOOGLE_TTS_RATE || 0.95),
              pitch: Number(process.env.GOOGLE_TTS_PITCH || 1.5),
            },
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
        const j = await resp.json();
        return Buffer.from(j.audioContent, "base64");
      },
    };
  }
  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) {
    const id = process.env.ELEVENLABS_VOICE_ID;
    return {
      nome: `ElevenLabs (${id})`,
      async sintetizar(texto) {
        const url =
          `https://api.elevenlabs.io/v1/text-to-speech/${id}` +
          "?output_format=mp3_44100_128";
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: texto,
            model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
        return Buffer.from(await resp.arrayBuffer());
      },
    };
  }
  return null;
}

const existe = (p) =>
  access(p, constants.F_OK).then(
    () => true,
    () => false
  );

async function main() {
  const frases = await carregarFrases();
  const chaves = Object.keys(frases);
  console.log(`Frases a gerar: ${chaves.length}`);

  const provedor = escolherProvedor();
  if (!provedor) {
    console.error(
      "\nNenhuma chave de API encontrada. Defina uma das opções:\n" +
        "  GOOGLE_TTS_API_KEY=...\n" +
        "  ELEVENLABS_API_KEY=... e ELEVENLABS_VOICE_ID=...\n"
    );
    process.exit(1);
  }
  console.log(`Provedor: ${provedor.nome}\n`);

  await mkdir(DIR_AUDIO, { recursive: true });

  const disponiveis = [];
  let gerados = 0,
    pulados = 0,
    falhas = 0;

  for (const chave of chaves) {
    const destino = join(DIR_AUDIO, chave + ".mp3");
    if (!FORCE && (await existe(destino))) {
      disponiveis.push(chave);
      pulados++;
      continue;
    }
    try {
      const buf = await provedor.sintetizar(frases[chave]);
      await writeFile(destino, buf);
      disponiveis.push(chave);
      gerados++;
      process.stdout.write(`  ✓ ${chave} ("${frases[chave]}")\n`);
    } catch (e) {
      falhas++;
      process.stdout.write(`  ✗ ${chave}: ${e.message}\n`);
    }
  }

  disponiveis.sort();
  await writeFile(
    join(DIR_AUDIO, "manifest.json"),
    JSON.stringify({ clips: disponiveis }, null, 2) + "\n"
  );

  console.log(
    `\nPronto. Gerados: ${gerados} | Pulados: ${pulados} | Falhas: ${falhas}`
  );
  console.log(`Manifesto atualizado com ${disponiveis.length} clipes.`);
  if (falhas === 0) {
    console.log("\nAgora confira os áudios e faça:  git add assets/audio && git commit && git push");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
