/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Rubric.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Fonte única de verdade pedagógica da Rubrica de Evolução
 *   Socioemocional. Define os 4 indicadores, os descritores
 *   comportamentais observáveis de cada nível (1–5) e as
 *   sugestões de mediação formativa por nível. Centralizar os
 *   descritores garante que professores diferentes avaliem com
 *   os mesmos critérios (confiabilidade entre avaliadores) e que
 *   formulário, relatórios e feedback usem a mesma linguagem.
 *
 * FUNCIONALIDADES:
 *   - Rubric.INDICATORS          : Indicadores com descritores 1–5 e mediações.
 *   - Rubric.evolution(b, f)     : Evolução proporcional ao espaço de crescimento.
 *   - Rubric.aggregateEvolution(): Média da evolução nos 4 indicadores.
 *   - Rubric.feedbackFor(ind, n) : Sugestão de mediação formativa.
 *
 * FUNDAMENTO PEDAGÓGICO:
 *   - BNCC, Competências Gerais 8 (autoconhecimento e autocuidado)
 *     e 9 (empatia e cooperação).
 *   - Avaliação formativa: a rubrica descreve comportamentos
 *     observáveis, não julga a criança. Foco na trajetória
 *     individual (base → sexta), não em comparação absoluta.
 *   - Evolução proporcional ao "espaço de crescimento":
 *     (final − base) / (5 − base). Um aluno que sai de 2 para 4
 *     evoluiu mais (0,67) do que um que sai de 4 para 5 (1,0 do
 *     pouco que faltava) em termos absolutos — a fórmula valoriza
 *     o esforço de quem partiu de mais longe sem punir quem já
 *     está no teto (base 5 mantida conta como 1,0).
 *
 * INTEGRAÇÕES:
 *   - EvaluationDAO.gs       : Usa evolution() ao fechar a sexta-feira.
 *   - EvaluationController.gs: Expõe 'evaluation.rubric' ao frontend.
 *   - SelectionAlgorithm.gs  : Consome EvolucaoProporcional persistida.
 * ============================================================
 */

