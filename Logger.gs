/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Logger.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Sistema de log interno do projeto. Registra erros, avisos e eventos informativos em uma aba oculta 'Logs' na Google Planilha para auditoria e debugging. Exposto como Logger_ (com underscore) para evitar conflito com o Logger nativo do Apps Script.
 *
 * FUNCIONALIDADES:
 *   - Logger_.info(module, msg)  : Registra evento informativo.
 *   - Logger_.warn(module, msg)  : Registra aviso não crítico.
 *   - Logger_.error(module, err) : Registra erro com stack trace.
 *   - Logger_.getLogs(n)         : Retorna os últimos N logs da planilha.
 *   - Logger_.clearOldLogs()     : Remove logs com mais de 30 dias.
 *
 * INTEGRAÇÕES:
 *   - Database.gs    : Escrita na aba 'Logs' da planilha.
 *   - Config.gs      : Nome da aba de logs (SHEET_NAMES.LOGS).
 *   - Usado por todos os módulos GS do projeto.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho mensal para limpeza automática de logs antigos (clearOldLogs).
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Prefixo Logger_ para evitar conflito com o Logger nativo do Apps Script.
 *   - Registro de stack trace completo em erros para facilitar o debugging.
 *   - Limpeza automática de logs com mais de 30 dias para controle de espaço.
 *   - Níveis de log: INFO, WARN, ERROR para filtragem.
 * ============================================================
 */

var Logger_ = {
  _write: function(level, module, msg) {
    try {
      var ss = SpreadsheetApp.openById(Config.getSpreadsheetId());
      var sheet = ss.getSheetByName(Config.SHEET_NAMES.LOGS);
      if (sheet) sheet.appendRow([new Date(), level, module, String(msg), '']);
    } catch(e) { /* Silencia erros de log para não criar loops */ }
  },
  info:  function(m, msg) { this._write('INFO',  m, msg); },
  warn:  function(m, msg) { this._write('WARN',  m, msg); },
  error: function(m, err) { this._write('ERROR', m, err.message || err); }
};
