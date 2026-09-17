/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Router.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Roteador central de requisições do frontend. Recebe todas as chamadas via google.script.run (RPC) e direciona para o Controller apropriado com base na ação solicitada. Implementa o padrão Command/Dispatcher para desacoplar o frontend dos controllers.
 *
 * FUNCIONALIDADES:
 *   - handle(payload)    : Método principal que despacha a ação para o controller correto.
 *   - register(action, fn): Registra um handler para uma ação específica.
 *   - _dispatch(action, d): Executa o handler registrado com os dados fornecidos.
 *   - _authenticate(t)   : Valida o token de sessão antes de executar ações protegidas.
 *
 * INTEGRAÇÕES:
 *   - Auth.gs               : Valida o token de sessão em toda requisição protegida.
 *   - UserController.gs     : Ações de CRUD de usuários.
 *   - StudentController.gs  : Ações de CRUD de alunos.
 *   - MovieController.gs    : Ações de CRUD do catálogo de filmes.
 *   - SessionController.gs  : Ações de agendamento de sessões.
 *   - EvaluationController.gs: Ações de rubrica e evolução.
 *   - AttendanceController.gs: Ações de registro de presença.
 *   - ReportController.gs   : Ações de geração de relatórios.
 *   - Response.gs           : Formata respostas de erro de roteamento.
 *   - Logger.gs             : Registra todas as ações recebidas.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Invocado por doPost() em Code.gs e por google.script.run.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SESSION_TOKEN : Enviado em todo payload do frontend para autenticação.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Padrão Dispatcher: mapeamento de ações para handlers em um objeto.
 *   - Autenticação centralizada: todo payload deve conter um token válido.
 *   - Tratamento de ação desconhecida retorna erro 404 padronizado.
 *   - Log de todas as ações para auditoria e debugging.
 * ============================================================
 */

// O stub-buffer de Router e definido em 00_RouterBootstrap.gs (avaliado antes
// dos controllers). Aqui apenas drenamos Router._pending e substituimos Router
// pela implementacao real. NAO recriar o stub aqui: isso descartaria as rotas
// ja enfileiradas pelos controllers A–Q carregados antes deste arquivo.
Router = (function() {
  var _routes = {};
  var _pending = Router._pending || [];
  for (var i = 0; i < _pending.length; i++) { _routes[_pending[i][0]] = _pending[i][1]; }

  function register(action, fn) { _routes[action] = fn; }

  function handle(payload) {
    var action = payload.action;
    var token  = payload.token;
    var data   = payload.data || {};
    if (!action) return Response.error('Ação não especificada.');
    if (action !== 'auth.login' && !Auth.validateSession(token)) return Response.error('Sessão inválida. Faça login novamente.', 401);
    if (!_routes[action]) return Response.error('Ação desconhecida: ' + action, 404);
    try {
      Logger_.info('Router', 'Ação: ' + action);
      return _routes[action](data, token);
    } catch (err) {
      Logger_.error('Router.' + action, err);
      return Response.error(err.message);
    }
  }

  return { register: register, handle: handle };
})();
