# 🦉 ABC Aventura — Planejamento por etapas

Mapa do caminho, do protótipo ao app de alfabetização completo. Cada etapa
tem um **entregável testável** — só avançamos quando a anterior funciona no
celular.

Legenda: ✅ feito · 🟡 em andamento · 🔜 próxima · ⬜ planejada

> **Onde estamos:** protótipo com **9 mini-jogos**, narração por voz (clipes
> pré-gravados + voz do aparelho), **gravador** da voz da família e **gerador
> por TTS neural**. Publicado como site estático em
> https://fernandoapparecido-oss.github.io/abc-aventuras/.
> **Agora começando a Etapa A (banco graduado).**

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

## Etapa B — Sistema de níveis (progressão) ⬜
A criança começa no Nível 1 e **desbloqueia** os próximos conforme acerta.

- Jogos filtram as palavras pelo **nível ativo** da criança.
- Barra de progresso do nível; "subiu de nível!" com comemoração.
- Home mostra o nível atual e "continuar de onde parou".

**Entregável:** jogar faz a criança avançar de nível, com palavras cada vez
mais difíceis.

---

## Etapa C — Nome da criança ⬜
Primeiro acesso pede o nome de um jeito lúdico.

- Teclado de **letras grandes**; a criança **escreve o nome tocando** nas
  letras (com a voz falando cada letra).
- O jogo passa a chamá-la pelo nome ("Oi, Ana! Vamos brincar?").

**Entregável:** a criança monta o nome tocando e o jogo a chama pelo nome.

---

## Etapa D — Mascote ⬜
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

## Etapa F — PWA (instalável + offline) ⬜
- `manifest.webmanifest` + **ícone** + **service worker** (`sw.js`).
- Workflow `.github/workflows/pages.yml` que republica a cada envio.

**Entregável:** "Adicionar à tela inicial", abre offline como um app.

---

## Etapa G — Voz definitiva ⬜ (depois de congelar a Etapa A)
Com o vocabulário fechado, gravar/gerar a voz — sem retrabalho.

- **Voz da família** (`tools/gravador.html`) **ou** **TTS neural**
  (`tools/gerar-audios.mjs`).

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
