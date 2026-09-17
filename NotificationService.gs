/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : NotificationService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Sistema de notificações in-app. Registra alertas e avisos para os usuários na aba 'Notificacoes' da planilha, que são exibidos no sino de notificações do frontend (NotificationList.html) ao fazer login.
 *
 * FUNCIONALIDADES:
 *   - create(userId, message)    : Cria uma nova notificação para um usuário.
 *   - getUnread(userId)          : Retorna notificações não lidas de um usuário.
 *   - markAsRead(notifId)        : Marca uma notificação como lida.
 *   - markAllAsRead(userId)      : Marca todas as notificações de um usuário como lidas.
 *   - getCount(userId)           : Retorna o número de notificações não lidas.
 *   - notifyAllTeachers(message) : Cria notificação para todos os professores.
 *
 * INTEGRAÇÕES:
 *   - Database.gs      : Operações CRUD na aba 'Notificacoes'.
 *   - Config.gs        : Nome da aba (SHEET_NAMES.NOTIFICACOES).
 *   - UserDAO.gs       : Busca todos os professores para notificação em massa.
 *   - JobScheduler.gs  : Cria notificações automáticas na sexta-feira.
 *   - NotificationList.html: Consome as notificações via google.script.run.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Criação automática de notificações pelo JobScheduler.gs toda sexta-feira.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Notificações persistidas na planilha para sobreviver a recarregamentos.
 *   - Contador de não lidas para o badge do sino no frontend.
 *   - Notificação em massa para todos os professores em eventos globais.
 * ============================================================
 */

var NotificationService = { create: function(userId, msg) { Database.appendRow(Config.SHEET_NAMES.NOTIFICACOES, { ID: Utilities.getUuid(), UsuarioID: userId, Mensagem: msg, Lida: false, DataCriacao: new Date() }); } };
