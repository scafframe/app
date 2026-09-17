/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : ReportController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador de Relatórios. Formata os dados agregados pelo ReportDAO.gs para exibição em gráficos e tabelas no frontend (ReportView.html). Gera o relatório sintético do piloto de 4 semanas conforme previsto no cronograma do projeto.
 *
 * FUNCIONALIDADES:
 *   - getEvolutionReport(data, t) : Relatório de evolução por turma e período.
 *   - getKPISummary(data, token)  : Resumo dos KPIs pedagógicos.
 *   - getPilotReport(data, token) : Relatório completo do ciclo piloto.
 *   - exportReport(data, token)   : Aciona ExportService.gs para gerar PDF.
 *   - getChartData(data, token)   : Dados formatados para Chart.js no frontend.
 *
 * INTEGRAÇÕES:
 *   - Router.gs         : Registra as rotas 'report.*'.
 *   - ReportDAO.gs      : Fonte de dados agregados.
 *   - ExportService.gs  : Geração de PDF para reuniões.
 *   - DriveService.gs   : Salva o PDF gerado no Google Drive.
 *   - RoleManager.gs    : Apenas Coordenação acessa relatórios completos.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via ReportDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Controle de acesso: relatórios completos apenas para Coordenação.
 *   - Dados formatados para Chart.js para visualização no frontend.
 *   - Exportação para PDF integrada ao Google Drive.
 * ============================================================
 */

Router.register('report.kpi',   function(d, t) { return Response.success(ReportDAO.getKPISummary()); });
Router.register('report.pilot', function(d, t) { return Response.success(ReportDAO.getPilotReport()); });
Router.register('report.daily', function(d, t) { return Response.success(DailyReportService.build()); });
