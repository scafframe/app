/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados (Scafframe)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : FeatureActions.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO:
 *   Ponto de entrada único para as AÇÕES de botão que precisam de backend
 *   (exportar CSV/PDF, enviar e-mail, reconfigurar gatilhos, verificar a
 *   planilha, backup). Cada ação delega para os serviços já existentes do
 *   projeto e devolve o envelope { ok, data } / { ok, error } — o mesmo
 *   contrato usado pelo restante da frota.
 *
 *   Criado em 2026-07-03 para eliminar "botões mortos": todo botão visível
 *   passa a disparar uma operação real de servidor com retorno ao usuário.
 *
 * SEGURANÇA:
 *   - Exige sessão válida (reusa gw_currentUser_ do ApiGateway.gs).
 *   - Somente ações da whitelist do switch são aceitas.
 *   - Saída sanitizada por toClientSafe_ quando disponível.
 * ============================================================
 */

function runFeatureAction(action, payload, token) {
  try {
    var principal = Auth.validateSession(token);
    if (!principal) throw new Error('Sessão expirada. Faça login novamente.');
    fa_requirePermission_(principal, String(action));
    var p = payload || {};
    var data;
    switch (String(action)) {
      case 'spreadsheet.verify':   data = fa_verifySpreadsheet_();                    break;
      case 'spreadsheet.backup':   data = fa_backupSpreadsheet_(p);                   break;
      case 'triggers.setupAll':    data = fa_setupTriggers_();                        break;
      case 'triggers.list':        data = fa_listTriggers_();                         break;
      case 'export.pdf':           data = fa_exportPdf_(p);                           break;
      case 'export.csv':           data = fa_exportSheetCsv_(p);                      break;
      case 'email.send':           data = fa_sendEmail_(p);                           break;
      default:
        throw new Error('Ação não suportada: ' + action);
    }
    var safe = (typeof toClientSafe_ === 'function') ? toClientSafe_(data) : data;
    return { ok: true, data: safe };
  } catch (error) {
    return { ok: false, error: { message: (error && error.message) || 'Erro interno do servidor.' } };
  }
}

Router.register('feature.run', function(data, token) {
  var result = runFeatureAction(data && data.featureAction, data && data.payload, token);
  if (!result.ok) throw new Error(result.error && result.error.message || 'Não foi possível concluir.');
  return Response.success(result.data);
});

function fa_requirePermission_(principal, action) {
  var role = String(principal && (principal.perfil || principal.role) || '').toLowerCase();
  var coordination = ['coordenacao', 'coordenação', 'admin', 'administrador'];
  var teachers = coordination.concat(['professor', 'professor regente', 'teacher']);
  var allowed = /^(spreadsheet\.|triggers\.|export\.csv)/.test(action) ? coordination : teachers;
  if (allowed.indexOf(role) === -1) {
    throw new Error('Seu perfil não possui permissão para esta operação.');
  }
}

/** Abre a planilha central e resume abas/linhas — leitura, sem efeitos. */
function fa_verifySpreadsheet_() {
  var ss = fa_spreadsheet_();
  var sheets = ss.getSheets().map(function (sh) {
    return { nome: sh.getName(), linhas: sh.getLastRow(), colunas: sh.getLastColumn() };
  });
  return {
    message: 'Planilha acessível: ' + sheets.length + ' aba(s).',
    spreadsheet: ss.getName(),
    sheets: sheets
  };
}

/** Cria um backup da planilha configurada via BackupFolderService. */
function fa_backupSpreadsheet_(p) {
  if (typeof createConfiguredSpreadsheetBackup !== 'function') {
    throw new Error('Serviço de backup indisponível neste projeto.');
  }
  var id = fa_spreadsheetId_();
  var res = createConfiguredSpreadsheetBackup(id, (p && p.prefix) || 'backup');
  var url = (res && (res.url || res.fileUrl)) || '';
  return { message: 'Backup gerado com sucesso.', url: url, detalhe: res };
}

