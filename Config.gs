/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Config.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Configurações globais do sistema. Define a variável SPREADSHEETS_ID obtida das variáveis de ambiente (PropertiesService) e mapeia os nomes das abas (Sheets) do banco de dados central. É o único ponto onde o ID da planilha é lido, garantindo fácil manutenção.
 *
 * FUNCIONALIDADES:
 *   - getSpreadsheetId() : Retorna o SPREADSHEETS_ID das propriedades do script.
 *   - SHEET_NAMES        : Objeto com os nomes de todas as abas da planilha.
 *   - APP_CONFIG         : Objeto com parâmetros operacionais (ex: alunos por sessão = 4).
 *   - getConfig(key)     : Retorna um valor de configuração pelo nome da chave.
 *
 * INTEGRAÇÕES:
 *   - PropertiesService : Leitura do SPREADSHEETS_ID e outras variáveis de ambiente.
 *   - Database.gs       : Consome SHEET_NAMES para abrir as abas corretas.
 *   - SheetManager.gs   : Usa SHEET_NAMES para criar abas ausentes na inicialização.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Lido passivamente por todos os outros módulos.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID    : ID da Google Planilha central (obrigatório).
 *   - ADMIN_EMAIL        : E-mail do administrador para notificações críticas.
 *   - MAX_STUDENTS_SESSION: Número máximo de alunos por sessão (padrão: 4).
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Centralização de todas as configurações em um único arquivo.
 *   - Uso de PropertiesService em vez de hardcoding de IDs sensíveis.
 *   - Constantes nomeadas para evitar magic strings espalhadas no código.
 * ============================================================
 */

var Config = (function() {

  var _props = PropertiesService.getScriptProperties();

  var SHEET_NAMES = {
    USUARIOS    : 'Usuarios',
    ALUNOS      : 'Alunos',
    FILMES      : 'Filmes',
    SESSOES     : 'Sessoes',
    RUBRICAS    : 'Rubricas',
    PRESENCAS   : 'Presencas',
    SELECOES    : 'Selecoes',
    NOTIFICACOES: 'Notificacoes',
    LOGS        : 'Logs'
  };

  var APP_CONFIG = {
    MAX_STUDENTS_SESSION : 4,
    EVALUATION_SCALE_MAX : 5,
    PILOT_WEEKS          : 4,
    PROJECT_NAME         : 'Cine Clube Horizontes Animados'
  };

  // Lista de valores que NAO devem ser tratados como ID real (placeholders).
  function _isPlaceholder(id) {
    try {
      if (!id) return true;
      var v = String(id).trim().toUpperCase();
      return v === '' || v.indexOf('COLOQUE') >= 0 || v.indexOf('AQUI') >= 0 ||
             v.indexOf('YOUR_') >= 0 || v === 'SPREADSHEET_ID';
    } catch (error) {
      Logger.log("Erro em _isPlaceholder: " + error.message);
      throw error;
    }
  }

  /**
   * Resolve o ID da planilha central em cascata, NUNCA lancando excecao que
   * derrube doGet(): 1) ScriptProperties; 2) auto-provisao (cria uma planilha
   * nova, ja com a estrutura de abas, e persiste o ID).
   * Padrao da frota: SPREADSHEET_ID placeholder nao pode quebrar a montagem.
   */
  function getSpreadsheetId() {
    try {
      var id = _props.getProperty('SPREADSHEETS_ID') || _props.getProperty('SPREADSHEET_ID');
      var isValid = false;
      if (!_isPlaceholder(id)) {
        try {
          SpreadsheetApp.openById(id);
          isValid = true;
        } catch (e) {
          Logger.log('Planilha ID em ScriptProperties e invalida ou inacessivel: ' + id);
        }
      }

      if (isValid) return id;

      // Auto-provisao: cria a planilha do projeto na primeira execucao.
      try {
        var ss = SpreadsheetApp.create(APP_CONFIG.PROJECT_NAME + ' DB');
        var newId = ss.getId();
        _props.setProperty('SPREADSHEETS_ID', newId);
        try {
          // Estrutura as abas imediatamente, se o SheetManager ja estiver disponivel.
          if (typeof SheetManager !== 'undefined' && SheetManager.initializeSheets) {
            SheetManager.initializeSheets();
          }
        } catch (e) { /* estrutura sera garantida sob demanda pelos DAOs */ }
        return newId;
      } catch (e) {
        Logger.log('Erro ao auto-prover planilha: ' + e.message);
        return null;
      }
    } catch (error) {
      Logger.log("Erro em getSpreadsheetId: " + error.message);
      throw error;
    }
  }

  function getConfig(key) {
    return APP_CONFIG[key] || _props.getProperty(key);
  }

  return { SHEET_NAMES: SHEET_NAMES, APP_CONFIG: APP_CONFIG, getSpreadsheetId: getSpreadsheetId, getConfig: getConfig };
})();
