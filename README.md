# 🦉 ABC Aventura

Jogo de **alfabetização** para crianças de **4 a 6 anos** — aprender a ler
brincando. Feito em HTML, CSS e JavaScript puros (sem dependências), para
rodar direto no **GitHub Pages** e funcionar no celular.

## 🎮 Os 9 mini-jogos

Cobrem toda a trilha da alfabetização, do mais fácil ao mais difícil:

| Jogo | O que treina |
|------|--------------|
| 🔎 **Caça ao Som** | Som inicial da palavra |
| 🧩 **Monta Palavra** | Juntar sílabas para formar a palavra |
| 🎵 **Rimas** | Ouvido para os sons finais (rimas) |
| 🥁 **Bate as Sílabas** | Sentir os pedaços da palavra (uma batida por sílaba) |
| 🎣 **Pescaria de Letras** | Reconhecer a letra pelo som |
| 🃏 **Par das Letras** | Ligar maiúscula e minúscula (jogo da memória) |
| ❓ **Sílaba que Falta** | Completar a sílaba que falta na palavra |
| 📖 **Caça à Palavra** | Reconhecer a palavra escrita (leitura) |
| ✏️ **Desenha a Letra** | Traçar a letra com o dedo (pré-escrita) |

E o **🏆 Meus Adesivos** — álbum com as recompensas coletadas.

### Princípios de design (pensados para a idade)

- 🔊 **Tudo por voz** — a criança ainda não lê, então as instruções são
  faladas em português. Usa áudios neurais pré-gravados quando existem
  (ver abaixo) e cai na voz do aparelho (Web Speech API) como reserva.
- 🖐️ **Botões grandes** e poucos elementos por tela.
- 😊 **Sem punição** — o erro dá um som suave e "tenta de novo", nunca
  "game over".
- 🏆 **Recompensa visual** — adesivos colecionáveis (salvos no aparelho).
- 🖼️ **Emojis como figuras** — nenhuma imagem para baixar; funciona offline.

## 🚀 Como publicar no GitHub Pages

1. No GitHub, abra este repositório em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)`. Salve.
4. Em alguns minutos o jogo estará no ar em:
   `https://fernandoapparecido-oss.github.io/abc-aventuras/`

## 🧪 Como testar no computador

É um site estático — basta abrir o `index.html` no navegador, ou rodar um
servidor local:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

> A voz funciona melhor no Chrome/Edge. No celular, o som só começa após o
> primeiro toque na tela (regra dos navegadores).

## 🔊 Voz de alta qualidade (áudios neurais)

Por padrão o jogo usa a voz do próprio aparelho, cuja qualidade varia. Para
uma voz neural profissional e **igual em todos os celulares**, gere os
áudios uma vez e faça commit deles. O vocabulário é pequeno e fixo
(~135 clipes curtos), então isso é rápido e barato.

**Na sua máquina** (não na nuvem), com uma chave de API de TTS:

```bash
# Opção A — Google Cloud Text-to-Speech (recomendado, camada gratuita)
export GOOGLE_TTS_API_KEY="sua-chave"
node tools/gerar-audios.mjs

# Opção B — ElevenLabs
export ELEVENLABS_API_KEY="sua-chave"
export ELEVENLABS_VOICE_ID="id-da-voz"
node tools/gerar-audios.mjs
```

O script grava um `.mp3` por frase em `assets/audio/` e atualiza o
`assets/audio/manifest.json` (a lista que o jogo lê para saber quais
clipes tocar). Depois:

```bash
git add assets/audio && git commit -m "Adiciona áudios da voz" && git push
```

Enquanto o manifesto estiver vazio, o jogo simplesmente usa a voz do
aparelho — nada quebra. Use `node tools/gerar-audios.mjs --force` para
regerar tudo (por exemplo, ao trocar de voz).

## 🗂️ Estrutura

```
index.html               Estrutura das telas
assets/css/style.css     Visual (cores vivas, botões grandes)
assets/js/data.js        Banco de palavras, sons das letras e adesivos
assets/js/frases.js      Mapa de frases de áudio (fonte única)
assets/js/audio.js       Narração (clipes + voz do aparelho) e efeitos
assets/js/app.js         Lógica dos jogos e navegação
assets/audio/            Clipes .mp3 gerados + manifest.json
tools/gerar-audios.mjs   Gerador dos áudios (roda na sua máquina)
```

## 🌱 Próximos passos (ideias)

- Novos mini-jogos: rimas, pescaria de letras, karaokê de sílabas.
- Trilha de fases com progressão (letras → sílabas → palavras → frases).
- Painel dos pais com progresso e "portão" para configurações.
- Personagem/mascote com mais animações e falas.
- Gravar vozes reais (em vez da voz sintetizada) para mais qualidade.

---

Feito para uso pessoal, com a possibilidade de crescer no futuro. 💜
