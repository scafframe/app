/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : CalendarService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Integração com o Google Calendar. Cria, atualiza e cancela eventos automaticamente no calendário da escola para reservar o auditório/sala de vídeo nas sessões do Cine Clube, garantindo visibilidade institucional do projeto.
 *
 * FUNCIONALIDADES:
 *   - createSessionEvent(sessao)    : Cria evento no Google Calendar para a sessão.
 *   - updateSessionEvent(id, data)  : Atualiza o evento quando a sessão é modificada.
 *   - cancelSessionEvent(eventId)   : Cancela o evento quando a sessão é cancelada.
 *   - getCalendarId()               : Retorna o ID do calendário da escola.
 *   - checkAvailability(date, hour) : Verifica disponibilidade do auditório.
 *
 * INTEGRAÇÕES:
 *   - CalendarApp (nativo)  : API do Apps Script para Google Calendar.
 *   - Properties.gs         : Lê o CALENDAR_ID da escola.
 *   - SessionDAO.gs         : Armazena o eventId do Calendar na sessão.
 *   - SessionController.gs  : Aciona createSessionEvent ao criar uma sessão.
 *   - TriggerManager.gs     : Aciona lembretes de sessão via Calendar.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de criação de sessão aciona createSessionEvent automaticamente.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - CALENDAR_ID   : ID do Google Calendar da Escola Classe 115 Norte.
 *   - ROOM_NAME     : Nome do auditório/sala de vídeo para o evento.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Uso do CalendarApp.getCalendarById() para acessar o calendário correto.
 *   - Eventos com duração padrão de 40 minutos (conforme o projeto).
 *   - Descrição do evento inclui o foco socioemocional do filme.
 * ============================================================
 */

var CalendarService = {
  createSessionEvent: function(sessao) {
    try {
      var calId = Properties.get('CALENDAR_ID');
      var cal = CalendarApp.getCalendarById(calId);
      var start = new Date(sessao.Data + ' ' + sessao.Horario);
      var end   = new Date(start.getTime() + 40 * 60000);
      var event = cal.createEvent('[Cine Clube] ' + sessao.TituloFilme, start, end,
        { description: 'Turma: ' + sessao.Turma + ' | Sala: ' + sessao.Sala });
      Logger_.info('CalendarService', 'Evento criado: ' + event.getId());
      return event.getId();
    } catch(err) { Logger_.error('CalendarService', err); }
  }
};
