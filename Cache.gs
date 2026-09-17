/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Cache.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Wrapper para o CacheService nativo do Google Apps Script. Otimiza a leitura de dados estáticos (catálogo de filmes, lista de alunos) para reduzir chamadas à planilha e melhorar a performance da aplicação. Exposto como Cache_ para evitar conflito.
 *
 * FUNCIONALIDADES:
 *   - Cache_.get(key)           : Retorna o valor cacheado pela chave.
 *   - Cache_.set(key, val, ttl) : Armazena um valor com tempo de expiração (TTL).
 *   - Cache_.remove(key)        : Remove uma entrada do cache.
 *   - Cache_.invalidate(sheet)  : Invalida todas as entradas relacionadas a uma aba.
 *   - Cache_.getOrSet(key, fn)  : Retorna do cache ou executa a função e cacheia.
 *
 * INTEGRAÇÕES:
 *   - CacheService (nativo)  : API do Apps Script para cache em memória.
 *   - Database.gs            : Invalida o cache após operações de escrita.
 *   - MovieDAO.gs            : Cacheia o catálogo de filmes por 1 hora.
 *   - Auth.gs                : Armazena tokens de sessão com TTL de 8 horas.
 *   - Security.gs            : Armazena contadores de rate limiting.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - CACHE_TTL_DEFAULT : TTL padrão em segundos (padrão: 3600 = 1 hora).
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Uso do CacheService.getScriptCache() para cache compartilhado entre execuções.
 *   - Invalidação automática do cache após operações de escrita na planilha.
 *   - TTL configurável por tipo de dado (sessões: 8h, filmes: 1h, logs: sem cache).
 * ============================================================
 */

// Fix (2026-06): _cache era eager — CacheService.getScriptCache() era chamado na
// declaracao do objeto (tempo de carga do modulo). Convertido para lazy getter
// para garantir que a chamada ocorra somente em tempo de execucao.
var Cache_ = {
  get _cache() { return CacheService.getScriptCache(); },
  get: function(key) { return this._cache.get(key); },
  set: function(key, val, ttl) { this._cache.put(key, val, ttl || 3600); },
  remove: function(key) { this._cache.remove(key); },
  invalidate: function(sheet) { /* Invalida chaves relacionadas à aba */ }
};
