/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : UserDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object (DAO) para a entidade Usuário. Realiza o CRUD completo de professores, estagiários e administradores na aba 'Usuarios' da Google Planilha. Cada usuário possui: ID, Nome, Login, Senha (texto plano), Perfil (Professor/Estagiario/Coordenacao) e E-mail.
 *
 * FUNCIONALIDADES:
 *   - findAll()              : Retorna todos os usuários cadastrados.
 *   - findById(id)           : Retorna um usuário pelo ID único.
 *   - findByLogin(login)     : Busca um usuário pelo campo Login (usado na autenticação).
 *   - create(userData)       : Insere um novo usuário na planilha com ID auto-incrementado.
 *   - update(id, userData)   : Atualiza os dados de um usuário existente.
 *   - delete(id)             : Remove um usuário da planilha pelo ID.
 *   - existsByLogin(login)   : Verifica se um login já está em uso (unicidade).
 *
 * INTEGRAÇÕES:
 *   - Database.gs      : Todas as operações de leitura/escrita na planilha.
 *   - Config.gs        : Nome da aba (SHEET_NAMES.USUARIOS).
 *   - Validation.gs    : Valida os dados antes da inserção/atualização.
 *   - AuditLog.gs      : Registra criação, atualização e exclusão de usuários.
 *   - Auth.gs          : Consome findByLogin() para a autenticação.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Padrão DAO: separa a lógica de acesso a dados da lógica de negócio.
 *   - IDs auto-incrementados baseados no maior ID existente na planilha.
 *   - Senhas em texto plano conforme requisito explícito do projeto.
 *   - Validação de unicidade do login antes de qualquer inserção.
 * ============================================================
 */

// CRUD base via createBaseDao; métodos específicos da entidade abaixo.
var UserDAO = createBaseDao(Config.SHEET_NAMES.USUARIOS, {
  findByLogin: function(login) {
    return Database.findByField(Config.SHEET_NAMES.USUARIOS, 'Login', login)[0] || null;
  },

  /**
   * Localiza um usuário por Login OU Email, normalizando a entrada (trim e
   * comparacao de email case-insensitive). Padrao da frota: o usuario nao
   * precisa saber se cadastrou login ou email — o mesmo campo aceita ambos.
   * @param {string} identifier Login ou email.
   * @returns {object|null}
   */
  findByIdentifier: function(identifier) {
    try {
      var id = String(identifier || '').trim();
      if (!id) return null;
      var byLogin = Database.findByField(Config.SHEET_NAMES.USUARIOS, 'Login', id)[0];
      if (byLogin) return byLogin;
      var lower = id.toLowerCase();
      var matches = Database.getAllRows(Config.SHEET_NAMES.USUARIOS).filter(function(r) {
        return String(r.Email || '').trim().toLowerCase() === lower;
      });
      return matches[0] || null;
    } catch (error) {
      Logger.log("Erro em findByIdentifier: " + error.message);
      throw error;
    }
  },

  // Sobrescreve a base: aceita tanto chaves da planilha (Nome) quanto
  // minusculas usadas pelo SchemaService (nome), e valida unicidade do login.
  create: function(userData) {
    try {
      var login = userData.Login || userData.login || '';
      if (login && this.findByLogin(login)) {
        throw new Error('Login já cadastrado: ' + login);
      }
      return Database.appendRow(Config.SHEET_NAMES.USUARIOS, {
        ID: Utilities.getUuid(),
        Nome: userData.Nome || userData.nome || '',
        Login: login,
        Senha: userData.Senha || userData.senha || '',
        Perfil: userData.Perfil || userData.perfil || 'Professor',
        Email: userData.Email || userData.email || '',
        DataCadastro: new Date().toISOString()
      });
    } catch (error) {
      Logger.log("Erro em create: " + error.message);
      throw error;
    }
  },

  // Lista usuários SEM o campo Senha (nunca expor senha em listagens).
  findAllPublic: function() {
    try {
      return Database.getAllRows(Config.SHEET_NAMES.USUARIOS).map(function(u) {
        var pub = {};
        Object.keys(u).forEach(function(k) { if (k !== 'Senha') pub[k] = u[k]; });
        return pub;
      });
    } catch (error) {
      Logger.log("Erro em findAllPublic: " + error.message);
      throw error;
    }
  }
});
