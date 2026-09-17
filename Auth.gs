/**
 * Auth.gs — Adaptador de autenticacao do Scafframe.
 *
 * Conformidade: Prompt 18 - Padronização de Autenticação em Frota
 * Aplicado em: 27/06/2026
 *
 * Arquivos em conformidade:
 * - AuthHelpers.gs (11 rotinas padrão reutilizáveis) [CRIADO]
 * - Auth.gs (adaptador principal)
 * - AuthStandardService.gs (contrato de autenticação)
 *
 * Localiza usuarios na aba "Usuarios" e delega sessao, expiracao e migracao de
 * senhas legadas para o contrato comum AuthStandardService.
 */

/** Resolve a planilha principal via getPlanilhaId() (fallback planilha ativa). */
function Auth_getSpreadsheet_() {
  try {
    if (typeof getPlanilhaId === 'function') {
      var id = getPlanilhaId();
      if (id) return SpreadsheetApp.openById(id);
    }
  } catch (e) {}
  return getBoundSpreadsheet_();
}

/** Le a aba de usuarios e devolve cabecalhos + linhas. */
function Auth_getUsersData_() {
  try {
    var possibleNames = ['Usuarios', 'Users', 'Usuários'];
    var sheet = null;
    var ss = Auth_getSpreadsheet_();
  
    if (!ss) return null;
  
    for (var i = 0; i < possibleNames.length; i++) {
      sheet = ss.getSheetByName(possibleNames[i]);
      if (sheet) break;
    }
  
    if (!sheet || sheet.getLastRow() < 2) return null;

    var values = sheet.getDataRange().getValues();
    var headers = values[0].map(function (h) { return String(h || '').trim().toLowerCase(); });
    return { sheet: sheet, values: values, headers: headers };
  } catch (error) {
    Logger.log("Erro em Auth_getUsersData_: " + error.message);
    throw error;
  }
}

/** Retorna o valor em texto plano sem qualquer validação de hash. */
function Auth_normalizarHash_(valor) {
  return String(valor == null ? '' : valor).trim();
}

/** Localiza um usuario para o AuthStandardService. */
function Auth_findUser_(username) {
  try {
    var data = Auth_getUsersData_();
    if (!data) return null;

    var u = String(username || '').trim().toLowerCase();
    var headers = data.headers;
    var iUser = headers.indexOf('username');
    var iPass = headers.indexOf('password');
    var iHash = headers.indexOf('passwordhash');
    var iRole = headers.indexOf('role');
    var iNome = headers.indexOf('nome');
    var iEmail = headers.indexOf('email');
    var iId = headers.indexOf('id');
    var iStatus = headers.indexOf('status');
    if (iUser < 0 || (iPass < 0 && iHash < 0)) return null;

    for (var r = 1; r < data.values.length; r++) {
      var row = data.values[r];
      var rowUser = String(row[iUser] || '').trim().toLowerCase();
      var rowEmail = iEmail >= 0 ? String(row[iEmail] || '').trim().toLowerCase() : '';
      if (rowUser !== u && rowEmail !== u) continue;
    
      // Prioriza a coluna Password; se vazia, usa PasswordHash em texto plano
      var senhaTextoPlano = '';
      if (iPass >= 0 && row[iPass]) {
        senhaTextoPlano = String(row[iPass]);
      } else if (iHash >= 0 && row[iHash]) {
        senhaTextoPlano = String(row[iHash]);
      }
    
      return {
        id: iId >= 0 && row[iId] ? row[iId] : rowUser,
        username: row[iUser],
        name: iNome >= 0 ? row[iNome] : row[iUser],
        email: iEmail >= 0 ? row[iEmail] : '',
        role: iRole >= 0 && row[iRole] ? row[iRole] : 'USER',
        active: iStatus < 0 || String(row[iStatus]).trim().toLowerCase() !== 'inativo',
        password: senhaTextoPlano,
        passwordHash: senhaTextoPlano
      };
    }
    return null;
  } catch (error) {
    Logger.log("Erro em Auth_findUser_: " + error.message);
    throw error;
  }
}

/** Configura o contrato comum para este projeto. */
function Auth_service_() {
  return AuthStandardService.configure({
    sessionKey: 'SCAFFRAME_AUTH_SESSION',
    sessionTtlSeconds: 21600,
    adapters: {
      findUser: Auth_findUser_
    }
  });
}

/**
 * @param {string} username Usuario ou e-mail.
 * @param {string} password Senha.
 * @return {{success:boolean, user?:Object, message?:string}}
 */
function loginWithPassword(username, password) {
  try {
    if (!String(username || '').trim() || !String(password || '')) {
      return { success: false, message: 'Informe usuario e senha.' };
    }
    var result = Auth_service_().login(username, password);
    return result.ok
      ? { success: true, user: result.user }
      : { success: false, message: 'Credenciais invalidas.' };
  } catch (error) {
    Logger.log("Erro em loginWithPassword: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// NOTA: loginWithToken, isAuthenticatedByToken, getSessionUser e logoutWithToken
// estão agora definidos em AuthHelpers.gs para evitar duplicação.
// Estas funções usam ScriptProperties para armazenar sessões.
// ---------------------------------------------------------------------------

/**
 * Remove AUTH_TOK_* legados de ScriptProperties (executar 1x via console).
 */
function cleanupOldAuthTokens_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    var cleaned = 0;
    for (var key in all) {
      if (key.indexOf('AUTH_TOK_') === 0) { props.deleteProperty(key); cleaned++; }
    }
    return { cleaned: cleaned, message: 'Limpeza concluida: ' + cleaned + ' tokens removidos.' };
  } catch (error) {
    Logger.log("Erro em cleanupOldAuthTokens_: " + error.message);
    throw error;
  }
}

/** Estado de sessao (legado). Mantido para retrocompatibilidade. */
function isScafframeAuthenticated() {
  return Auth_service_().isAuthenticated();
}

/** Encerra a sessao (legado). */
function logoutScafframe() {
  return Auth_service_().logout();
}

/** Fachada usada pelo Router e pelos controllers legados. */
var Auth = {
  login: function(username, password) {
    return loginWithToken(username, password);
  },
  logout: function(token) {
    return logoutWithToken(token);
  },
  validateSession: function(token) {
    return isAuthenticatedByToken(token) ? getSessionUser(token) : null;
  },
  getCurrentUser: function(token) {
    return isAuthenticatedByToken(token) ? getSessionUser(token) : null;
  }
};
