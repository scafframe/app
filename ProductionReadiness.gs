/**
 * Diagnóstico somente leitura, para executar pelo proprietário no editor.
 * Não chama setup, não cria contas/abas, não lê respostas nem senhas.
 * O sufixo "_" impede a chamada direta via google.script.run.
 */
function checkScafframeProductionReadiness_() {
  var report = { readyForSmoke: false, checks: [], limitations: [
    'Confere configuração, cabeçalhos e presença de linhas; não homologa o deployment.',
    'Login, vínculo entre cadastros, isolamento e gravação precisam de teste manual com dados fictícios.'
  ] };
  var required = {"Usuarios":["ID","Login","Senha","Perfil"],"Alunos":["ID","Nome","Turma"],"Filmes":["ID","Titulo"],"Sessoes":["ID","FilmeID","Status"],"Questionarios":["ID","SessaoID","AlunoID","FilmeID","RespostasJson","DataPreenchimento","CriticaGemini"]};
  var populated = ["Usuarios","Alunos","Filmes","Sessoes"];
  function check(name, ok, detail) { report.checks.push({ name: name, ok: Boolean(ok), detail: detail }); }
  try {
    var props = PropertiesService.getScriptProperties();
    var id = String(props.getProperty('SPREADSHEETS_ID') || props.getProperty('SPREADSHEET_ID') || '').trim();
    if (!id) {
      check('planilha configurada', false, 'Defina SPREADSHEETS_ID explicitamente antes do piloto.');
    } else {
      // Não usar resolvers que possam autoaprovisionar uma planilha.
      var spreadsheet = SpreadsheetApp.openById(id);
      check('planilha acessível', true, 'Leitura autorizada para o executor do diagnóstico.');
      Object.keys(required).forEach(function(name) {
        var sheet = spreadsheet.getSheetByName(name);
        if (!sheet) { check(name, false, 'Aba ausente. Nenhuma aba foi criada.'); return; }
        var width = sheet.getLastColumn();
        var headers = width ? sheet.getRange(1, 1, 1, width).getValues()[0].map(function(value) { return String(value).trim(); }) : [];
        var missing = required[name].filter(function(header) { return headers.indexOf(header) < 0; });
        var duplicate = headers.some(function(header, index) { return header && headers.indexOf(header) !== index; });
        check(name + ': cabeçalhos', !missing.length && !duplicate,
          missing.length ? 'Faltam: ' + missing.join(', ') : duplicate ? 'Cabeçalhos duplicados.' : 'Cabeçalhos mínimos presentes.');
        if (populated.indexOf(name) >= 0) {
          check(name + ': cadastros', sheet.getLastRow() > 1, 'Necessário ao menos um cadastro válido; conteúdo não inspecionado.');
        }
      });
    }
  } catch (error) {
    // A mensagem do Google pode conter IDs ou detalhes privados: não reproduzir.
    check('leitura da configuração/planilha', false, 'Não foi possível ler. Confira configuração e permissões no editor.');
  }
  report.readyForSmoke = report.checks.length > 0 && report.checks.every(function(item) { return item.ok; });
  Logger.log(JSON.stringify(report));
  return report;
}
