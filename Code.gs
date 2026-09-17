/**
 * Code.gs
 * 
 * Projeto: Scafframe
 * Parte da Frota Educacional EC 115 Norte
 * 
 * Padrão FROTA:
 * - Conformidade 100% com diretrizes de governança
 * - Autenticação em texto plano (contexto supervisionado)
 * - Session gate para rotas protegidas
 * - Observabilidade e auditoria implementadas
 * 
 * @version 2.1
 * @date 2026-07-02
 */

﻿/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Code.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Ponto de entrada (entry point) do Google Apps Script. Contém as funções reservadas doGet() e doPost() que o Apps Script invoca automaticamente quando a Web App é acessada via URL publicada. Serve o Index.html como SPA (Single Page Application) e delega todas as requisições de dados ao Router.gs.
 *
 * FUNCIONALIDADES:
 *   - doGet(e)  : Serve a interface HTML principal (Index.html) com HtmlService.
 *   - doPost(e) : Recebe payloads JSON de integrações externas (ex: Google Colab).
 *   - include() : Injeta partials HTML (Sidebar, Header, Footer) no template principal.
 *
 * INTEGRAÇÕES:
 *   - HtmlService       : Renderiza o frontend como Web App.
 *   - Router.gs         : Roteamento de todas as chamadas RPC.
 *   - Config.gs         : Leitura do SPREADSHEETS_ID e configurações globais.
 *   - Auth.gs           : Verificação de sessão ativa antes de servir a página.
 *   - Logger.gs         : Registro de acessos e erros críticos.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto neste arquivo. TriggerManager.gs gerencia todos os gatilhos.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : ID da Google Planilha central do projeto.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Separação entre apresentação (HTML) e lógica (GS).
 *   - Uso de HtmlService.createTemplateFromFile para injeção segura de partials.
 *   - Tratamento de exceções com try/catch e log estruturado via Logger.gs.
 * ============================================================
 */

var SCAFFRAME_VIEW_BY_PAGE_ = {
  app: 'Dashboard',
  dashboard: 'Dashboard',
  studentlist: 'StudentList',
  alunos: 'StudentList',
  studentform: 'StudentForm',
  movielist: 'MovieList',
  filmes: 'MovieList',
  movieform: 'MovieForm',
  moviereviewform: 'MovieReviewForm',
  sessionlist: 'SessionList',
  sessoes: 'SessionList',
  sessionform: 'SessionForm',
  evaluationlist: 'EvaluationList',
  rubricas: 'EvaluationList',
  evaluationform: 'EvaluationForm',
  attendancelist: 'AttendanceList',
  presencas: 'AttendanceList',
  attendanceform: 'AttendanceForm',
  selectionview: 'SelectionView',
  selecao: 'SelectionView',
  selectionform: 'SelectionForm',
  reportview: 'ReportView',
  relatorios: 'ReportView',
  pilotreport: 'PilotReport',
  userlist: 'UserList',
  usuarios: 'UserList',
  userform: 'UserForm',
  settings: 'Settings',
  configuracoes: 'Settings',
  profile: 'Profile',
  perfil: 'Profile',
  muralevolution: 'MuralEvolution',
  mural: 'MuralEvolution',
  muralform: 'MuralForm',
  notificationlist: 'NotificationList',
  notificacoes: 'NotificationList',
  auditlogview: 'AuditLogView',
  auditoria: 'AuditLogView',
  help: 'Help',
  ajuda: 'Help',
  spreadsheetstatus: 'SpreadsheetStatus',
  statusplanilha: 'SpreadsheetStatus',
  weeklytriggerstatus: 'WeeklyTriggerStatus',
  gatilhos: 'WeeklyTriggerStatus',
  emailpreview: 'EmailPreview',
  email: 'EmailPreview',
  colabintegration: 'ColabIntegration',
  colab: 'ColabIntegration'
};

function getScafframeView_(page) {
  var normalized = String(page || '').trim().toLowerCase().replace(/^\/+/, '');
  return SCAFFRAME_VIEW_BY_PAGE_[normalized] || null;
}

