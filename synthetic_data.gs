/**
 * Dados sintéticos — Scafframe
 * Gerado em 2026-06-21 01:10:44 por generate_synthetic_data_all_projects.py
 *
 * Execute populateSyntheticData() PELO EDITOR do Apps Script para popular
 * as abas de domínio com ~30 registros cada (valida os gráficos do notebook).
 * Idempotente: limpa as linhas de dados antes de reinserir.
 *
 * NÃO define onOpen() — para não colidir com o menu real do projeto.
 */

function populateSyntheticData() {
  try {
    try {
      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var results = [];

        // Filmes
        try {
          var sheet_Filmes = ss.getSheetByName('Filmes') || ss.insertSheet('Filmes');
          if (sheet_Filmes.getLastRow() > 1) {
            sheet_Filmes.deleteRows(2, sheet_Filmes.getLastRow() - 1);
          }
          var h_sheet_Filmes = ["ID", "Titulo", "Genero", "AnoLancamento", "Diretor", "DuracaoMin", "Classificacao", "Status"];
          sheet_Filmes.getRange(1, 1, 1, h_sheet_Filmes.length).setValues([h_sheet_Filmes]);
          var d_sheet_Filmes = [
            ["FIL-0001", "Introdução", "Rock", 2021, "Henrique Alves", 124, "10", "ativo"],
            ["FIL-0002", "Introdução", "Clássica", 2013, "Ana Silva", 166, "12", "ativo"],
            ["FIL-0003", "Prática", "Tropicália", 2010, "Ana Silva", 199, "12", "ativo"],
            ["FIL-0004", "Introdução", "MPB", 2010, "Ana Silva", 30, "10", "ativo"],
            ["FIL-0005", "Avaliação", "Clássica", 2011, "Eduarda Lima", 328, "16", "ativo"],
            ["FIL-0006", "Revisão", "Pop", 2012, "Bruno Santos", 503, "16", "ativo"],
            ["FIL-0007", "Conceitos", "Tropicália", 2024, "Bruno Santos", 538, "16", "ativo"],
            ["FIL-0008", "Prática", "MPB", 2020, "Felipe Costa", 196, "14", "inativo"],
            ["FIL-0009", "Prática", "Samba", 2017, "Eduarda Lima", 440, "14", "ativo"],
            ["FIL-0010", "Prática", "Tropicália", 2018, "Diego Souza", 276, "14", "ativo"],
            ["FIL-0011", "Conceitos", "MPB", 2010, "Ana Silva", 150, "10", "ativo"],
            ["FIL-0012", "Avaliação", "Rock", 2012, "Bruno Santos", 319, "12", "ativo"],
            ["FIL-0013", "Revisão", "Rock", 2023, "Gabriela Rocha", 449, "Livre", "ativo"],
            ["FIL-0014", "Conceitos", "Clássica", 2009, "Felipe Costa", 190, "14", "ativo"],
            ["FIL-0015", "Prática", "MPB", 2009, "Ana Silva", 288, "14", "ativo"],
            ["FIL-0016", "Avaliação", "Clássica", 2020, "Felipe Costa", 490, "10", "ativo"],
            ["FIL-0017", "Avaliação", "Tropicália", 2018, "Carla Oliveira", 37, "10", "ativo"],
            ["FIL-0018", "Avaliação", "MPB", 2023, "Felipe Costa", 181, "Livre", "ativo"],
            ["FIL-0019", "Conceitos", "Samba", 2023, "Eduarda Lima", 237, "10", "inativo"],
            ["FIL-0020", "Introdução", "MPB", 2019, "Felipe Costa", 411, "12", "ativo"],
            ["FIL-0021", "Introdução", "Clássica", 2024, "Diego Souza", 246, "10", "ativo"],
            ["FIL-0022", "Revisão", "Pop", 2024, "Gabriela Rocha", 571, "16", "ativo"],
            ["FIL-0023", "Avaliação", "Tropicália", 2009, "Henrique Alves", 590, "12", "inativo"],
            ["FIL-0024", "Introdução", "Pop", 2018, "Ana Silva", 447, "16", "ativo"],
            ["FIL-0025", "Avaliação", "Clássica", 2022, "Diego Souza", 352, "16", "ativo"],
            ["FIL-0026", "Avaliação", "Pop", 2017, "Ana Silva", 264, "16", "ativo"],
            ["FIL-0027", "Avaliação", "Pop", 2008, "Diego Souza", 71, "10", "inativo"],
            ["FIL-0028", "Conceitos", "Clássica", 2008, "Gabriela Rocha", 78, "Livre", "ativo"],
            ["FIL-0029", "Revisão", "Samba", 2021, "Ana Silva", 543, "12", "ativo"],
            ["FIL-0030", "Avaliação", "Samba", 2014, "Eduarda Lima", 148, "10", "inativo"]
          ];
          sheet_Filmes.getRange(2, 1, d_sheet_Filmes.length, h_sheet_Filmes.length).setValues(d_sheet_Filmes);
          results.push('OK Filmes: ' + d_sheet_Filmes.length + ' registros');
        } catch (e) {
          results.push('ERRO Filmes: ' + e.message);
        }

        // AvaliacoesFilme
        try {
          var sheet_AvaliacoesFilme = ss.getSheetByName('AvaliacoesFilme') || ss.insertSheet('AvaliacoesFilme');
          if (sheet_AvaliacoesFilme.getLastRow() > 1) {
            sheet_AvaliacoesFilme.deleteRows(2, sheet_AvaliacoesFilme.getLastRow() - 1);
          }
          var h_sheet_AvaliacoesFilme = ["ID", "Data", "Filme", "Nota", "Recomenda", "Comentario", "Status"];
          sheet_AvaliacoesFilme.getRange(1, 1, 1, h_sheet_AvaliacoesFilme.length).setValues([h_sheet_AvaliacoesFilme]);
          var d_sheet_AvaliacoesFilme = [
            ["AVA-0001", "2026-05-17 01:10:44", "C", 5.9, true, "B", "ativo"],
            ["AVA-0002", "2026-05-09 01:10:44", "D", 5.4, true, "B", "inativo"],
            ["AVA-0003", "2026-06-20 01:10:44", "A", 5.6, true, "C", "ativo"],
            ["AVA-0004", "2026-05-10 01:10:44", "C", 8.4, false, "B", "inativo"],
            ["AVA-0005", "2026-06-08 01:10:44", "B", 6.8, false, "C", "ativo"],
            ["AVA-0006", "2026-06-17 01:10:44", "B", 9.4, true, "B", "ativo"],
            ["AVA-0007", "2026-05-03 01:10:44", "C", 9.8, true, "D", "ativo"],
            ["AVA-0008", "2026-06-14 01:10:44", "D", 7.6, false, "C", "ativo"],
            ["AVA-0009", "2026-05-30 01:10:44", "A", 6.8, false, "B", "ativo"],
            ["AVA-0010", "2026-05-06 01:10:44", "A", 9.6, true, "A", "ativo"],
            ["AVA-0011", "2026-06-11 01:10:44", "B", 6.7, true, "B", "inativo"],
            ["AVA-0012", "2026-04-23 01:10:44", "C", 5.1, false, "D", "ativo"],
            ["AVA-0013", "2026-05-01 01:10:44", "D", 6.1, true, "D", "ativo"],
            ["AVA-0014", "2026-05-05 01:10:44", "B", 9.2, false, "D", "inativo"],
            ["AVA-0015", "2026-06-01 01:10:44", "C", 6.0, true, "A", "inativo"],
            ["AVA-0016", "2026-06-09 01:10:44", "A", 7.9, true, "C", "ativo"],
            ["AVA-0017", "2026-05-26 01:10:44", "A", 9.8, false, "A", "ativo"],
            ["AVA-0018", "2026-04-29 01:10:44", "A", 8.0, true, "A", "ativo"],
            ["AVA-0019", "2026-05-22 01:10:44", "D", 7.8, true, "C", "ativo"],
            ["AVA-0020", "2026-05-13 01:10:44", "A", 8.9, true, "C", "ativo"],
            ["AVA-0021", "2026-06-02 01:10:44", "D", 6.5, true, "A", "ativo"],
            ["AVA-0022", "2026-05-10 01:10:44", "B", 8.5, false, "B", "ativo"],
            ["AVA-0023", "2026-05-31 01:10:44", "D", 9.9, true, "C", "ativo"],
            ["AVA-0024", "2026-05-21 01:10:44", "C", 8.7, false, "A", "ativo"],
            ["AVA-0025", "2026-06-03 01:10:44", "C", 5.9, true, "B", "ativo"],
            ["AVA-0026", "2026-05-29 01:10:44", "A", 5.5, false, "C", "ativo"],
            ["AVA-0027", "2026-04-26 01:10:44", "A", 5.9, true, "A", "ativo"],
            ["AVA-0028", "2026-06-18 01:10:44", "C", 6.6, true, "A", "ativo"],
            ["AVA-0029", "2026-04-24 01:10:44", "C", 5.5, false, "A", "ativo"],
            ["AVA-0030", "2026-04-24 01:10:44", "D", 5.5, false, "C", "ativo"]
          ];
          sheet_AvaliacoesFilme.getRange(2, 1, d_sheet_AvaliacoesFilme.length, h_sheet_AvaliacoesFilme.length).setValues(d_sheet_AvaliacoesFilme);
          results.push('OK AvaliacoesFilme: ' + d_sheet_AvaliacoesFilme.length + ' registros');
        } catch (e) {
          results.push('ERRO AvaliacoesFilme: ' + e.message);
        }

        // Sessoes
        try {
          var sheet_Sessoes = ss.getSheetByName('Sessoes') || ss.insertSheet('Sessoes');
          if (sheet_Sessoes.getLastRow() > 1) {
            sheet_Sessoes.deleteRows(2, sheet_Sessoes.getLastRow() - 1);
          }
          var h_sheet_Sessoes = ["ID", "Data", "Turma", "Filme", "Presentes", "DuracaoMin", "Status"];
          sheet_Sessoes.getRange(1, 1, 1, h_sheet_Sessoes.length).setValues([h_sheet_Sessoes]);
          var d_sheet_Sessoes = [
            ["SES-0001", "2026-06-13 01:10:44", "1A", "A", 38, 34, "ativo"],
            ["SES-0002", "2026-04-25 01:10:44", "4A", "A", 31, 399, "inativo"],
            ["SES-0003", "2026-05-18 01:10:44", "1A", "C", 11, 283, "ativo"],
            ["SES-0004", "2026-05-31 01:10:44", "2B", "B", 37, 136, "ativo"],
            ["SES-0005", "2026-05-22 01:10:44", "2B", "B", 11, 551, "ativo"],
            ["SES-0006", "2026-05-26 01:10:44", "1A", "C", 37, 222, "inativo"],
            ["SES-0007", "2026-05-17 01:10:44", "2B", "A", 28, 246, "inativo"],
            ["SES-0008", "2026-06-09 01:10:44", "5B", "C", 23, 169, "inativo"],
            ["SES-0009", "2026-05-15 01:10:44", "4A", "C", 18, 285, "ativo"],
            ["SES-0010", "2026-05-07 01:10:44", "4A", "C", 39, 539, "ativo"],
            ["SES-0011", "2026-06-14 01:10:44", "4A", "B", 17, 161, "ativo"],
            ["SES-0012", "2026-04-30 01:10:44", "5B", "A", 16, 165, "ativo"],
            ["SES-0013", "2026-06-07 01:10:44", "2B", "A", 5, 434, "ativo"],
            ["SES-0014", "2026-06-08 01:10:44", "3C", "A", 37, 32, "ativo"],
            ["SES-0015", "2026-05-07 01:10:44", "1A", "A", 27, 139, "ativo"],
            ["SES-0016", "2026-06-08 01:10:44", "4A", "B", 10, 156, "ativo"],
            ["SES-0017", "2026-06-01 01:10:44", "4A", "D", 34, 311, "inativo"],
            ["SES-0018", "2026-05-10 01:10:44", "2B", "B", 14, 428, "ativo"],
            ["SES-0019", "2026-06-09 01:10:44", "2B", "D", 32, 310, "inativo"],
            ["SES-0020", "2026-06-18 01:10:44", "3C", "A", 28, 504, "ativo"],
            ["SES-0021", "2026-06-18 01:10:44", "1A", "D", 34, 326, "ativo"],
            ["SES-0022", "2026-05-26 01:10:44", "1A", "C", 10, 320, "ativo"],
            ["SES-0023", "2026-06-10 01:10:44", "4A", "A", 31, 572, "ativo"],
            ["SES-0024", "2026-05-15 01:10:44", "4A", "C", 20, 259, "inativo"],
            ["SES-0025", "2026-06-09 01:10:44", "3C", "D", 25, 306, "ativo"],
            ["SES-0026", "2026-05-22 01:10:44", "2B", "D", 9, 47, "ativo"],
            ["SES-0027", "2026-05-11 01:10:44", "4A", "D", 15, 594, "ativo"],
            ["SES-0028", "2026-06-14 01:10:44", "3C", "C", 34, 290, "ativo"],
            ["SES-0029", "2026-06-04 01:10:44", "5B", "C", 26, 50, "ativo"],
            ["SES-0030", "2026-05-16 01:10:44", "1A", "B", 19, 288, "ativo"]
          ];
          sheet_Sessoes.getRange(2, 1, d_sheet_Sessoes.length, h_sheet_Sessoes.length).setValues(d_sheet_Sessoes);
          results.push('OK Sessoes: ' + d_sheet_Sessoes.length + ' registros');
        } catch (e) {
          results.push('ERRO Sessoes: ' + e.message);
        }

        // Presencas
        try {
          var sheet_Presencas = ss.getSheetByName('Presencas') || ss.insertSheet('Presencas');
          if (sheet_Presencas.getLastRow() > 1) {
            sheet_Presencas.deleteRows(2, sheet_Presencas.getLastRow() - 1);
          }
          var h_sheet_Presencas = ["ID", "Data", "Turma", "Presentes", "Status", "Justificativa"];
          sheet_Presencas.getRange(1, 1, 1, h_sheet_Presencas.length).setValues([h_sheet_Presencas]);
          var d_sheet_Presencas = [
            ["PRE-0001", "2026-05-04 01:10:44", "5B", 40, "ativo", "D"],
            ["PRE-0002", "2026-05-19 01:10:44", "1A", 10, "ativo", "C"],
            ["PRE-0003", "2026-05-03 01:10:44", "5B", 27, "ativo", "A"],
            ["PRE-0004", "2026-05-22 01:10:44", "2B", 12, "ativo", "C"],
            ["PRE-0005", "2026-05-06 01:10:44", "4A", 17, "ativo", "B"],
            ["PRE-0006", "2026-05-12 01:10:44", "4A", 39, "ativo", "A"],
            ["PRE-0007", "2026-05-28 01:10:44", "4A", 40, "ativo", "B"],
            ["PRE-0008", "2026-06-01 01:10:44", "1A", 22, "ativo", "D"],
            ["PRE-0009", "2026-05-04 01:10:44", "2B", 35, "ativo", "D"],
            ["PRE-0010", "2026-06-07 01:10:44", "4A", 36, "ativo", "A"],
            ["PRE-0011", "2026-06-15 01:10:44", "5B", 9, "ativo", "D"],
            ["PRE-0012", "2026-04-27 01:10:44", "1A", 14, "inativo", "D"],
            ["PRE-0013", "2026-05-18 01:10:44", "1A", 7, "inativo", "B"],
            ["PRE-0014", "2026-06-07 01:10:44", "2B", 14, "ativo", "A"],
            ["PRE-0015", "2026-06-19 01:10:44", "3C", 1, "inativo", "A"],
            ["PRE-0016", "2026-06-04 01:10:44", "5B", 29, "ativo", "A"],
            ["PRE-0017", "2026-05-31 01:10:44", "2B", 40, "ativo", "A"],
            ["PRE-0018", "2026-05-01 01:10:44", "3C", 39, "ativo", "A"],
            ["PRE-0019", "2026-05-22 01:10:44", "3C", 35, "ativo", "A"],
            ["PRE-0020", "2026-04-23 01:10:44", "4A", 14, "inativo", "C"],
            ["PRE-0021", "2026-06-15 01:10:44", "1A", 33, "ativo", "C"],
            ["PRE-0022", "2026-06-21 01:10:44", "4A", 23, "ativo", "D"],
            ["PRE-0023", "2026-05-17 01:10:44", "2B", 2, "ativo", "A"],
            ["PRE-0024", "2026-05-10 01:10:44", "3C", 13, "ativo", "B"],
            ["PRE-0025", "2026-06-07 01:10:44", "1A", 12, "ativo", "B"],
            ["PRE-0026", "2026-06-09 01:10:44", "2B", 19, "inativo", "A"],
            ["PRE-0027", "2026-05-10 01:10:44", "4A", 15, "ativo", "A"],
            ["PRE-0028", "2026-06-14 01:10:44", "2B", 24, "ativo", "D"],
            ["PRE-0029", "2026-06-12 01:10:44", "1A", 11, "inativo", "D"],
            ["PRE-0030", "2026-06-21 01:10:44", "2B", 24, "ativo", "B"]
          ];
          sheet_Presencas.getRange(2, 1, d_sheet_Presencas.length, h_sheet_Presencas.length).setValues(d_sheet_Presencas);
          results.push('OK Presencas: ' + d_sheet_Presencas.length + ' registros');
        } catch (e) {
          results.push('ERRO Presencas: ' + e.message);
        }

        // Mural
        try {
          var sheet_Mural = ss.getSheetByName('Mural') || ss.insertSheet('Mural');
          if (sheet_Mural.getLastRow() > 1) {
            sheet_Mural.deleteRows(2, sheet_Mural.getLastRow() - 1);
          }
          var h_sheet_Mural = ["ID", "Data", "Autor", "Tipo", "Curtidas", "Status"];
          sheet_Mural.getRange(1, 1, 1, h_sheet_Mural.length).setValues([h_sheet_Mural]);
          var d_sheet_Mural = [
            ["MUR-0001", "2026-05-09 01:10:44", "Gabriela Rocha", "tipo_a", 43, "ativo"],
            ["MUR-0002", "2026-06-08 01:10:44", "Bruno Santos", "tipo_a", 212, "ativo"],
            ["MUR-0003", "2026-05-25 01:10:44", "Diego Souza", "tipo_c", 416, "ativo"],
            ["MUR-0004", "2026-06-04 01:10:44", "Felipe Costa", "tipo_b", 80, "ativo"],
            ["MUR-0005", "2026-05-24 01:10:44", "Gabriela Rocha", "tipo_a", 312, "inativo"],
            ["MUR-0006", "2026-06-04 01:10:44", "Felipe Costa", "tipo_b", 310, "ativo"],
            ["MUR-0007", "2026-04-23 01:10:44", "Ana Silva", "tipo_a", 207, "ativo"],
            ["MUR-0008", "2026-05-28 01:10:44", "Henrique Alves", "tipo_a", 447, "ativo"],
            ["MUR-0009", "2026-05-02 01:10:44", "Carla Oliveira", "tipo_a", 117, "ativo"],
            ["MUR-0010", "2026-05-17 01:10:44", "Henrique Alves", "tipo_b", 465, "ativo"],
            ["MUR-0011", "2026-06-18 01:10:44", "Carla Oliveira", "tipo_c", 448, "ativo"],
            ["MUR-0012", "2026-05-01 01:10:44", "Carla Oliveira", "tipo_a", 464, "ativo"],
            ["MUR-0013", "2026-05-20 01:10:44", "Bruno Santos", "tipo_a", 275, "ativo"],
            ["MUR-0014", "2026-05-31 01:10:44", "Bruno Santos", "tipo_b", 133, "ativo"],
            ["MUR-0015", "2026-05-17 01:10:44", "Carla Oliveira", "tipo_a", 22, "inativo"],
            ["MUR-0016", "2026-05-21 01:10:44", "Diego Souza", "tipo_a", 411, "ativo"],
            ["MUR-0017", "2026-05-08 01:10:44", "Bruno Santos", "tipo_c", 75, "inativo"],
            ["MUR-0018", "2026-06-17 01:10:44", "Gabriela Rocha", "tipo_c", 324, "ativo"],
            ["MUR-0019", "2026-05-05 01:10:44", "Felipe Costa", "tipo_b", 84, "ativo"],
            ["MUR-0020", "2026-04-28 01:10:44", "Felipe Costa", "tipo_a", 16, "ativo"],
            ["MUR-0021", "2026-05-03 01:10:44", "Ana Silva", "tipo_c", 353, "ativo"],
            ["MUR-0022", "2026-04-27 01:10:44", "Ana Silva", "tipo_a", 165, "ativo"],
            ["MUR-0023", "2026-05-04 01:10:44", "Bruno Santos", "tipo_a", 352, "ativo"],
            ["MUR-0024", "2026-05-22 01:10:44", "Bruno Santos", "tipo_b", 401, "ativo"],
            ["MUR-0025", "2026-06-18 01:10:44", "Ana Silva", "tipo_c", 76, "ativo"],
            ["MUR-0026", "2026-06-01 01:10:44", "Gabriela Rocha", "tipo_c", 58, "ativo"],
            ["MUR-0027", "2026-05-04 01:10:44", "Eduarda Lima", "tipo_b", 81, "ativo"],
            ["MUR-0028", "2026-05-18 01:10:44", "Carla Oliveira", "tipo_c", 342, "inativo"],
            ["MUR-0029", "2026-06-03 01:10:44", "Henrique Alves", "tipo_c", 466, "ativo"],
            ["MUR-0030", "2026-06-12 01:10:44", "Carla Oliveira", "tipo_b", 256, "ativo"]
          ];
          sheet_Mural.getRange(2, 1, d_sheet_Mural.length, h_sheet_Mural.length).setValues(d_sheet_Mural);
          results.push('OK Mural: ' + d_sheet_Mural.length + ' registros');
        } catch (e) {
          results.push('ERRO Mural: ' + e.message);
        }

        Logger.log(results.join('\n'));
        return results;
      } catch (error) {
        Logger.log("Erro em populateSyntheticData: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em populateSyntheticData: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em populateSyntheticData: " + error.message);
    throw error;
  }
}
