# 🦉 ABC Aventura

Jogo de **alfabetização** para crianças de **4 a 6 anos** — aprender a ler
brincando. Feito em HTML, CSS e JavaScript puros (sem dependências), para
rodar direto no **GitHub Pages** e funcionar no celular.

## 🎮 Os jogos, em 3 mundos

A tela inicial tem três mundos: **🔤 Letras**, **🅰️ Vogais** e **🔢 Números**
(e o álbum de adesivos). O 🏠 de um jogo volta para o mundo dele.

### 🅰️ Vogais e 🔢 Números (novos)

| Jogo | O que treina |
|------|--------------|
| 🚂 **Trem das Vogais** | Com qual vogal a palavra começa |
| 🔡 **Vogal que Falta** | Completar a vogal que falta (G_TO) |
| 😮 **Ai! Oi! Ui!** | Ler encontros de vogais (com figura até o nível 2) |
| ✍️ **Desenha a Vogal** | Traçar as vogais com o dedo |
| 🙂 **Letras do Meu Nome** (mundo Letras) | Montar o próprio nome |
| 🍎 **Quantos Tem?** | Contar tocando (uma de cada vez) e achar o número |
| ✏️ **Desenha o Número** | Traçar os números com o dedo |

### 🎯 Missão do dia

Todo dia o jogo sorteia uma missão nova: **até 5 jogos diferentes** (sempre
um de Vogais, um de Números e o resto de Letras), com quantidades que somam
**no máximo uns 10 minutos**. A missão não se repete (nenhuma igual nos
últimos 30 dias) e evita os jogos dos dois dias anteriores; no máximo um jogo
longo (Bingo, Par das Letras ou Letras do Meu Nome) por dia. Cada rodada
terminada conta (no Bingo, cada partida); um selo no alto mostra o progresso
(🎯 4/6). Cumprindo tudo: medalha 🏅 e 🔥 dias seguidos. No painel 👪 os pais
escolhem quais jogos podem entrar e podem sortear outra missão para o dia.

### 🎱 Bingo (mundo Letras)

- **Bingo das Letras / das Palavras — solo contra a coruja:** o jogo canta
  (o nome da letra ou a palavra) e a criança marca na
  cartela ou toca em "🙅 Não tenho". A coruja marca a dela. Uma linha
  (reta ou diagonal) ganha. Cartela 3×3 até o nível 2, depois 4×4; figuras
  nas palavras até o nível 2. A coruja ganha cerca de 3 em cada 10.
- **Bingo da Família — vários celulares, sem internet:** o celular do adulto
  é o **cantor** (sorteia, mostra e fala, guarda o histórico); cada criança
  abre **"Minha cartela"** no próprio celular. Todos escolhem o mesmo tipo
  (Letras/Palavras) e tamanho (3×3/4×4). A cartela nasce do número dela
  (1 a 99), então o cantor confere qualquer cartela digitando o número.

### 🔤 Letras

Cobrem toda a trilha da alfabetização, do mais fácil ao mais difícil:

| Jogo | O que treina |
|------|--------------|
| 🔎 **Caça ao Som** | Com que letra a palavra começa (a letra é dita pelo nome: "éfe") |
| 🧩 **Monta Palavra** | Juntar sílabas para formar a palavra |
| 🎵 **Rimas** | Ouvido para os sons finais (rimas) |
| 🥁 **Bate as Sílabas** | Sentir os pedaços da palavra (uma batida por sílaba) |
| 🎣 **Pescaria de Letras** | Reconhecer a letra pelo nome |
| 🃏 **Par das Letras** | Ligar maiúscula e minúscula (jogo da memória) |
| ❓ **Sílaba que Falta** | Completar a sílaba que falta na palavra |
| 📖 **Caça à Palavra** | Reconhecer a palavra escrita (leitura) |
| ✏️ **Desenha a Letra** | Traçar a letra com o dedo (pré-escrita) |

E o **🏆 Meus Adesivos** — álbum com as recompensas coletadas.

### Princípios de design (pensados para a idade)

- 🔊 **Tudo por voz** — a criança ainda não lê, então as instruções são
  faladas em português. Usa áudios neurais pré-gravados quando existem
  (ver abaixo) e cai na voz do aparelho (Web Speech API) como reserva.
- 👂 **Ouvir antes de responder** — enquanto a pergunta toca, as opções
  ficam apagadas e não aceitam toque (o 🏠 e o 🔊 continuam livres). O mesmo
  vale para o som depois de cada toque (a sílaba, a letra).
- 🎯 **Sem premiar o chute** — errou: "quase!" e a pergunta é repetida; no
  2º erro, a resposta certa brilha. O adesivo e o avanço de nível vêm só no
  acerto de primeira (depois de errar, ganha um 👍).
