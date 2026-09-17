/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ARQUIVO  : BaseDAO.gs
 * ============================================================
 *
 * Factory de DAO generico orientado pelo Database.gs. Os DAOs do projeto eram
 * one-liners com um unico metodo especifico, enquanto os Controllers chamavam
 * findAll/create/update/remove inexistentes. Esta base fecha o contrato:
 *
 *   var FooDAO = createBaseDao('NomeDaAba', { metodoEspecifico: fn, ... });
 *
 * Fornece: findAll, findById, create (gera ID uuid e carimba a coluna de data
 * de criacao quando existir), update e remove. Metodos especificos passados em
 * `extras` sao mesclados por cima (podem sobrescrever a base).
 */
function createBaseDao(sheetName, extras) {
  try {
    try {
      var DATE_COLUMNS = ['DataCadastro', 'DataRegistro', 'DataCriacao', 'DataSelecao', 'DataPreenchimento'];

      var base = {
        sheetName: sheetName,

        findAll: function() {
          return Database.getAllRows(sheetName);
        },

        findById: function(id) {
          return Database.findById(sheetName, id);
        },

        create: function(data) {
          var record = {};
          var headers = Database.getHeaders(sheetName);
          headers.forEach(function(h) {
            if (data && Object.prototype.hasOwnProperty.call(data, h)) record[h] = data[h];
          });
          if (headers.indexOf('ID') !== -1 && !record.ID) record.ID = Utilities.getUuid();
          DATE_COLUMNS.forEach(function(col) {
            if (headers.indexOf(col) !== -1 && !record[col]) record[col] = new Date().toISOString();
          });
          return Database.appendRow(sheetName, record);
        },

        update: function(id, patch) {
          return Database.updateRow(sheetName, id, patch || {});
        },

        remove: function(id) {
          try {
            return Database.deleteRow(sheetName, id);
          } catch (error) {
            Logger.log("Erro em remove: " + error.message);
            throw error;
          }
        }
      };

      if (extras) {
        Object.keys(extras).forEach(function(k) { base[k] = extras[k]; });
      }
      return base;
    } catch (error) {
      Logger.log("Erro em createBaseDao: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em createBaseDao: " + error.message);
    throw error;
  }
}
