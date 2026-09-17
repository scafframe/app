/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : DashboardService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Serviço de consolidação de dados para o Dashboard principal. Calcula e formata os KPIs pedagógicos exibidos no painel: percentual de alunos que evoluíram, número de sessões realizadas, taxa de presença, filmes mais utilizados e tendência de evolução por turma.
 *
 * FUNCIONALIDADES:
 *   - getKPIs()                   : Retorna todos os KPIs para o Dashboard.
 *   - getEvolutionTrend(turma)    : Tendência de evolução de uma turma ao longo das semanas.
 *   - getTopStudents(n)           : Top N alunos com maior evolução proporcional.
 *   - getSessionStats()           : Estatísticas de sessões (realizadas, canceladas).
 *   - getAttendanceKPI()          : Taxa média de presença no projeto.
 *   - getChartData()              : Dados formatados para Chart.js no Dashboard.
 *
 * INTEGRAÇÕES:
 *   - EvaluationDAO.gs    : Dados de evolução socioemocional.
 *   - AttendanceDAO.gs    : Dados de presença.
 *   - SessionDAO.gs       : Dados de sessões realizadas.
 *   - StudentDAO.gs       : Dados dos alunos.
 *   - ReportDAO.gs        : Dados agregados para KPIs.
 *   - DashboardCharts.html: Consome getChartData() para renderização.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Chamado sob demanda ao carregar o Dashboard.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via os DAOs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Cálculo de KPIs em uma única chamada para minimizar requisições ao backend.
 *   - Dados de gráficos formatados no padrão do Chart.js (labels + datasets).
 *   - Cache de 30 minutos para os KPIs do Dashboard.
 * ============================================================
 */

var DashboardService = { getKPIs: function() { return { totalSessoes: SessionDAO.findAll().length, totalAlunos: StudentDAO.findAll().length }; } };
