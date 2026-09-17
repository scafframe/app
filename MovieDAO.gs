/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : MovieDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object para o catálogo de filmes da Curadoria Analítica. Gerencia as 60 obras selecionadas (curtas e longas de animação sem diálogos) na aba 'Filmes'. Campos: ID, Titulo, Ano, Eixo, Duracao, FocoSocioemocional, Tecnica, Origem, FonteAcesso, ClassificacaoIndicativa, ObservacoesMediacao.
 *
 * FUNCIONALIDADES:
 *   - findAll()              : Retorna o catálogo completo de 60 obras.
 *   - findByEixo(eixo)       : Filtra por eixo (Disney/Pixar, Reflexão, Nacional, Festivais).
 *   - findByFoco(foco)       : Busca filmes por foco socioemocional (ex: 'empatia').
 *   - findByDuracao(max)     : Filtra obras com duração adequada à sessão (≤40 min).
 *   - findById(id)           : Retorna um filme pelo ID.
 *   - create(movieData)      : Adiciona uma nova obra à curadoria.
 *   - update(id, data)       : Atualiza informações de uma obra.
 *   - findAvailable()        : Retorna filmes não exibidos nas últimas 4 semanas.
 *
 * INTEGRAÇÕES:
 *   - Database.gs       : Operações CRUD na aba 'Filmes'.
 *   - Config.gs         : Nome da aba (SHEET_NAMES.FILMES).
 *   - SessionDAO.gs     : Verifica quais filmes já foram exibidos recentemente.
 *   - MovieController.gs: Valida classificação indicativa antes de inserir.
 *   - Cache.gs          : O catálogo completo é cacheado por 1 hora.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Curadoria de 60 obras cobrindo 4 eixos pedagógicos conforme o relatório.
 *   - Campo ClassificacaoIndicativa para garantir adequação ao público de 8-10 anos.
 *   - Campo FonteAcesso para evitar improviso na hora da sessão.
 *   - Cache de 1 hora para o catálogo, dado que raramente muda.
 * ============================================================
 */

// CRUD base via createBaseDao; busca por eixo pedagógico.
var MovieDAO = createBaseDao(Config.SHEET_NAMES.FILMES, {
  findByEixo: function(eixo) { return Database.findByField(Config.SHEET_NAMES.FILMES, 'Eixo', eixo); }
});
