/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : AttendanceDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object para o registro de presença nas sessões do Cine Clube. Registra quais dos 4 alunos selecionados por turma compareceram efetivamente à sessão, assinaram o Caderno de Assinaturas e participaram das atividades expressivas do Mural da Evolução.
 *
 * FUNCIONALIDADES:
 *   - findBySession(sessaoId)    : Lista de presença de uma sessão específica.
 *   - findByStudent(alunoId)     : Histórico de presenças de um aluno.
 *   - create(attendanceData)     : Registra a presença de um aluno em uma sessão.
 *   - markSigned(id)             : Marca que o aluno assinou o Caderno de Assinaturas.
 *   - markMural(id)              : Marca participação no Mural da Evolução.
 *   - getAttendanceRate(alunoId) : Calcula a taxa de presença do aluno no projeto.
 *
 * INTEGRAÇÕES:
 *   - Database.gs       : Operações CRUD na aba 'Presencas'.
 *   - Config.gs         : Nome da aba (SHEET_NAMES.PRESENCAS).
 *   - SessionDAO.gs     : Valida se a sessaoId existe.
 *   - StudentDAO.gs     : Valida se o alunoId existe.
 *   - ReportDAO.gs      : Usa dados de presença para relatórios de pertencimento.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Preenchido manualmente pelo estagiário via AttendanceForm.html.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Campos booleanos separados para assinatura e participação no mural.
 *   - Taxa de presença calculada para o KPI de pertencimento.
 *   - Registro imutável: presenças não são deletadas, apenas atualizadas.
 * ============================================================
 */

var AttendanceDAO = { findBySession: function(id) { return Database.findByField(Config.SHEET_NAMES.PRESENCAS, 'SessaoID', id); } };
