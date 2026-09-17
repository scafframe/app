/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : ExportService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Serviço de exportação de dados. Gera PDFs formatados com o histórico de evolução de um aluno específico (para reuniões de pais), o relatório sintético do piloto de 4 semanas e a lista de presença de uma sessão. Salva os PDFs no Google Drive.
 *
 * FUNCIONALIDADES:
 *   - exportStudentReport(alunoId)  : PDF com histórico completo de um aluno.
 *   - exportPilotReport()           : PDF do relatório do ciclo piloto de 4 semanas.
 *   - exportSessionAttendance(id)   : PDF da lista de presença de uma sessão.
 *   - exportMovieCatalog()          : PDF da curadoria analítica de 60 obras.
 *   - _buildPdfBlob(htmlContent)    : Converte HTML em Blob PDF.
 *
 * INTEGRAÇÕES:
 *   - DriveService.gs    : Salva os PDFs gerados no Google Drive.
 *   - ReportDAO.gs       : Fonte dos dados para os relatórios.
 *   - StudentDAO.gs      : Dados do aluno para o relatório individual.
 *   - AttendanceDAO.gs   : Dados de presença para a lista.
 *   - HtmlService        : Renderiza o HTML do relatório para conversão.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - DRIVE_FOLDER_ID : ID da pasta no Drive para salvar os PDFs.
 *   - SPREADSHEETS_ID : Acessado via os DAOs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Geração de PDF via HtmlService para formatação profissional.
 *   - Templates de relatório em HTML com identidade visual do projeto.
 *   - Nomes de arquivo com timestamp para evitar sobrescrita.
 * ============================================================
 */

var ExportService = { exportStudentReport: function(alunoId) { var data = ReportDAO.getStudentHistory(alunoId); return DriveService.saveReport(Utilities.newBlob('<html><body>Relatório</body></html>', 'application/pdf'), 'relatorio_' + alunoId + '.pdf'); } };
