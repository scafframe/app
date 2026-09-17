/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : EvaluationController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador de Avaliações Socioemocionais. Recebe os dados da rubrica semanal, calcula a evolução proporcional de cada aluno (comparando linha de base de segunda-feira com avaliação de sexta-feira) e aciona o SelectionAlgorithm.gs para pré-selecionar os 4 alunos da próxima sessão.
 *
 * FUNCIONALIDADES:
 *   - saveBaseline(data, token)    : Salva a linha de base de segunda-feira.
 *   - saveFridayScore(data, token) : Salva a avaliação de sexta-feira.
 *   - getEvolution(data, token)    : Retorna a evolução calculada de um aluno.
 *   - getWeeklyRanking(data, t)    : Ranking de evolução proporcional da semana.
 *   - triggerSelection(data, t)    : Aciona o algoritmo de seleção após avaliação.
 *
 * INTEGRAÇÕES:
 *   - Router.gs              : Registra as rotas 'evaluation.*'.
 *   - EvaluationDAO.gs       : Persistência das rubricas.
 *   - SelectionAlgorithm.gs  : Aciona a seleção após o fechamento da rubrica.
 *   - NotificationService.gs : Notifica professores sobre os alunos selecionados.
 *   - DashboardService.gs    : Atualiza os KPIs do painel.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de sexta-feira (TriggerManager.gs) aciona triggerSelection automaticamente.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via EvaluationDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Cálculo de evolução proporcional: foco na trajetória individual do aluno.
 *   - Integração direta com o algoritmo de seleção após fechamento da rubrica.
 *   - Notificação automática dos professores com a lista de selecionados.
 * ============================================================
 */

Router.register('evaluation.saveBaseline', function(d, t) { return Response.success(EvaluationDAO.createBaseline(d)); });
Router.register('evaluation.saveFriday',   function(d, t) { return Response.success(EvaluationDAO.saveFriday(d)); });
Router.register('evaluation.get',          function(d, t) { return Response.success(EvaluationDAO.findByStudentWeek(d.alunoId, d.semana)); });
Router.register('evaluation.byWeek',       function(d, t) { return Response.success(EvaluationDAO.findByWeek(d.semana)); });
// Descritores e mediações da rubrica — fonte única (Rubric.gs) para o formulário e relatórios.
Router.register('evaluation.rubric',       function(d, t) { return Response.success({ indicators: Rubric.INDICATORS, scaleMax: Rubric.SCALE_MAX }); });
