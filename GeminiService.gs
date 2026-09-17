/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : GeminiService.gs
 * VERSÃO   : 1.1.0
 * ============================================================
 * 
 * DESCRIÇÃO PRINCIPAL:
 *   Módulo de integração com a API do Google Gemini para geração 
 *   de críticas semiautomatizadas. Processa as respostas de um 
 *   questionário de 25 questões sobre o arco narrativo e personagens 
 *   para gerar uma crítica pedagógica estruturada.
 * 
 * FUNCIONALIDADES:
 *   - generateReview(answers, movieTitle) : Gera uma crítica baseada nas respostas.
 *   - getApiKey() : Recupera a chave da API das variáveis de ambiente.
 *   - buildPrompt(answers, movieTitle) : Constrói o prompt estruturado para o Gemini.
 * 
 * INTEGRAÇÕES COM O BACKEND:
 *   - Properties.gs : Para recuperar a GEMINI_API_KEY.
 *   - UrlFetchApp : Para realizar as chamadas à API do Gemini.
 * 
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - GEMINI_API_KEY : Chave de API do Google AI Studio.
 * 
 * BOAS PRÁTICAS APLICADAS:
 *   - Tratamento de erros de cota e rede.
 *   - Prompt engineering focado em pedagogia e cinema.
 *   - Limpeza de caracteres especiais e formatação do output.
 * ============================================================
 */