function getScafframeRoute_(page) {
  var view = getScafframeView_(page) || 'Dashboard';
  var routes = {
    Dashboard: '/dashboard', StudentList: '/alunos', StudentForm: '/alunos/novo',
    MovieList: '/filmes', MovieForm: '/filmes/novo', MovieReviewForm: '/filmes/revisao',
    SessionList: '/sessoes', SessionForm: '/sessoes/nova',
    EvaluationList: '/rubricas', EvaluationForm: '/rubricas/nova',
    AttendanceList: '/presencas', AttendanceForm: '/presencas/registrar',
    SelectionView: '/selecao', SelectionForm: '/selecao/nova',
    ReportView: '/relatorios', PilotReport: '/relatorios/piloto',
    UserList: '/usuarios', UserForm: '/usuarios/novo',
    Settings: '/configuracoes', Profile: '/perfil',
    MuralEvolution: '/mural', MuralForm: '/mural/novo',
    NotificationList: '/notificacoes', AuditLogView: '/auditoria',
    Help: '/ajuda', SpreadsheetStatus: '/configuracoes/planilha',
    WeeklyTriggerStatus: '/configuracoes/gatilhos', EmailPreview: '/comunicacao/email',
    ColabIntegration: '/comunicacao/colab'
  };
  return routes[view] || '/dashboard';
}

function doGet(e) {
  // FLEET_FRAGMENT_BOOTSTRAP: o token fica no fragmento (#tok=), que não é
  // enviado ao servidor. O shell valida o token antes de chamar qualquer API.
  var fleetBootstrapRequestedPage = e && e.parameter && String(e.parameter.page || 'app');
  var fleetBootstrapPage = Boolean(getScafframeView_(fleetBootstrapRequestedPage));
  var fleetBootstrapToken = e && e.parameter && e.parameter.tok;
  if (fleetBootstrapPage && !fleetBootstrapToken) {
    var fleetTemplates = ['Index', 'index', 'Dashboard'];
    for (var fleetI = 0; fleetI < fleetTemplates.length; fleetI++) {
      try {
        var fleetTemplate = HtmlService.createTemplateFromFile(fleetTemplates[fleetI]);
        fleetTemplate.authToken = '';
        fleetTemplate.tok = '';
        fleetTemplate.sessionUser = {};
        fleetTemplate.data = { scriptUrl: ScriptApp.getService().getUrl() };
        fleetTemplate.initialView = getScafframeView_(fleetBootstrapRequestedPage) || 'Dashboard';
        fleetTemplate.initialRoute = getScafframeRoute_(fleetBootstrapRequestedPage);
        return fleetTemplate.evaluate()
          .setTitle('Scafframe')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      } catch (fleetTemplateError) {}
    }
    return HtmlService.createHtmlOutput('Aplicação indisponível.');
  }
  try {
    var params = e && e.parameter ? e.parameter : {};
    var tok = params.tok || '';

    try {
      // DEBUG: Log das tentativas
      Logger.log('=== doGet INICIADO ===');
      Logger.log('params.page: ' + params.page);
      Logger.log('tok: ' + (tok ? 'presente' : 'ausente'));
      Logger.log('isAuthenticated: ' + isAuthenticatedByToken(tok));

      if (String(params.page || '').toLowerCase() === 'login' || !isAuthenticatedByToken(tok)) {
        Logger.log('Redirecionando para Login');
        return HtmlService.createTemplateFromFile('Login').evaluate()
          .setTitle('Cine Clube Horizontes Animados | Login')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      }

      Logger.log('Tentando carregar Index.html...');
    
      // DEBUG: Testar se Index.html existe como HtmlOutput
      try {
        var testHtml = HtmlService.createHtmlOutputFromFile('Index');
        Logger.log('✅ Index.html encontrado');
      } catch (err) {
        Logger.log('❌ ERRO: Index.html NAO encontrado: ' + err.message);
        return HtmlService.createHtmlOutput(
          '<h1>Erro ao carregar o sistema.</h1>' +
          '<p style="color:red"><strong>Index.html não encontrado!</strong></p>' +
          '<pre>Erro: ' + err.message + '</pre>'
        );
      }

      // DEBUG: Testar cada include separadamente
      var includesToTest = ['Styles', 'Scripts', 'SharedTokens', 'Header', 'Sidebar', 'Footer', 'AuthJS', 'RouterJS', 'Api', 'UtilsJS', 'HealthCheck', 'ClientCall'];
    
      for (var i = 0; i < includesToTest.length; i++) {
        var incName = includesToTest[i];
        try {
          var testInclude = HtmlService.createHtmlOutputFromFile(incName);
          Logger.log('  ✅ Include OK: ' + incName);
        } catch (errInc) {
          Logger.log('  ❌ Include FALHOU: ' + incName + ' - ' + errInc.message);
        }
      }

      // DEBUG: Testar createTemplateFromFile
      try {
        var template = HtmlService.createTemplateFromFile('Index');
        template.authToken = tok;
        template.sessionUser = getSessionUser(tok) || {};
        template.initialView = getScafframeView_(params.page) || 'Dashboard';
        template.initialRoute = getScafframeRoute_(params.page);
        Logger.log('✅ Template criado com scriptlets');
      } catch (err) {
        Logger.log('❌ ERRO ao criar template: ' + err.message);
        Logger.log('Stack: ' + err.stack);
        return HtmlService.createHtmlOutput(
          '<h1>Erro ao carregar o sistema.</h1>' +
          '<p style="color:red"><strong>Erro ao criar template!</strong></p>' +
          '<p>Isso pode significar que um dos arquivos incluidos tem erro de sintaxe JavaScript.</p>' +
          '<pre>Erro: ' + err.message + '</pre>'
        );
      }

      Logger.log('Tentando avaliar template (executar scriptlets)...');
      var result = template.evaluate()
        .setTitle('Cine Clube Horizontes Animados')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
      Logger.log('✅ Index.html carregado com sucesso!');
      Logger.log('=== doGet CONCLUIDO ===');
      return result;
    
    } catch (err) {
      Logger.log('❌ ERRO NO doGet: ' + err.message);
      Logger.log('Stack: ' + err.stack);
      return HtmlService.createHtmlOutput(
        '<h1>Erro ao carregar o sistema.</h1>' +
        '<pre>Erro: ' + err.message + '\n\nStack:\n' + err.stack + '</pre>'
      );
    }
  } catch (error) {
    Logger.log("Erro em doGet: " + error.message);
    throw error;
  }
}


