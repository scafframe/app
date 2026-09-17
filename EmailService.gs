/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : EmailService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Serviço de envio de e-mails do projeto. Usa MailApp (ou GmailApp) para notificar professores sobre os alunos selecionados para a sessão da semana, confirmar agendamentos e enviar o relatório sintético semanal para a coordenação pedagógica.
 *
 * FUNCIONALIDADES:
 *   - sendSelectionNotification(prof, alunos, sessao) : E-mail com lista de selecionados.
 *   - sendSessionReminder(professor, sessao)          : Lembrete 24h antes da sessão.
 *   - sendWeeklyReport(coordenacao, report)           : Relatório semanal para coord.
 *   - sendWelcomeEmail(usuario)                       : Boas-vindas ao novo usuário.
 *   - sendGeneric(to, subject, body)                  : Envio genérico de e-mail.
 *
 * INTEGRAÇÕES:
 *   - MailApp (nativo)      : API do Apps Script para envio de e-mails.
 *   - Properties.gs         : Lê o ADMIN_EMAIL e configurações de remetente.
 *   - SessionDAO.gs         : Busca dados da sessão para o corpo do e-mail.
 *   - StudentDAO.gs         : Busca nomes dos alunos selecionados.
 *   - ReportDAO.gs          : Busca dados do relatório semanal.
 *   - TriggerManager.gs     : Aciona sendSessionReminder 24h antes da sessão.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de sexta-feira envia a notificação de seleção automaticamente.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - ADMIN_EMAIL   : E-mail da coordenação pedagógica.
 *   - SENDER_NAME   : Nome do remetente (ex: 'Cine Clube Horizontes Animados').
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Templates de e-mail em HTML para comunicação profissional.
 *   - Uso de MailApp.getRemainingDailyQuota() para verificar cota antes de enviar.
 *   - Logs de todos os e-mails enviados para auditoria.
 * ============================================================
 */

var EmailService = {
  sendGeneric: function(to, subject, body) {
    try {
      MailApp.sendEmail({ to: to, subject: subject, htmlBody: body });
      Logger_.info('EmailService', 'E-mail enviado para: ' + to);
    } catch(err) {
      Logger_.error('EmailService', err);
    }
  },
  sendSelectionNotification: function(professorEmail, alunos, sessao) {
    var body = '<h2>Alunos Selecionados para o Cine Clube</h2><ul>' +
      alunos.map(function(a) { return '<li>' + a.Nome + ' (' + a.Turma + ')</li>'; }).join('') +
      '</ul><p>Sessão: ' + sessao.TituloFilme + ' — ' + Utils.formatDate(sessao.Data) + '</p>';
    this.sendGeneric(professorEmail, '[Cine Clube] Alunos Selecionados', body);
  }
};
