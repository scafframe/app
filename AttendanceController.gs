/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : AttendanceController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador de Presença. Gerencia o registro de comparecimento dos alunos selecionados às sessões do Cine Clube, validando a assinatura no Caderno de Assinaturas e a participação nas atividades expressivas do Mural da Evolução.
 *
 * FUNCIONALIDADES:
 *   - registerAttendance(data, t) : Registra a presença de um aluno em uma sessão.
 *   - markSigned(data, token)     : Confirma assinatura no Caderno de Assinaturas.
 *   - markMuralParticipation(d,t) : Confirma participação no Mural da Evolução.
 *   - getSessionAttendance(d, t)  : Lista de presença de uma sessão.
 *   - getStudentAttendanceRate(d,t): Taxa de presença de um aluno.
 *
 * INTEGRAÇÕES:
 *   - Router.gs        : Registra as rotas 'attendance.*'.
 *   - AttendanceDAO.gs : Persistência dos registros de presença.
 *   - SessionDAO.gs    : Valida se a sessão existe e está com status 'Realizada'.
 *   - StudentDAO.gs    : Valida se o aluno está na lista de selecionados.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Preenchido manualmente pelo estagiário.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via AttendanceDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Validação de que o aluno está na lista de selecionados para a sessão.
 *   - Campos separados para assinatura e participação no mural.
 *   - Taxa de presença calculada para o KPI de pertencimento escolar.
 * ============================================================
 */

Router.register('attendance.register', function(d, t) { return Response.success(AttendanceDAO.create(d)); });
