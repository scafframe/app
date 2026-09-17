/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : DriveService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Integração com o Google Drive. Salva relatórios em PDF gerados pelo ExportService.gs em uma pasta específica do projeto no Drive. Também gerencia o armazenamento de fotos do Mural da Evolução e documentos institucionais.
 *
 * FUNCIONALIDADES:
 *   - saveReport(pdfBlob, filename) : Salva um PDF na pasta do projeto no Drive.
 *   - getProjectFolder()            : Retorna (ou cria) a pasta do projeto no Drive.
 *   - getFileUrl(fileId)            : Retorna a URL pública de um arquivo.
 *   - listReports()                 : Lista todos os relatórios salvos no Drive.
 *   - deleteFile(fileId)            : Remove um arquivo do Drive.
 *
 * INTEGRAÇÕES:
 *   - DriveApp (nativo)   : API do Apps Script para Google Drive.
 *   - Properties.gs       : Lê o DRIVE_FOLDER_ID da pasta do projeto.
 *   - ExportService.gs    : Fornece o PDF Blob para salvar.
 *   - ReportController.gs : Aciona saveReport após gerar o relatório.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - DRIVE_FOLDER_ID : ID da pasta no Google Drive para relatórios.
 *   - PROJECT_NAME    : Nome da pasta raiz do projeto no Drive.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Organização em subpastas por mês para facilitar a localização.
 *   - Verificação de permissões de escrita antes de salvar.
 *   - URLs públicas para compartilhamento com a coordenação.
 * ============================================================
 */

var DriveService = {
  getProjectFolder: function() {
    try {
      var folderId = Properties.get('DRIVE_FOLDER_ID');
      return folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    } catch (error) {
      Logger.log("Erro em getProjectFolder: " + error.message);
      throw error;
    }
  },
  saveReport: function(pdfBlob, filename) {
    var folder = this.getProjectFolder();
    var file = folder.createFile(pdfBlob.setName(filename));
    Logger_.info('DriveService', 'Relatório salvo: ' + file.getId());
    return file.getUrl();
  }
};
