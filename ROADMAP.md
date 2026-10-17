# 🦉 ABC Aventura — Planejamento por etapas

Mapa do caminho, do protótipo ao app de alfabetização completo. Cada etapa
tem um **entregável testável** — só avançamos quando a anterior funciona no
celular.

Legenda: ✅ feito · 🟡 em andamento · 🔜 próxima · ⬜ planejada

> **Onde estamos:** **Etapas A, B, C, D, F e G concluídas.** 9 mini-jogos com
> **banco graduado por nível**, **progressão** (sobe de nível jogando),
> **nome da criança** (escreve tocando), **mascote** reativo, **PWA**
> (instalável + offline) e **voz neural do ElevenLabs** em todas as 309
> falas (gerada pelo celular). Publicado em
> https://fernandoapparecido-oss.github.io/abc-aventuras/.
> **Próxima: Etapa E (recompensas).**

---

## Etapa 0 — Protótipo jogável ✅
- 9 mini-jogos cobrindo a trilha da alfabetização (som inicial, sílabas,
  rimas, bater sílabas, pescaria de letras, memória maiúscula/minúscula,
  sílaba que falta, reconhecer a palavra, desenhar a letra).
- Narração por voz, adesivos, sem punição, funciona offline.
- Publicado no GitHub Pages.

---

## Etapa A — Banco de palavras graduado 🟡 (frente atual)
A base de tudo: as palavras precisam ser muitas **e organizadas por
dificuldade**, senão não dá para ter níveis nem congelar o vocabulário para
gravar a voz.

- ✅ Banco reconstruído com o campo **`nivel` (1 a 5)**, do simples ao
  complexo, seguindo a ordem clássica da alfabetização:
  1. sílabas simples (GATO, BOLA) · 2. ditongos/codas (SOL, DENTE) ·
  3. três sílabas (BANANA, CAVALO) · 4. dígrafos (CHAVE, ABELHA) ·
  5. encontros consonantais / longas (COBRA, ELEFANTE).
- 🔜 Continuar enchendo cada nível (meta ~200 palavras com emoji claro).

**Entregável:** banco com ~120+ palavras rotuladas por nível, pronto para os
níveis e para congelar antes da voz.

---

## Etapa B — Sistema de níveis (progressão) ✅
A criança começa no Nível 1 e **desbloqueia** os próximos conforme acerta.

- Jogos filtram as palavras pelo **nível ativo** da criança.
- Barra de progresso do nível; "subiu de nível!" com comemoração.
- Home mostra o nível atual e "continuar de onde parou".

**Entregável:** jogar faz a criança avançar de nível, com palavras cada vez
mais difíceis.

---

## Etapa C — Nome da criança ✅
Primeiro acesso pede o nome de um jeito lúdico.

- Teclado de **letras grandes**; a criança **escreve o nome tocando** nas
  letras (com a voz falando cada letra).
- O jogo passa a chamá-la pelo nome ("Oi, Ana! Vamos brincar?").

**Entregável:** a criança monta o nome tocando e o jogo a chama pelo nome.

---

## Etapa D — Mascote ✅
A coruja **Lili** ganha vida (em emoji animado, sem arte pesada).

- Estados/animações: comemora no acerto, incentiva no erro, "pensa" na
  pergunta, pula na tela inicial.
- Presente nas telas dando as instruções.

**Entregável:** mascote reativo acompanhando a criança pelos jogos.

---

## Etapa E — Progresso + Recompensas ⬜
Salvar tudo no aparelho e transformar em gamificação (padrão Cottage Color).

- Persistência local (localStorage/IndexedDB): nível, **estrelas/XP**,
  adesivos, **ofensiva diária** (🔥), **conquistas**.
- Tela de **Recompensas** com avisos (toasts) ao ganhar algo.

**Entregável:** fecha e reabre e tudo continua; tela de recompensas.

---

## Etapa F — PWA (instalável + offline) ✅
- `manifest.webmanifest` + **ícones** (192/512/maskable, coruja) +
  **service worker** (`sw.js`, cache do esqueleto → abre offline).
- Publicado pelo Pages já existente (deploy pela branch `main`), sem
  precisar de workflow extra.

**Entregável:** "Adicionar à tela inicial", abre offline como um app.

---

## Etapa G — Voz definitiva ✅
Com o vocabulário fechado, gravar/gerar a voz — sem retrabalho.

- ✅ **309 clipes** gerados com **ElevenLabs** direto do celular, pelo
  `tools/gravador.html` (painel "Gerar com voz de IA"), cobrindo 100% das
  falas do banco de 122 palavras.
- ✅ Service worker busca o manifesto de áudio na rede primeiro, para a voz
  nova aparecer sem ficar presa em cache.
- Palavras novas no futuro: o gravador gera **só os clipes que faltam**.
- ✅ **Avaliação dos áudios (out/2026):** volume uniforme, sem arquivos vazios
  ou distorcidos. Problemas achados e corrigidos: palavras sem acento/cedilha
  (agora grafia correta na tela e na fala — PÃO, PALHAÇO, ÁRVORE…), áudios
  cortados no final, alguns baixos/curtos; o H saiu dos jogos de som (é mudo).
  O gravador ganhou "Refazer", checagem automática de qualidade e envio só do
  que mudou; o jogo toca pelo Web Audio (sem engolir o começo da fala).
- 🟡 **Sons das letras (21):** serão regravados com voz humana.

**Entregável:** o jogo falando com a voz final, igual em qualquer aparelho.

---

## Etapa H — Nuvem (opcional, futuro) ⬜
Sincronizar o progresso entre aparelhos.

- Login por **link de e-mail** (Supabase), "convidado primeiro", merge seguro
  — o mesmo modelo do Cottage Color.

**Entregável:** o progresso segue a criança em qualquer aparelho.

---

## Decisões tomadas
| Tema | Decisão |
|---|---|
| Por onde começar | **Banco graduado (Etapa A)** — base de tudo |
| Onde salvar | **Só no aparelho** por ora; nuvem (Supabase) fica como Etapa H |
| Mascote | **Emoji animado** (sem arte, offline, leve) |
| Regra de ouro | **Congelar o banco (A) antes de gravar a voz (G)** |
