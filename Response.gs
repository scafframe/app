/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Response.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Módulo de padronização de respostas da API interna. Garante que todos os retornos do backend para o frontend sigam o mesmo formato JSON: { status: 'success'|'error', data: {}, message: '', code: 200|400|401|404|500 }.
 *
 * FUNCIONALIDADES:
 *   - success(data, msg)  : Cria resposta de sucesso com dados e mensagem opcional.
 *   - error(msg, code)    : Cria resposta de erro com mensagem e código HTTP.
 *   - notFound(entity)    : Resposta padronizada para recurso não encontrado (404).
 *   - unauthorized(msg)   : Resposta padronizada para acesso não autorizado (401).
 *   - validationError(e)  : Resposta para erros de validação com lista de campos.
 *
 * INTEGRAÇÕES:
 *   - Consumido por todos os Controllers e pelo Router.gs.
 *   - Api.html (frontend) : Interpreta o campo 'status' para tratar erros.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - Nenhuma variável de ambiente.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Formato de resposta único para toda a API interna.
 *   - Códigos HTTP semânticos para facilitar o tratamento no frontend.
 *   - Mensagens de erro amigáveis em português para exibição ao usuário.
 * ============================================================
 */

var Response = {
  success: function(data, msg) { return { status: 'success', data: data || {}, message: msg || 'OK', code: 200 }; },
  error:   function(msg, code) { return { status: 'error',   data: {},      message: msg || 'Erro interno.', code: code || 500 }; },
  notFound: function(e)        { return { status: 'error',   data: {},      message: (e||'Recurso') + ' não encontrado.', code: 404 }; },
  unauthorized: function(msg)  { return { status: 'error',   data: {},      message: msg || 'Acesso não autorizado.', code: 401 }; }
};