var Rubric = (function() {

  var INDICATORS = [
    {
      key: 'Autorregulacao',
      label: 'Autorregulação',
      question: 'Como o aluno lida com frustrações, esperas e regras durante as atividades?',
      levels: {
        1: 'Reage com explosões frequentes (gritos, choro intenso, agressividade) diante de frustrações mínimas; precisa de intervenção direta do adulto.',
        2: 'Demonstra irritação visível e dificuldade de esperar a vez, mas aceita a mediação do adulto na maioria das vezes.',
        3: 'Consegue se acalmar com lembretes pontuais; tolera pequenas frustrações sem interromper a atividade.',
        4: 'Usa estratégias próprias para se acalmar (respirar, afastar-se, pedir ajuda) na maior parte das situações.',
        5: 'Autorregula-se de forma autônoma e chega a ajudar colegas a se acalmarem.'
      },
      mediation: {
        1: 'Combine com o aluno um "sinal de pausa" antes da sessão e antecipe verbalmente o que vai acontecer.',
        2: 'Nomeie a emoção junto com o aluno ("percebo que você ficou bravo") e ofereça duas opções de saída.',
        3: 'Reduza gradualmente os lembretes; celebre quando ele se acalmar sozinho.',
        4: 'Peça que ele verbalize qual estratégia usou — isso consolida o repertório.',
        5: 'Convide-o a apoiar um colega como "parceiro de calma" nas sessões.'
      }
    },
    {
      key: 'Cooperacao',
      label: 'Cooperação',
      question: 'Como o aluno participa de tarefas em grupo e divide materiais e espaços?',
      levels: {
        1: 'Recusa-se a trabalhar em grupo; disputa materiais e desfaz produções dos colegas.',
        2: 'Participa do grupo apenas com mediação constante do adulto; divide materiais com resistência.',
        3: 'Coopera quando a tarefa lhe interessa; divide materiais quando solicitado.',
        4: 'Coopera espontaneamente na maioria das atividades; oferece ajuda quando percebe necessidade.',
        5: 'Articula o grupo: distribui tarefas, inclui colegas isolados e media pequenos conflitos.'
      },
      mediation: {
        1: 'Comece com duplas (não grupos grandes) e tarefas com papéis bem definidos.',
        2: 'Atribua a ele um papel concreto e valorizado no grupo (ex.: guardião do material).',
        3: 'Varie os agrupamentos para que coopere também fora do círculo de afinidade.',
        4: 'Proponha que ensine algo que domina a um colega.',
        5: 'Dê a ele protagonismo na organização da sessão do cineclube.'
      }
    },
    {
      key: 'ExpressaoEmocional',
      label: 'Expressão Emocional',
      question: 'O aluno reconhece e comunica o que sente, verbalmente ou por outras linguagens?',
      levels: {
        1: 'Não nomeia o que sente; expressa-se quase só por atos (retraimento total ou descarga motora).',
        2: 'Identifica emoções básicas (feliz/triste/bravo) quando o adulto pergunta diretamente.',
        3: 'Nomeia espontaneamente emoções básicas em si mesmo; começa a reconhecê-las nos personagens dos filmes.',
        4: 'Diferencia emoções mais sutis (vergonha, ciúme, orgulho) e relaciona o que sente com o que causou.',
        5: 'Expressa-se com riqueza por fala, desenho ou escrita e reconhece emoções nos colegas, reagindo com empatia.'
      },
      mediation: {
        1: 'Use os personagens do filme como ponte: "como será que ele se sentiu?" antes de perguntar sobre o próprio aluno.',
        2: 'Ofereça vocabulário ampliado (cartas de emoções) nas rodas de conversa pós-sessão.',
        3: 'Peça exemplos: "quando foi que você sentiu isso também?"',
        4: 'Proponha registros no Mural ligando cena do filme → emoção → experiência própria.',
        5: 'Convide-o a abrir a roda de conversa relatando uma emoção da semana.'
      }
    },
    {
      key: 'Pertencimento',
      label: 'Pertencimento',
      question: 'O aluno se sente parte do grupo e do projeto? Busca os colegas e os espaços coletivos?',
      levels: {
        1: 'Isola-se sistematicamente; evita a sessão ou diz que "não é dele" participar.',
        2: 'Fica no espaço coletivo, mas na periferia; participa só quando chamado nominalmente.',
        3: 'Participa das atividades coletivas e demonstra interesse pelo cineclube (pergunta pela próxima sessão).',
        4: 'Busca os colegas espontaneamente; refere-se ao grupo como "a gente"; contribui no Mural sem ser solicitado.',
        5: 'Identifica-se com o projeto, convida e acolhe colegas e propõe ideias para as sessões.'
      },
      mediation: {
        1: 'Garanta um vínculo de referência: um adulto ou colega que o receba pelo nome na chegada.',
        2: 'Dê funções visíveis e de baixa exposição (apagar a luz, entregar as fichas).',
        3: 'Registre publicamente (Mural) uma contribuição dele por semana.',
        4: 'Inclua-o em decisões do grupo, como a votação do próximo filme.',
        5: 'Torne-o anfitrião de novos participantes do cineclube.'
      }
    }
  ];

  var SCALE_MAX = Config.APP_CONFIG.EVALUATION_SCALE_MAX; // 5

  /**
   * Evolução proporcional ao espaço de crescimento de UM indicador.
   * (final − base) / (SCALE_MAX − base). Base no teto: manteve = 1, caiu = negativo proporcional.
   * Retorna número em [-1, 1].
   */
  function evolution(base, final_) {
    try {
      base = Number(base); final_ = Number(final_);
      if (!base || !final_) return 0;
      if (base >= SCALE_MAX) return final_ >= SCALE_MAX ? 1 : (final_ - base) / (SCALE_MAX - 1);
      return (final_ - base) / (SCALE_MAX - base);
    } catch (error) {
      Logger.log("Erro em evolution: " + error.message);
      throw error;
    }
  }

  /** Média da evolução nos 4 indicadores. record = linha da aba Rubricas. */
  function aggregateEvolution(record) {
    try {
      var sum = 0;
      INDICATORS.forEach(function(ind) {
        sum += evolution(record[ind.key + '_Base'], record[ind.key + '_Sexta']);
      });
      return Math.round((sum / INDICATORS.length) * 1000) / 1000;
    } catch (error) {
      Logger.log("Erro em aggregateEvolution: " + error.message);
      throw error;
    }
  }

  /** Sugestão de mediação formativa para um indicador/nível. */
  function feedbackFor(indicatorKey, level) {
    try {
      var ind = INDICATORS.filter(function(i) { return i.key === indicatorKey; })[0];
      return (ind && ind.mediation[level]) || '';
    } catch (error) {
      Logger.log("Erro em feedbackFor: " + error.message);
      throw error;
    }
  }

  return {
    INDICATORS: INDICATORS,
    SCALE_MAX: SCALE_MAX,
    evolution: evolution,
    aggregateEvolution: aggregateEvolution,
    feedbackFor: feedbackFor
  };
})();
