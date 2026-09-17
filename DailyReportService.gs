/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : DailyReportService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Relatório diário exibido na página inicial (Dashboard). Inspirado nos
 *   dashboards analíticos da frota (Emodiversa/Flex Harn), traz dois blocos:
 *   1) Pares de alunos com evolução socioemocional PRÓXIMA na última semana
 *      fechada — sugestão de mediação em dupla (tutoria entre pares).
 *   2) Radar acadêmico: achados recentes (últimos 15 dias) da literatura
 *      sobre cinema-educação e desenvolvimento socioemocional, via Gemini,
 *      com degradação para um roteiro de busca local (sem citações inventadas).
 *
 * FUNCIONALIDADES:
 *   - build()          : Monta o relatório do dia (cacheado por 6 horas).
 *   - _closeScorePairs(): Pares de alunos com EvolucaoProporcional próxima.
 *   - _academicRadar() : Achados recentes via Gemini ou roteiro de busca local.
 *
 * INTEGRAÇÕES:
 *   - Database.gs / StudentDAO.gs : Leitura de Rubricas e Alunos.
 *   - Rubric.gs                   : Semântica da EvolucaoProporcional.
 *   - GeminiService.gs            : generateText() endurecido (retry+backoff).
 *   - Cache_ (Cache.gs)           : Cache diário do relatório.
 *   - ReportController.gs         : Expõe a ação 'report.daily' ao Dashboard.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Cache com chave por data: no máximo 1 chamada de IA por dia útil.
 *   - Honestidade epistêmica: conteúdo de IA é rotulado e o fallback é um
 *     roteiro de busca verificável, nunca referências fabricadas.
 *   - Falha branda: sem dados de rubrica, o bloco explica o que falta.
 * ============================================================
 */

var DailyReportService = (function() {

  // Diferença máxima de EvolucaoProporcional (escala [-1,1]) para considerar
  // dois alunos "próximos" o bastante para mediação em dupla.
  var PAIR_THRESHOLD = 0.10;
  var MAX_PAIRS = 5;
  var CACHE_TTL_SECONDS = 6 * 3600;

  function _dateKey() {
    try {
      return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } catch (error) {
      Logger.log("Erro em _dateKey: " + error.message);
      throw error;
    }
  }

  /**
   * Pares de alunos com pontuação próxima na última semana com avaliação
   * fechada (EvolucaoProporcional calculada na sexta-feira).
   */
  function _closeScorePairs() {
    try {
      var rows = Database.getAllRows(Config.SHEET_NAMES.RUBRICAS)
        .filter(function(r) {
          if (r.EvolucaoProporcional === '' || r.EvolucaoProporcional === null || r.EvolucaoProporcional === undefined) return false;
          return isFinite(Number(r.EvolucaoProporcional));
        });
      if (!rows.length) return { week: null, pairs: [] };

      // Última semana fechada (Semana é rótulo ordenável, ex.: '2026-W23').
      var week = rows.map(function(r) { return String(r.Semana); }).sort().pop();
      var weekRows = rows.filter(function(r) { return String(r.Semana) === week; });

      var nameById = {};
      StudentDAO.findAll().forEach(function(s) { nameById[s.ID] = s.Nome; });

      var scored = weekRows.map(function(r) {
        return { alunoId: r.AlunoID, nome: nameById[r.AlunoID] || r.AlunoID, score: Number(r.EvolucaoProporcional) };
      }).sort(function(a, b) { return b.score - a.score; });

      // Pares adjacentes na ordenação: cada aluno aparece em no máximo 1 par.
      var pairs = [];
      for (var i = 0; i + 1 < scored.length && pairs.length < MAX_PAIRS; i++) {
        var a = scored[i], b = scored[i + 1];
        if (Math.abs(a.score - b.score) <= PAIR_THRESHOLD) {
          pairs.push({
            alunoA: a.nome, scoreA: a.score,
            alunoB: b.nome, scoreB: b.score,
            gap: Math.round(Math.abs(a.score - b.score) * 1000) / 1000,
            sugestao: 'Evolução proporcional próxima: dupla candidata a mediação conjunta na próxima sessão.'
          });
          i++; // não reaproveita o aluno B em outro par
        }
      }
      return { week: week, pairs: pairs };
    } catch (error) {
      Logger.log("Erro em _closeScorePairs: " + error.message);
      throw error;
    }
  }

  /**
   * Radar acadêmico dos últimos 15 dias. Tenta o Gemini; se indisponível,
   * degrada para um roteiro de busca local (links/termos verificáveis).
   */
  function _academicRadar() {
    try {
      var prompt =
        'Você apoia uma escola pública de anos iniciais (Brasília-DF) que mantém um cineclube pedagógico. ' +
        'Liste de 3 a 5 achados ou tendências publicados na literatura acadêmica nos últimos 15 dias ' +
        '(referência: hoje é ' + _dateKey() + ') sobre cinema-educação, audiovisual na infância ou ' +
        'aprendizagem socioemocional. Para cada item: uma frase do achado e onde procurar (periódico/base). ' +
        'Se não tiver segurança sobre publicações tão recentes, diga isso explicitamente e sugira termos de busca. ' +
        'Não invente autores, títulos nem DOIs. Responda em português, em itens iniciados por "- ".';

      var ai = GeminiService.generateText(prompt);
      if (ai && ai.success && ai.data) {
        return {
          source: 'gemini',
          disclaimer: 'Conteúdo gerado por IA — verifique cada achado na fonte antes de citar.',
          items: String(ai.data).split('\n').filter(function(l) { return l.trim().indexOf('- ') === 0; })
            .map(function(l) { return l.replace(/^\s*-\s*/, ''); }).slice(0, 5)
        };
      }

      // Fallback determinístico: roteiro de busca honesto, sem citações fabricadas.
      return {
        source: 'fallback',
        disclaimer: 'IA indisponível — roteiro de busca local (últimos 15 dias).',
        items: [
          'SciELO (scielo.br): buscar "cinema e educação" filtrando por data de publicação recente.',
          'Google Scholar: "aprendizagem socioemocional" + "anos iniciais", ordenado por data.',
          'ERIC (eric.ed.gov): "film literacy elementary education", filtro "since 2026".',
          'Periódicos CAPES: "audiovisual" + "educação infantil", refinando pelos últimos 30 dias.'
        ]
      };
    } catch (error) {
      Logger.log("Erro em _academicRadar: " + error.message);
      throw error;
    }
  }

  /** Monta (ou recupera do cache) o relatório do dia. */
  function build() {
    try {
      try {
        var cacheKey = 'daily_report_' + _dateKey();
        var cached = Cache_.get(cacheKey);
        if (cached) return JSON.parse(cached);

        var pairing = _closeScorePairs();
        var report = {
          date: _dateKey(),
          week: pairing.week,
          pairs: pairing.pairs,
          pairsEmptyReason: pairing.pairs.length ? null :
            (pairing.week ? 'Nenhum par com evolução próxima (diferença ≤ ' + PAIR_THRESHOLD + ') na semana ' + pairing.week + '.'
                          : 'Ainda não há semanas com avaliação de sexta-feira fechada.'),
          radar: _academicRadar()
        };

        Cache_.set(cacheKey, JSON.stringify(report), CACHE_TTL_SECONDS);
        return report;
      } catch (error) {
        Logger.log("Erro em build: " + error.message);
        throw error;
      }
    } catch (error) {
      Logger.log("Erro em build: " + error.message);
      throw error;
    }
  }

  return { build: build };
})();
