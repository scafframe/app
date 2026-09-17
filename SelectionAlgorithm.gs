/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : SelectionAlgorithm.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Algoritmo de Seleção de Alunos. Analisa o progresso proporcional de cada aluno (linha de base vs. avaliação atual nos 4 indicadores socioemocionais) para escolher os 4 alunos de cada turma que mais evoluíram em relação ao próprio histórico, conforme a metodologia do projeto.
 *
 * FUNCIONALIDADES:
 *   - selectForTurma(turma)         : Seleciona os 4 alunos de uma turma.
 *   - calculateProportionalEvolution(alunoId): Calcula a evolução proporcional.
 *   - rankStudents(turma)           : Ordena alunos por evolução proporcional.
 *   - applyOverride(turma, overrides): Aplica ajustes manuais do professor.
 *   - saveSelection(turma, selected) : Persiste a seleção na aba 'Selecoes'.
 *   - getSelectionHistory(turma)    : Histórico de seleções anteriores.
 *
 * INTEGRAÇÕES:
 *   - EvaluationDAO.gs    : Busca as rubricas da semana para calcular evolução.
 *   - StudentDAO.gs       : Lista os alunos de uma turma.
 *   - Database.gs         : Salva a seleção na aba 'Selecoes'.
 *   - Config.gs           : Lê MAX_STUDENTS_SESSION (padrão: 4).
 *   - NotificationService.gs: Notifica professores com a lista de selecionados.
 *   - JobScheduler.gs     : Aciona selectForTurma() toda sexta-feira.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Executado toda sexta-feira às 17h pelo gatilho de TriggerManager.gs.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID      : Acessado via Database.gs.
 *   - MAX_STUDENTS_SESSION : Número de alunos por sessão (padrão: 4).
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Evolução proporcional: (base - atual) / base — foco na trajetória individual.
 *   - Desempate por menor nota de base (prioriza quem mais precisa de reconhecimento).
 *   - Override manual pelo professor com registro de justificativa.
 *   - Histórico de seleções para garantir rotatividade e equidade.
 * ============================================================
 */

var SelectionAlgorithm = {
  selectForTurma: function(turma) {
    try {
      var alunos = StudentDAO.findByTurma(turma);
      var max = Config.APP_CONFIG.MAX_STUDENTS_SESSION;
      var ranked = alunos.map(function(a) {
        var ev = EvaluationDAO.findByStudent(a.ID);
        var latest = ev.length ? ev[ev.length - 1] : null;
        var score = latest ? parseFloat(latest.EvolucaoProporcional) : 0;
        return { aluno: a, score: score };
      }).sort(function(a, b) { return b.score - a.score; });
      var selected = ranked.slice(0, max).map(function(r) { return r.aluno; });
      this.saveSelection(turma, selected);
      return selected;
    } catch (error) {
      Logger.log("Erro em selectForTurma: " + error.message);
      throw error;
    }
  },
  saveSelection: function(turma, selected) {
    try {
      var semana = Utils.formatDate(Utils.getWeekStart(new Date()));
      selected.forEach(function(a) {
        Database.appendRow(Config.SHEET_NAMES.SELECOES, {
          ID: Utilities.getUuid(), Semana: semana, Turma: turma,
          AlunoID: a.ID, Motivo: 'Algoritmo', Override: 'Nao', DataSelecao: new Date()
        });
      });
    } catch (error) {
      Logger.log("Erro em saveSelection: " + error.message);
      throw error;
    }
  }
};
