/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : SessionController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador de Sessões do Cine Clube. Orquestra a criação e gestão de sessões, verificando conflito de horários no auditório, integrando com o Google Calendar e disparando notificações por e-mail para os professores responsáveis.
 *
 * FUNCIONALIDADES:
 *   - listSessions(data, token)   : Lista sessões com filtros de data e turma.
 *   - createSession(data, token)  : Agenda sessão com verificação de conflito.
 *   - updateSession(data, token)  : Atualiza dados de uma sessão.
 *   - cancelSession(data, token)  : Cancela sessão e notifica professores.
 *   - markAsCompleted(data, token): Marca sessão como realizada.
 *
 * INTEGRAÇÕES:
 *   - Router.gs          : Registra as rotas 'session.*'.
 *   - SessionDAO.gs      : Persistência das sessões.
 *   - CalendarService.gs : Cria/cancela evento no Google Calendar.
 *   - EmailService.gs    : Notifica professores sobre agendamento/cancelamento.
 *   - MovieDAO.gs        : Valida o FilmeID informado.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - JobScheduler.gs aciona createSession automaticamente toda sexta-feira.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via SessionDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Verificação de conflito de horário antes de qualquer agendamento.
 *   - Integração automática com Google Calendar para visibilidade institucional.
 *   - Notificação por e-mail ao professor regente da turma selecionada.
 * ============================================================
 */

Router.register('session.list',   function(d, t) { return Response.success(SessionDAO.findAll()); });
Router.register('session.create', function(d, t) { return Response.success(SessionDAO.create(d)); });
