/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Database.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Conexão central com a Google Spreadsheet. Usa o SPREADSHEETS_ID (obtido via Config.gs) para abrir a planilha e fornece métodos genéricos de leitura e escrita em lote (getValues/setValues). É a única camada que toca diretamente o SpreadsheetApp, garantindo que todos os DAOs usem a mesma conexão.
 *
 * FUNCIONALIDADES:
 *   - getSheet(sheetName)         : Retorna o objeto Sheet pelo nome da aba.
 *   - getAllRows(sheetName)        : Retorna todos os dados como array de objetos JSON.
 *   - appendRow(sheetName, data)  : Adiciona uma nova linha com os dados fornecidos.
 *   - updateRow(sheetName, id, d) : Atualiza a linha cujo ID corresponde ao fornecido.
 *   - deleteRow(sheetName, id)    : Remove a linha cujo ID corresponde ao fornecido.
 *   - findById(sheetName, id)     : Retorna uma linha específica pelo ID.
 *   - findByField(sheet, f, val)  : Busca linhas por um campo e valor específicos.
 *   - getHeaders(sheetName)       : Retorna os cabeçalhos da primeira linha da aba.
 *
 * INTEGRAÇÕES:
 *   - SpreadsheetApp    : API nativa do Apps Script para manipulação de planilhas.
 *   - Config.gs         : Fornece o SPREADSHEETS_ID e os nomes das abas.
 *   - Cache.gs          : Resultados de getAllRows são cacheados para performance.
 *   - Logger.gs         : Registra operações de escrita para auditoria.
 *   - SheetManager.gs   : Garante que as abas existam antes de Database.gs acessá-las.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Chamado por todos os arquivos DAO.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : ID da Google Planilha, lido via Config.getSpreadsheetId().
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Padrão Repository: todos os DAOs dependem exclusivamente deste módulo.
 *   - Leitura em lote com getValues() para minimizar chamadas à API do Sheets.
 *   - Mapeamento automático de cabeçalhos para chaves de objeto (row-to-JSON).
 *   - Invalidação do cache após operações de escrita para consistência dos dados.
 * ============================================================
 */

var Database = (function() {

  var _ss = null;

  function _getSpreadsheet() {
    try {
      if (!_ss) _ss = SpreadsheetApp.openById(Config.getSpreadsheetId());
      return _ss;
    } catch (error) {
      Logger.log("Erro em _getSpreadsheet: " + error.message);
      throw error;
    }
  }

  function getSheet(sheetName) {
    return _getSpreadsheet().getSheetByName(sheetName);
  }

  function getHeaders(sheetName) {
    try {
      var sheet = getSheet(sheetName);
      return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    } catch (error) {
      Logger.log("Erro em getHeaders: " + error.message);
      throw error;
    }
  }

  function getAllRows(sheetName) {
    try {
      try {
        var sheet = getSheet(sheetName);
        var data  = sheet.getDataRange().getValues();
        var headers = data[0];
        return data.slice(1).map(function(row) {
          var obj = {};
          headers.forEach(function(h, i) { obj[h] = row[i]; });
          return obj;
        });
      } catch (error) {
        Logger.log("Erro em getAllRows: " + error.message);
        throw error;
      }
    } catch (error) {
      Logger.log("Erro em getAllRows: " + error.message);
      throw error;
    }
  }

  function appendRow(sheetName, data) {
    try {
      var lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        var sheet = getSheet(sheetName);
        var headers = getHeaders(sheetName);
        var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ''; });
        sheet.appendRow(row);
        Cache_.invalidate(sheetName);
        var obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        return obj;
      } finally {
        lock.releaseLock();
      }
    } catch (error) {
      Logger.log("Erro em appendRow: " + error.message);
      throw error;
    }
  }

  function findByField(sheetName, field, value) {
    try {
      return getAllRows(sheetName).filter(function(r) { return r[field] == value; });
    } catch (error) {
      Logger.log("Erro em findByField: " + error.message);
      throw error;
    }
  }

  function findById(sheetName, id) {
    return findByField(sheetName, 'ID', id)[0] || null;
  }

  // Localiza o numero da linha (1-based na planilha) de um ID. Retorna -1 se ausente.
  function _rowIndexOf(sheetName, id) {
    try {
      try {
        var sheet = getSheet(sheetName);
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var idCol = headers.indexOf('ID');
        if (idCol === -1) return -1;
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][idCol]) === String(id)) return i + 1;
        }
        return -1;
      } catch (error) {
        Logger.log("Erro em _rowIndexOf: " + error.message);
        throw error;
      }
    } catch (error) {
      Logger.log("Erro em _rowIndexOf: " + error.message);
      throw error;
    }
  }

  function updateRow(sheetName, id, patch) {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var rowIndex = _rowIndexOf(sheetName, id);
      if (rowIndex === -1) return null;
      var sheet = getSheet(sheetName);
      var headers = getHeaders(sheetName);
      var current = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      var updated = headers.map(function(h, i) {
        return Object.prototype.hasOwnProperty.call(patch, h) ? patch[h] : current[i];
      });
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updated]);
      Cache_.invalidate(sheetName);
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = updated[i]; });
      return obj;
    } finally {
      lock.releaseLock();
    }
  }

  function deleteRow(sheetName, id) {
    try {
      var lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        var rowIndex = _rowIndexOf(sheetName, id);
        if (rowIndex === -1) return false;
        getSheet(sheetName).deleteRow(rowIndex);
        Cache_.invalidate(sheetName);
        return true;
      } finally {
        lock.releaseLock();
      }
    } catch (error) {
      Logger.log("Erro em deleteRow: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  }

  return {
    getSheet: getSheet, getHeaders: getHeaders, getAllRows: getAllRows,
    appendRow: appendRow, findByField: findByField, findById: findById,
    updateRow: updateRow, deleteRow: deleteRow
  };
})();
