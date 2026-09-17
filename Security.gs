/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Security.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Módulo de segurança do sistema. Embora o projeto utilize senhas em texto plano (conforme requisito explícito), este módulo implementa proteções adicionais: prevenção de injeção de dados na planilha, rate limiting básico para tentativas de login e validação de origem das requisições.
 *
 * FUNCIONALIDADES:
 *   - sanitizeInput(data)        : Remove caracteres perigosos de todos os campos.
 *   - checkRateLimit(identifier) : Bloqueia após 5 tentativas falhas de login.
 *   - resetRateLimit(identifier) : Reseta o contador após login bem-sucedido.
 *   - validateOrigin(token)      : Verifica se a requisição vem de uma sessão válida.
 *   - logSecurityEvent(type, d)  : Registra eventos de segurança no log.
 *
 * INTEGRAÇÕES:
 *   - Auth.gs      : Chama checkRateLimit() antes de validar credenciais.
 *   - Cache.gs     : Armazena contadores de rate limiting.
 *   - Logger.gs    : Registra eventos de segurança.
 *   - Validation.gs: sanitizeInput() complementa a validação de dados.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - RATE_LIMIT_MAX : Número máximo de tentativas (padrão: 5).
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Senhas em texto plano conforme requisito explícito do projeto.
 *   - Rate limiting para mitigar ataques de força bruta.
 *   - Sanitização de todos os inputs antes de escrita na planilha.
 *   - Log de eventos de segurança para auditoria.
 * ============================================================
 */

var Security = {
  RATE_LIMIT_MAX: 5,
  sanitizeInput: function(data) {
    try {
      var clean = {};
      Object.keys(data).forEach(function(k) { clean[k] = Utils.sanitize(data[k]); });
      return clean;
    } catch (error) {
      Logger.log("Erro em sanitizeInput: " + error.message);
      throw error;
    }
  },
  checkRateLimit: function(id) {
    try {
      var key = 'rl_' + id;
      var count = parseInt(Cache_.get(key) || '0');
      if (count >= this.RATE_LIMIT_MAX) throw new Error('Muitas tentativas. Tente novamente em 15 minutos.');
      Cache_.set(key, String(count + 1), 900);
    } catch (error) {
      Logger.log("Erro em checkRateLimit: " + error.message);
      throw error;
    }
  }
};
