/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ARQUIVO  : JsonUtils.gs
 * ============================================================
 * Parsing/serialização defensiva de JSON. Exposto como JsonUtils_ para
 * evitar conflito com nomes nativos e seguir o padrão Logger_/Cache_.
 */
var JsonUtils_ = {
  /** Faz JSON.parse sem lançar; retorna fallback (default null) em erro. */
  safeParse: function(text, fallback) {
    try {
      try { return JSON.parse(text); }
      catch (e) { return (fallback === undefined ? null : fallback); }
    } catch (error) {
      Logger.log("Erro em safeParse: " + error.message);
      throw error;
    }
  },
  /** Faz JSON.stringify sem lançar; retorna '' em erro. */
  safeStringify: function(value) {
    try { return JSON.stringify(value); }
    catch (e) { return ''; }
  }
};
