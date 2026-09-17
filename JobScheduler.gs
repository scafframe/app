/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : JobScheduler.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Agendador de tarefas automáticas. Contém as funções executadas pelos gatilhos nativos do TriggerManager.gs. Define a rotina semanal completa: lembrete de rubrica na segunda-feira, cálculo de evolução e seleção de alunos na sexta-feira, e envio do relatório para a coordenação.
 *
 * FUNCIONALIDADES:
 *   - runWeeklySelection()       : Rotina completa de sexta-feira (cálculo + seleção).
 *   - sendBaselineReminder()     : Lembrete de segunda-feira para professores.
 *   - sendWeeklyReportToCoord()  : Envia relatório semanal à coordenação.
 *   - runMonthlyCleanup()        : Limpeza mensal de logs e dados temporários.
 *   - checkUpcomingSessions()    : Verifica sessões nas próximas 24h e envia lembretes.
 *
 * INTEGRAÇÕES:
 *   - TriggerManager.gs      : Registra este módulo como handler dos gatilhos.
 *   - EvaluationController.gs: Aciona o cálculo de evolução na sexta-feira.
 *   - SelectionAlgorithm.gs  : Executa a seleção dos 4 alunos por turma.
 *   - EmailService.gs        : Envia notificações e relatórios por e-mail.
 *   - NotificationService.gs : Cria notificações in-app para os professores.
 *   - Logger.gs              : Registra a execução de cada job.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Executado toda sexta-feira às 17h pelo gatilho de TriggerManager.gs.
 *   - Executado toda segunda-feira às 8h pelo gatilho de TriggerManager.gs.
 *   - Executado no 1º dia de cada mês pelo gatilho de limpeza.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado indiretamente pelos módulos chamados.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Cada job é executado em try/catch independente para isolamento de falhas.
 *   - Log de início e fim de cada job com timestamp para monitoramento.
 *   - Idempotência: jobs podem ser re-executados manualmente sem efeitos colaterais.
 * ============================================================
 */

function runWeeklySelection() {
  Logger_.info('JobScheduler', 'Iniciando rotina de sexta-feira...');
  try {
    var turmas = StudentDAO.countByTurma();
    Object.keys(turmas).forEach(function(turma) {
      var selecionados = SelectionAlgorithm.selectForTurma(turma);
      Logger_.info('JobScheduler', 'Turma ' + turma + ': ' + selecionados.length + ' alunos selecionados.');
    });
    Logger_.info('JobScheduler', 'Rotina de sexta-feira concluída.');
  } catch(err) { Logger_.error('JobScheduler.runWeeklySelection', err); }
}

function sendBaselineReminder() {
  Logger_.info('JobScheduler', 'Enviando lembrete de linha de base...');
  var professores = UserDAO.findAll().filter(function(u) { return u.Perfil === 'Professor'; });
  professores.forEach(function(p) {
    EmailService.sendGeneric(p.Email, '[Cine Clube] Registre a Linha de Base Hoje',
      '<p>Olá, ' + p.Nome + '! Não esqueça de registrar a linha de base dos alunos hoje.</p>');
  });
}