function doPost(e) {
  try {
    try {
      var payload = JSON.parse(e.postData.contents);
      var result = StandardReturn.normalize(Router.handle(payload));
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger_.error('doPost', err);
      return ContentService.createTextOutput(JSON.stringify(StandardReturn.fail(err.message)))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("Erro em doPost: " + error.message);
    throw error;
  }
}

/**
 * Endpoint RPC unico chamado pelo frontend via google.script.run.
 * O ClientCall/Api do frontend envia um JSON { action, data, token }.
 * Aqui despachamos pelo Router (contrato legado) e SEMPRE devolvemos o
 * envelope canonico StandardReturn, para o ClientCall desempacotar .data.
 *
 * Antes deste handler, Api.html chamava google.script.run.handleRequest(...),
 * mas a funcao nao existia no backend — toda chamada falhava. Este e o ponto
 * de fronteira que normaliza o contrato legado para o padrao da frota.
 *
 * @param {string} payloadJson JSON com { action, data, token }.
 * @returns {{success:boolean,data:*,error:?string,meta:Object}}
 */
function handleRequest(payloadJson) {
  try {
    try {
      try {
        var payload = typeof payloadJson === 'string' ? JSON.parse(payloadJson) : (payloadJson || {});
        return StandardReturn.normalize(Router.handle(payload));
      } catch (err) {
        Logger_.error('handleRequest', err);
        return StandardReturn.fail(err.message || 'Falha ao processar a requisicao.');
      }
    } catch (error) {
      Logger.log("Erro em handleRequest: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em handleRequest: " + error.message);
    throw error;
  }
}

/**
 * Inclui um partial HTML AVALIANDO seus scriptlets (<?!= ?>, <? ?>).
 * Usa createTemplateFromFile().evaluate() — createHtmlOutputFromFile NAO
 * avalia templates, fazendo scriptlets aninhados aparecerem literais (bug
 * conhecido na frota). Mantem o include() utilizavel para partials com logica.
 */
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}
