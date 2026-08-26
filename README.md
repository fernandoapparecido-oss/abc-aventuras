# 🦉 ABC Aventura

Jogo de **alfabetização** para crianças de **4 a 6 anos** — aprender a ler
brincando. Feito em HTML, CSS e JavaScript puros (sem dependências), para
rodar direto no **GitHub Pages** e funcionar no celular.

## 🎮 O que já tem no protótipo

- **Caça ao Som** — a coruja fala um som (ex.: "toque no que começa com _fffe_")
  e a criança toca na figura certa.
- **Monta Palavra** — mostra uma figura e as sílabas embaralhadas; a criança
  toca as sílabas na ordem para formar a palavra.
- **Meus Adesivos** — álbum com as recompensas coletadas.

### Princípios de design (pensados para a idade)

- 🔊 **Tudo por voz** — a criança ainda não lê, então as instruções são
  faladas em português (Web Speech API).
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

## 🗂️ Estrutura

```
index.html            Estrutura das telas
assets/css/style.css  Visual (cores vivas, botões grandes)
assets/js/data.js     Banco de palavras, sons das letras e adesivos
assets/js/audio.js    Narração por voz + efeitos sonoros
assets/js/app.js      Lógica dos jogos e navegação
```

## 🌱 Próximos passos (ideias)

- Novos mini-jogos: rimas, pescaria de letras, karaokê de sílabas.
- Trilha de fases com progressão (letras → sílabas → palavras → frases).
- Painel dos pais com progresso e "portão" para configurações.
- Personagem/mascote com mais animações e falas.
- Gravar vozes reais (em vez da voz sintetizada) para mais qualidade.

---

Feito para uso pessoal, com a possibilidade de crescer no futuro. 💜
