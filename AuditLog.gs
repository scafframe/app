/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : AuditLog.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Trilha de auditoria do sistema. Registra quem realizou alterações em dados sensíveis (notas de rubrica, cadastro de usuários, exclusões) com timestamp, usuário, ação e dados anteriores/posteriores, garantindo a integridade e rastreabilidade do processo pedagógico.
 *
 * FUNCIONALIDADES:
 *   - log(token, action, entity, before, after) : Registra uma operação auditável.
 *   - getAuditTrail(entity, entityId)           : Histórico de alterações de um registro.
 *   - getAuditByUser(userId)                    : Todas as ações de um usuário.
 *   - getRecentAudit(n)                         : Últimas N entradas da trilha.
 *
 * INTEGRAÇÕES:
 *   - Database.gs      : Escrita na aba 'Logs' com nível 'AUDIT'.
 *   - Auth.gs          : Obtém o usuário atual pelo token para o registro.
 *   - UserController.gs: Registra criação/exclusão de usuários.
 *   - EvaluationController.gs: Registra alterações em notas de rubrica.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Registro imutável: entradas de auditoria não podem ser deletadas.
 *   - Armazenamento dos dados antes e depois da alteração (before/after).
 *   - Essencial para transparência no processo de seleção e avaliação.
 * ============================================================
 */

var AuditLog = { log: function(token, action, entity, before, after) { var user = Auth.validateSession(token); Logger_._write('AUDIT', entity, JSON.stringify({ user: user ? user.nome : 'sistema', action: action, before: before, after: after })); } };
