// ===================================================================
// Progresso da criança — salvo no aparelho (localStorage)
// Guarda o nome, o nível atual e o progresso rumo ao próximo nível.
// Base para o sistema de níveis (Etapa B) e recompensas (Etapa E).
// ===================================================================

const Progresso = {
  chave: "abc-aventura:perfil",
  META_NIVEL: 10, // acertos para subir de nível
  dados: null,

  padrao() {
    return { nome: "", nivel: 1, xp: 0, acertosNoNivel: 0 };
  },

  carregar() {
    try {
      this.dados = Object.assign(
        this.padrao(),
        JSON.parse(localStorage.getItem(this.chave)) || {}
      );
    } catch (e) {
      this.dados = this.padrao();
    }
    // Garante limites válidos.
    const max = typeof NIVEL_MAX !== "undefined" ? NIVEL_MAX : 5;
    if (this.dados.nivel < 1) this.dados.nivel = 1;
    if (this.dados.nivel > max) this.dados.nivel = max;
    return this.dados;
  },

  salvar() {
    try {
      localStorage.setItem(this.chave, JSON.stringify(this.dados));
    } catch (e) {
      /* armazenamento bloqueado: segue sem salvar */
    }
  },

  get nome() {
    return this.dados.nome;
  },
  temNome() {
    return !!(this.dados.nome && this.dados.nome.trim());
  },
  definirNome(n) {
    this.dados.nome = String(n || "").trim().slice(0, 12);
    this.salvar();
  },

  get nivel() {
    return this.dados.nivel;
  },
  get xp() {
    return this.dados.xp;
  },
  progressoNivel() {
    return { atual: this.dados.acertosNoNivel, meta: this.META_NIVEL };
  },

  // Registra um acerto. Devolve { subiu, nivel }.
  registrarAcerto() {
    const max = typeof NIVEL_MAX !== "undefined" ? NIVEL_MAX : 5;
    this.dados.xp += 1;
    let subiu = false;
    if (this.dados.nivel < max) {
      this.dados.acertosNoNivel += 1;
      if (this.dados.acertosNoNivel >= this.META_NIVEL) {
        this.dados.nivel += 1;
        this.dados.acertosNoNivel = 0;
        subiu = true;
      }
    }
    this.salvar();
    return { subiu: subiu, nivel: this.dados.nivel };
  },
};

Progresso.carregar();
