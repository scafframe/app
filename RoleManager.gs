/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : RoleManager.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Gerenciamento de Papéis e Controle de Acesso Baseado em Perfil (RBAC). Define as permissões específicas para cada perfil de usuário: Professor Regente, Estagiário e Coordenação Pedagógica, garantindo que cada usuário acesse apenas as funcionalidades pertinentes ao seu papel.
 *
 * FUNCIONALIDADES:
 *   - can(perfil, action)        : Verifica se um perfil tem permissão para uma ação.
 *   - getPermissions(perfil)     : Retorna todas as permissões de um perfil.
 *   - requireRole(token, role)   : Lança erro se o usuário não tiver o perfil exigido.
 *   - isCoordination(token)      : Verifica se o usuário é da Coordenação.
 *   - isTeacher(token)           : Verifica se o usuário é Professor.
 *   - isIntern(token)            : Verifica se o usuário é Estagiário.
 *
 * INTEGRAÇÕES:
 *   - Auth.gs          : Fornece o token para obter o perfil do usuário.
 *   - Todos os Controllers: Chamam requireRole() para controle de acesso.
 *   - Response.gs      : Retorna unauthorized() quando a permissão é negada.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SESSION_TOKEN : Validado via Auth.gs para obter o perfil do usuário.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Matriz de permissões centralizada para fácil manutenção.
 *   - Perfis: Coordenacao (acesso total), Professor (CRUD de alunos/rubricas), Estagiario (presença/leitura).
 *   - Falha rápida: requireRole() lança exceção imediatamente se não autorizado.
 * ============================================================
 */

var RoleManager = {
  PERMISSIONS: {
    Coordenacao : ['user.*', 'student.*', 'movie.*', 'session.*', 'evaluation.*', 'attendance.*', 'report.*', 'settings.*'],
    Professor   : ['student.*', 'evaluation.*', 'session.list', 'movie.list', 'attendance.list', 'report.kpi'],
    Estagiario  : ['attendance.*', 'student.list', 'session.list', 'movie.list']
  },
  can: function(perfil, action) {
    try {
      var normalizedPerfil = String(perfil || '').trim().toLowerCase();
      var profileKey = Object.keys(this.PERMISSIONS).filter(function(key) {
        return key.toLowerCase() === normalizedPerfil;
      })[0];
      var perms = profileKey ? this.PERMISSIONS[profileKey] : [];
      if (typeof action !== 'string' || !action.trim()) return false;
      return perms.some(function(p) {
        var regex = new RegExp('^' + p.replace('*', '.*') + '$');
        return regex.test(action);
      });
    } catch (error) {
      Logger.log("Erro em can: " + error.message);
      throw error;
    }
  },
  requireRole: function(token, requiredPerfil) {
    var user = Auth.validateSession(token);
    var actualPerfil = user && String(user.perfil || user.role || '').trim().toLowerCase();
    var expectedPerfil = String(requiredPerfil || '').trim().toLowerCase();
    if (!user || !expectedPerfil || actualPerfil !== expectedPerfil) {
      throw new Error('Acesso restrito ao perfil: ' + requiredPerfil);
    }
  }
};