/** (Re)configura todos os gatilhos automáticos e devolve a lista resultante. */
function fa_setupTriggers_() {
  if (typeof TriggerManager === 'undefined' || !TriggerManager.setupAllTriggers) {
    throw new Error('TriggerManager indisponível.');
  }
  TriggerManager.setupAllTriggers();
  var lista = TriggerManager.listTriggers ? TriggerManager.listTriggers() : [];
  return { message: 'Gatilhos reconfigurados (' + (lista.length || 0) + ').', triggers: lista };
}

/** Lista os gatilhos ativos (para telas de status). */
function fa_listTriggers_() {
  if (typeof TriggerManager === 'undefined' || !TriggerManager.listTriggers) {
    throw new Error('TriggerManager indisponível.');
  }
  var lista = TriggerManager.listTriggers();
  return { message: (lista.length || 0) + ' gatilho(s) ativo(s).', triggers: lista };
}

/**
 * Gera um PDF simples a partir de um título/subtítulo e o salva no Drive,
 * devolvendo a URL. Usado pelos botões "Exportar PDF" das telas de relatório.
 */
function fa_exportPdf_(p) {
  if (typeof DriveService === 'undefined' || !DriveService.saveReport) {
    throw new Error('DriveService indisponível.');
  }
  var titulo = (p && p.title) || 'Relatório';
  var subtitulo = (p && p.subtitle) || '';
  var html = '<html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:32px}' +
    'h1{color:#3b3b8f}small{color:#666}</style></head><body>' +
    '<h1>' + fa_escape_(titulo) + '</h1>' +
    (subtitulo ? '<p>' + fa_escape_(subtitulo) + '</p>' : '') +
    '<small>Gerado em ' + new Date().toLocaleString('pt-BR') + '</small>' +
    '</body></html>';
  var blob = HtmlService.createHtmlOutput(html).getBlob()
    .getAs('application/pdf')
    .setName(fa_slug_(titulo) + '_' + fa_stamp_() + '.pdf');
  var url = DriveService.saveReport(blob, blob.getName());
  return { message: 'PDF gerado com sucesso.', url: url };
}

/** Exporta uma aba da planilha como CSV para o Drive e devolve a URL. */
function fa_exportSheetCsv_(p) {
  if (typeof DriveService === 'undefined' || !DriveService.saveReport) {
    throw new Error('DriveService indisponível.');
  }
  var ss = fa_spreadsheet_();
  var nome = (p && p.sheet) || '';
  var sheet = nome ? ss.getSheetByName(nome) : ss.getSheets()[0];
  if (!sheet) throw new Error('Aba não encontrada: ' + nome);
  var values = sheet.getDataRange().getValues();
  var csv = values.map(function (row) {
    return row.map(fa_csvCell_).join(',');
  }).join('\r\n');
  var blob = Utilities.newBlob(csv, 'text/csv',
    fa_slug_(sheet.getName()) + '_' + fa_stamp_() + '.csv');
  var url = DriveService.saveReport(blob, blob.getName());
  return { message: 'CSV exportado (' + values.length + ' linha(s)).', url: url };
}

/** Envia um e-mail simples via EmailService. */
function fa_sendEmail_(p) {
  if (typeof EmailService === 'undefined' || !EmailService.sendGeneric) {
    throw new Error('EmailService indisponível.');
  }
  var to = (p && p.to || '').trim();
  if (!to) throw new Error('Destinatário não informado.');
  EmailService.sendGeneric(to, (p && p.subject) || '(sem assunto)', (p && p.body) || '');
  return { message: 'E-mail enviado para ' + to + '.' };
}

/* ---- utilitários internos ---- */
function fa_spreadsheet_() {
  if (typeof getBoundSpreadsheet_ === 'function') return getBoundSpreadsheet_();
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Planilha central indisponível.');
}
function fa_spreadsheetId_() {
  if (typeof Config !== 'undefined' && Config && typeof Config.getSpreadsheetId === 'function') {
    return Config.getSpreadsheetId();
  }
  return fa_spreadsheet_().getId();
}
function fa_csvCell_(v) {
  var s = (v === null || v === undefined) ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function fa_escape_(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function fa_slug_(s) {
  return String(s || 'arquivo').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
function fa_stamp_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-3', 'yyyyMMdd_HHmmss');
}
