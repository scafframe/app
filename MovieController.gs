/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : MovieController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador do catálogo de filmes. Valida a inserção de novas obras na curadoria, verificando classificação indicativa (adequação ao público de 8-10 anos), duração máxima para a sessão (40 min) e presença de foco socioemocional definido.
 *
 * FUNCIONALIDADES:
 *   - listMovies(data, token)   : Lista o catálogo, com filtros por eixo e foco.
 *   - createMovie(data, token)  : Adiciona obra com validação de adequação pedagógica.
 *   - updateMovie(data, token)  : Atualiza informações de uma obra.
 *   - deleteMovie(data, token)  : Remove obra da curadoria.
 *   - getAvailableMovies(d, t)  : Retorna filmes disponíveis para a próxima sessão.
 *
 * INTEGRAÇÕES:
 *   - Router.gs     : Registra as rotas 'movie.*'.
 *   - MovieDAO.gs   : Persistência do catálogo.
 *   - Validation.gs : Valida classificação indicativa e duração.
 *   - SessionDAO.gs : Verifica filmes já exibidos recentemente.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via MovieDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Validação de classificação indicativa para proteção do público infantil.
 *   - Filtro de duração máxima de 40 minutos para adequação à sessão.
 *   - Verificação de foco socioemocional como campo obrigatório.
 * ============================================================
 */

Router.register('movie.list',   function(d, t) { return Response.success(MovieDAO.findAll()); });
Router.register('movie.create', function(d, t) { return Response.success(MovieDAO.create(d)); });