var GeminiService = {

  MODEL: 'gemini-2.0-flash',
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 600,

  // FROTA-07: modelo lido da property do script, nunca hardcoded; cai no padrão local.
  _model: function() {
    try {
      return PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-2.0-flash';
    } catch (e) {
      LoggerService.info('Scafframe/FROTA-07 property indisponível: ' + e.message);
      return 'gemini-2.0-flash';
    }
  },

  // FROTA-05: bloqueio de rate limit / quota antes do provedor. Lança AiRateLimit/
  // QuotaError (isAiLimit) para o chamador degradar; devolve resposta cacheada se houver.
  _guard: function(useCase, prompt) {
    if (typeof AiRateLimitService === 'undefined') return null;
    var rl = AiRateLimitService.check(useCase, prompt);
    return (rl && rl.dedupHit && rl.cached) ? rl.cached : null;
  },

  // FROTA-06: auditoria mínima da geração (sem prompt nem resposta).
  _audit: function(useCase, model, startMs, status, errorCode) {
    try {
      if (typeof AiAuditLogService === 'undefined') return;
      AiAuditLogService.record({
        useCase: useCase, model: model, durationMs: Date.now() - startMs,
        status: status, fallback: status === 'fallback', errorCode: errorCode || ''
      });
    } catch (_) {}
  },

  /**
   * Gera uma crítica semiautomatizada baseada nas respostas do questionário.
   * Endurecida no padrão da frota: retry com backoff exponencial + jitter para
   * 429/5xx e exceções de rede; 4xx (exceto 429) falha imediatamente; parse
   * defensivo; e fallback determinístico para o recurso nunca quebrar por
   * indisponibilidade do LLM. Retorna envelope StandardReturn.
   */
  generateReview: function(answers, movieTitle) {
    try {
      var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      var prompt = this.buildPrompt(answers, movieTitle);

      if (!apiKey) {
        return StandardReturn.ok(this._fallbackReview(answers, movieTitle), {
          model: 'fallback', attempts: 0, message: 'GEMINI_API_KEY ausente — crítica gerada por fallback determinístico.'
        });
      }

      // FROTA-05: bloqueio de rate limit / quota antes de atingir o provedor.
      try {
        var _cached = this._guard('scafframeReview', prompt);
        if (_cached) return _cached;
      } catch (e) {
        if (e && e.isAiLimit) {
          return StandardReturn.ok(this._fallbackReview(answers, movieTitle), {
            model: 'fallback', attempts: 0, message: 'Limite de geração atingido — crítica por fallback.'
          });
        }
        throw e;
      }

      var _t06 = Date.now();
      var model = this._model();
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model +
                ':generateContent?key=' + apiKey;
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        muteHttpExceptions: true
      };

      var lastError = 'Falha desconhecida.';
      for (var attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
        try {
          var response = UrlFetchApp.fetch(url, options);
          var code = response.getResponseCode();
          var body = response.getContentText();

          if (code >= 200 && code < 300) {
            var json = JsonUtils_.safeParse(body);
            var text = json && json.candidates && json.candidates[0] &&
                       json.candidates[0].content && json.candidates[0].content.parts &&
                       json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text;
            if (text) {
              this._audit('scafframeReview', model, _t06, 'ok', '');
              return StandardReturn.ok(String(text).trim(), { model: model, attempts: attempt });
            }
            lastError = 'Resposta do Gemini sem texto utilizável.';
            break; // resposta 2xx mal-formada não melhora com retry
          }

          // 429 (cota) e 5xx são transitórios → retry; demais 4xx falham já.
          lastError = 'Gemini HTTP ' + code;
          if (code !== 429 && code < 500) { break; }
        } catch (e) {
          lastError = 'Rede: ' + (e.message || e);
        }

        if (attempt < this.MAX_ATTEMPTS) {
          var backoff = this.BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * this.BASE_DELAY_MS);
          Utilities.sleep(backoff);
        }
      }

      LoggerService.error('GeminiService degradou para fallback: ' + lastError);
      this._audit('scafframeReview', model, _t06, 'fallback', String(lastError).slice(0, 60));
      return StandardReturn.ok(this._fallbackReview(answers, movieTitle), {
        model: 'fallback', attempts: this.MAX_ATTEMPTS, message: 'IA indisponível (' + lastError + ') — crítica por fallback.'
      });
    } catch (error) {
      Logger.log("Erro em generateReview: " + error.message);
      throw error;
    }
  },

  /**
   * Fallback determinístico: monta uma crítica estruturada a partir das próprias
   * respostas, sem depender do LLM. Garante que o questionário sempre produza um
   * texto pedagógico utilizável mesmo offline.
   */
  _fallbackReview: function(answers, movieTitle) {
    try {
      var pontos = [];
      for (var k in answers) {
        if (answers.hasOwnProperty(k) && answers[k]) { pontos.push(String(answers[k])); }
      }
      var resumo = pontos.slice(0, 3).join('; ');
      return 'Crítica pedagógica de "' + (movieTitle || 'obra assistida') + '" (gerada localmente):\n\n' +
        'A turma registrou observações sobre o arco narrativo e a evolução dos personagens. ' +
        'Destacam-se os seguintes pontos levantados pelos estudantes: ' + (resumo || 'participação ativa na sessão') + '. ' +
        'Recomenda-se que a mediação retome esses elementos para aprofundar os valores socioemocionais ' +
        'observados, reforçando autorregulação, cooperação, expressão emocional e pertencimento.';
    } catch (error) {
      Logger.log("Erro em _fallbackReview: " + error.message);
      throw error;
    }
  },

  /**
   * Chamada genérica de texto ao Gemini com o mesmo endurecimento de
   * generateReview (retry + backoff + jitter para 429/5xx; 4xx falha já).
   * Não tem fallback próprio: devolve StandardReturn.fail e o chamador
   * decide como degradar (ex.: DailyReportService usa roteiro local).
   */
  generateText: function(prompt) {
    try {
      var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      if (!apiKey) return StandardReturn.fail('GEMINI_API_KEY ausente.');

      // FROTA-05: bloqueio de rate limit / quota antes de atingir o provedor.
      try {
        var _cached = this._guard('scafframeText', prompt);
        if (_cached) return _cached;
      } catch (e) {
        if (e && e.isAiLimit) return StandardReturn.fail('Limite de geração atingido. Tente novamente em instantes.');
        throw e;
      }

      var _t06 = Date.now();
      var model = this._model();
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model +
                ':generateContent?key=' + apiKey;
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        muteHttpExceptions: true
      };

      var lastError = 'Falha desconhecida.';
      for (var attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
        try {
          var response = UrlFetchApp.fetch(url, options);
          var code = response.getResponseCode();
          if (code >= 200 && code < 300) {
            var json = JsonUtils_.safeParse(response.getContentText());
            var text = json && json.candidates && json.candidates[0] &&
                       json.candidates[0].content && json.candidates[0].content.parts &&
                       json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text;
            if (text) {
              this._audit('scafframeText', model, _t06, 'ok', '');
              return StandardReturn.ok(String(text).trim(), { model: model, attempts: attempt });
            }
            lastError = 'Resposta do Gemini sem texto utilizável.';
            break;
          }
          lastError = 'Gemini HTTP ' + code;
          if (code !== 429 && code < 500) break;
        } catch (e) {
          lastError = 'Rede: ' + (e.message || e);
        }
        if (attempt < this.MAX_ATTEMPTS) {
          Utilities.sleep(this.BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * this.BASE_DELAY_MS));
        }
      }
      this._audit('scafframeText', model, _t06, 'fail', String(lastError).slice(0, 60));
      return StandardReturn.fail(lastError);
    } catch (error) {
      Logger.log("Erro em generateText: " + error.message);
      throw error;
    }
  },

  /**
   * Roteiro de discussão socrática para a roda de conversa do cineclube
   * (ensino dialógico): 4 perguntas abertas e progressivas — observação,
   * interpretação, conexão com a vida e avaliação — geradas a partir das
   * mesmas respostas do questionário. Reusa generateText (já endurecido);
   * sem IA, degrada para um roteiro socrático local. Nunca lança.
   *
   * @param {Object} answers Respostas do questionário (q1..q25).
   * @param {string} movieTitle Título do filme.
   * @return {{movieTitle:string, questions:Array<string>, source:string, model:string}}
   */
  generateDiscussionGuide: function(answers, movieTitle) {
    try {
      var pontos = [];
      for (var k in answers) {
        if (answers.hasOwnProperty(k) && answers[k]) { pontos.push(String(answers[k])); }
      }
      var prompt = 'Você é uma mediadora de cineclube escolar (ensino fundamental). ' +
        'A turma assistiu "' + (movieTitle || 'o filme da sessão') + '" e respondeu um questionário; ' +
        'alguns registros: ' + pontos.slice(0, 8).join('; ') + '.\n\n' +
        'Crie EXATAMENTE 4 perguntas socráticas para a roda de conversa, em português do Brasil, ' +
        'uma por linha, cada linha começando com "- ", nesta progressão:\n' +
        '1) OBSERVAÇÃO (o que vimos na tela);\n' +
        '2) INTERPRETAÇÃO (por que o personagem agiu assim);\n' +
        '3) CONEXÃO (quando algo parecido aconteceu com você);\n' +
        '4) AVALIAÇÃO (o que faríamos diferente e por quê).\n' +
        'Perguntas abertas, sem resposta certa, sem julgamento, adequadas à idade. ' +
        'Não numere, não use markdown além do "- " inicial.';

      var questions = [];
      var source = 'local';
      var ai = this.generateText(prompt);
      if (ai && ai.success && ai.data) {
        questions = String(ai.data).split('\n')
          .filter(function(l) { return l.trim().indexOf('- ') === 0; })
          .map(function(l) { return l.replace(/^\s*-\s*/, '').trim(); })
          .filter(function(l) { return l.length > 0; })
          .slice(0, 4);
        if (questions.length > 0) { source = 'gemini'; }
      }

      if (questions.length === 0) {
        // Roteiro socrático determinístico: mantém a roda de conversa viável offline.
        var titulo = movieTitle || 'o filme';
        questions = [
          'O que mais chamou a atenção de vocês em ' + titulo + '? Descrevam a cena.',
          'Por que vocês acham que o personagem principal agiu daquele jeito no momento mais difícil?',
          'Alguma situação do filme lembrou algo que já aconteceu com vocês ou com alguém que conhecem?',
          'Se vocês pudessem mudar uma escolha de um personagem, qual seria e por quê?'
        ];
      }

      return {
        movieTitle: movieTitle || '',
        questions: questions,
        source: source,
        model: source === 'gemini' ? this.MODEL : 'local'
      };
    } catch (error) {
      Logger.log("Erro em generateDiscussionGuide: " + error.message);
      throw error;
    }
  },

  /**
   * Constrói o prompt para o Gemini baseado nas 25 respostas.
   */
  buildPrompt: function(answers, movieTitle) {
    var prompt = "Você é um crítico de cinema especializado em educação infantil. ";
    prompt += "Com base nas seguintes 25 respostas sobre o filme '" + movieTitle + "', ";
    prompt += "escreva uma crítica pedagógica de 3 parágrafos focada no arco narrativo e na evolução dos personagens.\n\n";
    
    prompt += "Respostas do questionário:\n";
    for (var key in answers) {
      prompt += "- " + key + ": " + answers[key] + "\n";
    }
    
    prompt += "\nA crítica deve ser encorajadora e destacar os valores socioemocionais observados.";
    return prompt;
  }
};
