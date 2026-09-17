/**
 * 00_SpreadsheetResolver.gs
 *
 * Resolvedor robusto de planilha para contexto WEBAPP/standalone.
 *
 * Em deployment de web app (nao container-bound), SpreadsheetApp
 * .getActiveSpreadsheet() retorna null, e qualquer null.getSheetByName(...)
 * derruba o fluxo — inclusive o login ("Cannot read properties of null
 * (reading 'getSheetByName')").
 *
 * Ordem de resolucao:
 *   1. getSpreadsheetId() — funcao de Config local, se existir
 *   2. getProjectSpreadsheet() — alias de projeto, se existir
 *   3. CONFIG.SPREADSHEET_ID / Config.SPREADSHEET_ID — objeto global
 *   4. Script Properties: SPREADSHEETS_ID ou SPREADSHEET_ID
 *   5. SpreadsheetApp.getActiveSpreadsheet() — container-bound fallback
 *   6. Lanca erro explicativo: "defina SPREADSHEET_ID nas Script Properties"
 *
 * O prefixo "00_" garante avaliacao antecipada no concatenador do Apps Script.
 */
function getBoundSpreadsheet_() {
  try {
    try {
      // 1. Funcao getSpreadsheetId() definida em Config/ConfigService local
      if (typeof getSpreadsheetId === 'function') {
        try {
          var idFromFunction = getSpreadsheetId();
          if (idFromFunction) {
            var ss = SpreadsheetApp.openById(idFromFunction);
            if (ss) return ss;
          }
        } catch (e) {
          Logger.log('Erro ao abrir planilha por getSpreadsheetId(): ' + e.message);
        }
      }

      // 2. Usar o modulo Config se disponivel e tiver getSpreadsheetId
      if (typeof Config !== 'undefined' && Config && typeof Config.getSpreadsheetId === 'function') {
        try {
          var idFromConfig = Config.getSpreadsheetId();
          if (idFromConfig) {
            var ss = SpreadsheetApp.openById(idFromConfig);
            if (ss) return ss;
          }
        } catch (e) {
          Logger.log('Erro ao abrir planilha por Config.getSpreadsheetId(): ' + e.message);
        }
      }

      // 3. Alias getProjectSpreadsheet() definido em Config local
      if (typeof getProjectSpreadsheet === 'function') {
        try {
          var ssFromProject = getProjectSpreadsheet();
          if (ssFromProject) return ssFromProject;
        } catch (e) {
          Logger.log('Erro ao obter planilha por getProjectSpreadsheet(): ' + e.message);
        }
      }

      // 4. Objeto CONFIG ou Config com SPREADSHEET_ID
      if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.SPREADSHEET_ID) {
        try {
          var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
          if (ss) return ss;
        } catch (e) {}
      }
      if (typeof Config !== 'undefined' && Config && Config.SPREADSHEET_ID) {
        try {
          var ss = SpreadsheetApp.openById(Config.SPREADSHEET_ID);
          if (ss) return ss;
        } catch (e) {}
      }

      // 5. Script Properties (suporta ambos os aliases da frota)
      try {
        var props = PropertiesService.getScriptProperties();
        var id = props.getProperty('SPREADSHEETS_ID') || props.getProperty('SPREADSHEET_ID');
        if (id && id.indexOf('YOUR_') === -1 && id.trim() !== '') {
          var ss = SpreadsheetApp.openById(id);
          if (ss) return ss;
        }
      } catch (e) {
        Logger.log('Erro ao obter planilha de ScriptProperties: ' + e.message);
      }

      // 6. Container-bound fallback (funciona no editor / container)
      try {
        var active = SpreadsheetApp.getActiveSpreadsheet();
        if (active) return active;
      } catch (e) {}

      // 7. Nenhuma fonte disponivel — erro explicativo
      throw new Error(
        'Planilha indisponivel: defina a Script Property SPREADSHEET_ID ' +
        '(ou SPREADSHEETS_ID) no editor do Apps Script > Projeto > Propriedades.'
      );
    } catch (error) {
      Logger.log("Erro em getBoundSpreadsheet_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getBoundSpreadsheet_: " + error.message);
    throw error;
  }
}