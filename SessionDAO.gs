/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : SessionDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object para as sessões do Cine Clube. Registra cada sessão realizada ou agendada na aba 'Sessoes'. Campos: ID, Data, Horario, FilmeID, TituloFilme, Turma, Sala, Status (Agendada/Realizada/Cancelada), ObservacoesLogistica.
 *
 * FUNCIONALIDADES:
 *   - findAll()              : Lista todas as sessões (passadas e futuras).
 *   - findUpcoming()         : Retorna sessões agendadas para os próximos 7 dias.
 *   - findByTurma(turma)     : Histórico de sessões de uma turma específica.
 *   - findByWeek(weekStart)  : Sessões de uma semana específica.
 *   - create(sessionData)    : Agenda uma nova sessão.
 *   - updateStatus(id, s)    : Atualiza o status da sessão (Realizada/Cancelada).
 *   - checkConflict(data, h) : Verifica conflito de horário na sala/auditório.
 *
 * INTEGRAÇÕES:
 *   - Database.gs         : Operações CRUD na aba 'Sessoes'.
 *   - Config.gs           : Nome da aba (SHEET_NAMES.SESSOES).
 *   - MovieDAO.gs         : Busca o título do filme pelo FilmeID.
 *   - CalendarService.gs  : Cria/atualiza evento no Google Calendar.
 *   - EmailService.gs     : Envia notificação de sessão agendada.
 *   - JobScheduler.gs     : Consulta sessões futuras para o agendamento automático.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Consulta por TriggerManager.gs toda sexta-feira para preparar a semana seguinte.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Verificação de conflito de horário para evitar sobreposição de sessões.
 *   - Campo Status para rastrear sessões canceladas e reagendadas.
 *   - Integração com Google Calendar para visibilidade institucional.
 * ============================================================
 */

var SessionDAO = createBaseDao(Config.SHEET_NAMES.SESSOES, {
  findUpcoming: function() {
    return Database.getAllRows(Config.SHEET_NAMES.SESSOES).filter(function(s) {
      return s.Status === 'Agendada';
    });
  }
});
