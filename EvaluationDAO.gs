/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : EvaluationDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object para as Rubricas de Evolução Socioemocional. Registra a linha de base (segunda-feira) e a avaliação final (sexta-feira) de cada aluno nos 4 indicadores: Autorregulação, Cooperação, Expressão Emocional e Pertencimento. Escala de 1 a 5.
 *
 * FUNCIONALIDADES:
 *   - findByStudent(alunoId)     : Histórico completo de rubricas de um aluno.
 *   - findByWeek(semana)         : Todas as rubricas de uma semana específica.
 *   - findByTurma(turma)         : Rubricas de todos os alunos de uma turma.
 *   - createBaseline(data)       : Registra a linha de base de segunda-feira.
 *   - updateFriday(id, scores)   : Atualiza as notas de sexta-feira.
 *   - calculateEvolution(id)     : Calcula a evolução proporcional por indicador.
 *   - getWeeklyKPIs(semana)      : Retorna KPIs agregados da semana.
 *
 * INTEGRAÇÕES:
 *   - Database.gs              : Operações CRUD na aba 'Rubricas'.
 *   - Config.gs                : Nome da aba (SHEET_NAMES.RUBRICAS).
 *   - StudentDAO.gs            : Valida se o alunoId existe.
 *   - SelectionAlgorithm.gs    : Consome calculateEvolution() para a seleção.
 *   - ReportDAO.gs             : Agrega dados de evolução para relatórios.
 *   - DashboardService.gs      : Consome getWeeklyKPIs() para o painel.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de sexta-feira (TriggerManager.gs) aciona o cálculo de evolução.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Escala de 1 a 5 conforme definido na metodologia do projeto.
 *   - Cálculo de evolução proporcional: (base - atual) / base.
 *   - Foco na trajetória individual, não no desempenho absoluto.
 *   - Campos separados para cada um dos 4 indicadores socioemocionais.
 * ============================================================
 */

var EvaluationDAO = (function() {

  var SHEET = Config.SHEET_NAMES.RUBRICAS;

  function findByStudent(id) {
    return Database.findByField(SHEET, 'AlunoID', id);
  }

  function findByWeek(semana) {
    return Database.findByField(SHEET, 'Semana', semana);
  }

  /** Rubrica única de um aluno em uma semana (chave natural AlunoID+Semana). */
  function findByStudentWeek(alunoId, semana) {
    try {
      return findByStudent(alunoId).filter(function(r) {
        return String(r.Semana) === String(semana);
      })[0] || null;
    } catch (error) {
      Logger.log("Erro em findByStudentWeek: " + error.message);
      throw error;
    }
  }

  /**
   * Upsert da linha de base de segunda-feira.
   * data = { alunoId, semana, scores: { Autorregulacao, Cooperacao, ExpressaoEmocional, Pertencimento } }
   */
  function createBaseline(data) {
    try {
      var existing = findByStudentWeek(data.alunoId, data.semana);
      var patch = {};
      Rubric.INDICATORS.forEach(function(ind) {
        patch[ind.key + '_Base'] = Number(data.scores[ind.key]) || '';
      });
      if (data.observacoes) patch.Observacoes = data.observacoes;
      if (existing) return Database.updateRow(SHEET, existing.ID, patch);
      patch.ID = Utilities.getUuid();
      patch.AlunoID = data.alunoId;
      patch.Semana = data.semana;
      patch.EvolucaoProporcional = '';
      return Database.appendRow(SHEET, patch);
    } catch (error) {
      Logger.log("Erro em createBaseline: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  }

  /**
   * Registra a avaliação de sexta-feira e fecha a semana calculando a
   * EvolucaoProporcional (média da evolução proporcional dos 4 indicadores,
   * fórmula em Rubric.gs). Exige linha de base prévia — sem base não há
   * trajetória a medir, e o algoritmo de seleção ficaria enviesado.
   */
  function saveFriday(data) {
    try {
      var existing = findByStudentWeek(data.alunoId, data.semana);
      if (!existing) throw new Error('Linha de base de segunda-feira não encontrada para este aluno/semana. Registre a base antes da avaliação final.');
      var patch = {};
      Rubric.INDICATORS.forEach(function(ind) {
        patch[ind.key + '_Sexta'] = Number(data.scores[ind.key]) || '';
      });
      var merged = Object.assign({}, existing, patch);
      patch.EvolucaoProporcional = Rubric.aggregateEvolution(merged);
      // Observação de sexta complementa (não sobrescreve) a registrada na base.
      if (data.observacoes) {
        patch.Observacoes = existing.Observacoes
          ? existing.Observacoes + ' | Sexta: ' + data.observacoes
          : data.observacoes;
      }
      return Database.updateRow(SHEET, existing.ID, patch);
    } catch (error) {
      Logger.log("Erro em saveFriday: " + error.message);
      throw error;
    }
  }

  return {
    findByStudent: findByStudent,
    findByWeek: findByWeek,
    findByStudentWeek: findByStudentWeek,
    createBaseline: createBaseline,
    saveFriday: saveFriday
  };
})();
