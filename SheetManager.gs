/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : SheetManager.gs
 * VERSÃO   : 1.1.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Gerenciador de Abas da Google Planilha. Verifica, na inicialização do sistema, se todas as abas necessárias (Usuarios, Alunos, Filmes, Sessoes, Rubricas, Presencas, Selecoes, Notificacoes, Logs, AlunosAuth, Questionarios) existem e as cria com os cabeçalhos corretos caso estejam ausentes.
 *
 * FUNCIONALIDADES:
 *   - initializeSheets()        : Cria todas as abas ausentes com cabeçalhos.
 *   - ensureSheet(name, headers): Garante que uma aba específica existe.
 *   - createSheet(name, headers): Cria uma nova aba com cabeçalhos definidos.
 *   - getSheetHeaders(name)     : Retorna os cabeçalhos esperados para cada aba.
 *   - validateStructure()       : Verifica se os cabeçalhos existentes estão corretos.
 *
 * INTEGRAÇÕES:
 *   - SpreadsheetApp : Criação e verificação de abas.
 *   - Config.gs      : Lista de nomes de abas (SHEET_NAMES).
 *   - Database.gs    : Chamado após SheetManager para garantir estrutura.
 *   - Logger.gs      : Registra criação de novas abas.
 *   - Migration.gs   : Atualiza estrutura de abas em versões futuras.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de instalação (onInstall) e inicialização manual via menu do Apps Script.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Config.getSpreadsheetId().
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Idempotência: initializeSheets() pode ser chamado múltiplas vezes sem duplicar abas.
 *   - Cabeçalhos definidos como constantes para evitar erros de digitação.
 *   - Validação da estrutura existente para detectar migrações necessárias.
 * ============================================================
 */

var SheetManager = {
  HEADERS: {
    Usuarios    : ['ID','Nome','Login','Senha','Perfil','Email','DataCadastro'],
    Alunos      : ['ID','Nome','Turma','DataNascimento','NecessidadesEspeciais','DataCadastro'],
    Filmes      : ['ID','Titulo','Ano','Eixo','Duracao','FocoSocioemocional','Tecnica','Origem','FonteAcesso','ClassificacaoIndicativa','ObservacoesMediacao'],
    Sessoes     : ['ID','Data','Horario','FilmeID','TituloFilme','Turma','Sala','Status','ObservacoesLogistica'],
    Rubricas    : ['ID','AlunoID','Semana','Autorregulacao_Base','Cooperacao_Base','ExpressaoEmocional_Base','Pertencimento_Base','Autorregulacao_Sexta','Cooperacao_Sexta','ExpressaoEmocional_Sexta','Pertencimento_Sexta','EvolucaoProporcional','Observacoes'],
    Presencas   : ['ID','SessaoID','AlunoID','Presente','Assinou','ParticipouMural','DataRegistro'],
    Selecoes    : ['ID','Semana','Turma','AlunoID','Motivo','Override','DataSelecao'],
    Notificacoes: ['ID','UsuarioID','Mensagem','Lida','DataCriacao'],
    Logs        : ['Timestamp','Nivel','Modulo','Mensagem','Detalhes'],
    AlunosAuth  : ['ID','AlunoID','Turma','Login','Senha','UltimoAcesso'],
    Questionarios: ['ID','SessaoID','AlunoID','FilmeID','RespostasJson','DataPreenchimento','CriticaGemini']
  },
  initializeSheets: function() {
    try {
      var self = this;
      Object.keys(self.HEADERS).forEach(function(name) { self.ensureSheet(name, self.HEADERS[name]); });
    } catch (error) {
      Logger.log("Erro em initializeSheets: " + error.message);
      throw error;
    }
  },
  ensureSheet: function(name, headers) {
    try {
      var ss = SpreadsheetApp.openById(Config.getSpreadsheetId());
      if (!ss.getSheetByName(name)) {
        var sheet = ss.insertSheet(name);
        sheet.appendRow(headers);
        Logger_.info('SheetManager', 'Aba criada: ' + name);
      }
    } catch (error) {
      Logger.log("Erro em ensureSheet: " + error.message);
      throw error;
    }
  }
};