- 🌱 **Ritmo calmo** — no nível 1 são só 2 opções (3 peixes, 3 pares); cada
  rodada começa com as opções travadas e uma pausinha antes da pergunta; na
  primeira rodada a coruja convida "Vamos ouvir com atenção?"; a cada 10
  rodadas ela sugere um descanso. O erro não treme mais, só apaga de leve.
- 👪 **Para os pais** — na tela inicial, segure "pais" por 2 segundos: mostra
  quanto a criança acerta de primeira (hoje, 7 dias e por jogo).
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
(~200 clipes curtos), então isso é rápido e barato.

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

### Alternativa: voz da família (gravador)

Em vez do TTS, dá para gravar a voz de alguém da família — voz conhecida
e carinhosa. Abra o gravador num servidor local (o microfone só funciona
em `localhost` ou `https`):

```bash
python3 -m http.server 8000
# abra http://localhost:8000/tools/gravador.html
```

Grave cada frase (o progresso fica salvo no navegador, pode continuar
depois), clique em **Exportar áudios (zip)**, descompacte o zip na
**raiz do projeto** (ele já traz os arquivos em `assets/audio/` e o
`manifest.json`) e faça commit:

```bash
git add assets/audio && git commit -m "Adiciona áudios da voz da família" && git push
```

O jogo detecta o formato automaticamente (o gravador salva em `.webm`/
`.ogg`; o TTS salva em `.mp3`). Use uma fonte ou outra — não misture as
duas no mesmo `manifest.json`.

### Tudo pelo celular (sem computador)

A mesma página `tools/gravador.html` tem dois painéis para quem não quer
usar terminal:

- **🤖 Gerar com voz de IA (ElevenLabs):** cole a **chave** + **Voice ID**
  (ficam só no aparelho) e toque em **Gerar todas as frases**. Se o
  navegador bloquear a chamada (CORS), use o campo **URL de proxy** com um
  Cloudflare Worker que repasse ao ElevenLabs.
- **☁️ Enviar para o GitHub:** cole um **token fine-grained** (permissão
  *Contents: Read and write* no repositório) e toque em **Enviar** — os
  áudios e o `manifest.json` vão **direto para o repositório**, sem ZIP.

- **🔁 Refazer áudios com problema:** marca de uma vez os áudios apontados
  na avaliação (palavras que estavam sem acento/cedilha, cortes, áudios
  baixos ou curtos) para gerar de novo. Cada áudio gerado passa por uma
  checagem automática (curto, baixo ou cortado → tenta de novo, até 3x).
- **Sons das letras:** gravados com voz humana na seção 🔊 (a voz sintética
  não sustenta "ffff", "mmmm"). O jogo aceita áudios em formatos diferentes
  (mp3 da IA + webm da gravação); o manifesto registra o formato de cada um.
- O envio ao GitHub sobe **só o que mudou** desde o último envio.
  Gravações que já subiram (mesmo que tratadas depois no repositório) são
  reconhecidas pela impressão digital guardada no `manifest.json` (`origem`)
  e não são enviadas de novo.
- Ao tocar em **Parar**, o gravador ainda grava 0,4 s (para não cortar o
  final da fala). O jogo pula sozinho o silêncio do começo de cada áudio.

Abra a página pelo site publicado (`…github.io/abc-aventuras/tools/gravador.html`)
ou por um servidor local. Tudo é guardado no navegador, então dá para
parar e continuar depois.

## 🗂️ Estrutura

```
index.html               Estrutura das telas
assets/css/style.css     Visual (cores vivas, botões grandes)
assets/js/data.js        Banco de palavras, sons das letras e adesivos
assets/js/frases.js      Mapa de frases de áudio (fonte única)
assets/js/audio.js       Narração (clipes + voz do aparelho) e efeitos
assets/js/app.js         Lógica dos jogos e navegação
assets/audio/            Clipes de áudio + manifest.json
tools/gerar-audios.mjs   Gerador de áudios por TTS neural (na sua máquina)
tools/gravador.html      Gravar voz, gerar com IA (ElevenLabs) e enviar ao GitHub — pelo navegador/celular
```

## 🌱 Próximos passos (ideias)

- Novos mini-jogos: rimas, pescaria de letras, karaokê de sílabas.
- Trilha de fases com progressão (letras → sílabas → palavras → frases).
- Painel dos pais com progresso e "portão" para configurações.
- Personagem/mascote com mais animações e falas.
- Gravar vozes reais (em vez da voz sintetizada) para mais qualidade.

---

Feito para uso pessoal, com a possibilidade de crescer no futuro. 💜
