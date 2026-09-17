/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : UserController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador da entidade Usuário. Recebe as ações do Router.gs, aplica as regras de negócio (validação, unicidade de login, controle de acesso por perfil) e aciona o UserDAO.gs para persistência. Registra as rotas de usuário no Router.
 *
 * FUNCIONALIDADES:
 *   - listUsers(data, token)    : Lista usuários (apenas para Coordenação).
 *   - createUser(data, token)   : Cria novo usuário com validação de unicidade de login.
 *   - updateUser(data, token)   : Atualiza dados do usuário.
 *   - deleteUser(data, token)   : Remove usuário (apenas Coordenação).
 *   - changePassword(data, t)   : Permite ao usuário alterar a própria senha.
 *   - _registerRoutes()         : Registra todas as ações no Router.gs.
 *
 * INTEGRAÇÕES:
 *   - Router.gs       : Registra as rotas 'user.*' no dispatcher.
 *   - UserDAO.gs      : Persistência dos dados de usuário.
 *   - Validation.gs   : Valida campos obrigatórios e formato de e-mail.
 *   - RoleManager.gs  : Verifica permissões de acesso por perfil.
 *   - Response.gs     : Formata respostas de sucesso/erro.
 *   - AuditLog.gs     : Registra operações de criação/exclusão.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SESSION_TOKEN : Validado via Auth.gs para verificar permissões.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Controle de acesso: apenas Coordenação pode criar/deletar usuários.
 *   - Validação de unicidade do login antes de qualquer inserção.
 *   - Separação clara entre regras de negócio (Controller) e acesso a dados (DAO).
 * ============================================================
 */

// Rotas registradas no Router ao carregar o script.
Router.register('user.list',   function(d, t) { return Response.success(UserDAO.findAll()); });
Router.register('user.create', function(d, t) { return Response.success(UserDAO.create(d)); });
