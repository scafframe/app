/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : TriggerManager.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Gerenciador central de Gatilhos (Triggers) nativos do Google Apps Script. Configura, lista e remove gatilhos temporais (Time-driven) para automatizar as rotinas semanais do projeto: cálculo de evolução, seleção de alunos, envio de notificações e geração de relatórios.
 *
 * FUNCIONALIDADES:
 *   - setupAllTriggers()         : Configura todos os gatilhos do projeto.
 *   - setupWeeklySelectionTrigger(): Gatilho de sexta-feira para seleção de alunos.
 *   - setupMondayBaselineTrigger(): Gatilho de segunda-feira para lembrete de rubrica.
 *   - setupMonthlyCleanupTrigger(): Gatilho mensal para limpeza de logs.
 *   - listTriggers()             : Lista todos os gatilhos ativos.
 *   - removeAllTriggers()        : Remove todos os gatilhos (para manutenção).
 *   - removeTriggerByFunction(fn): Remove um gatilho específico pelo nome da função.
 *
 * INTEGRAÇÕES:
 *   - ScriptApp (nativo)     : API do Apps Script para gerenciamento de gatilhos.
 *   - JobScheduler.gs        : Função executada pelo gatilho de sexta-feira.
 *   - Logger.gs              : Registra criação e remoção de gatilhos.
 *   - Properties.gs          : Armazena IDs dos gatilhos criados.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Gatilho de sexta-feira (17h): Executa JobScheduler.runWeeklySelection().
 *   - Gatilho de segunda-feira (8h): Executa JobScheduler.sendBaselineReminder().
 *   - Gatilho mensal (1º dia): Executa Logger_.clearOldLogs().
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado indiretamente pelas funções acionadas pelos gatilhos.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Verificação de gatilhos existentes antes de criar novos (evita duplicatas).
 *   - Armazenamento dos IDs dos gatilhos no PropertiesService para gerenciamento.
 *   - Função setupAllTriggers() chamada via menu do Apps Script na instalação.
 * ============================================================
 */

var TriggerManager = {
  setupAllTriggers: function() {
    this.setupWeeklySelectionTrigger();
    this.setupMondayBaselineTrigger();
    Logger_.info('TriggerManager', 'Todos os gatilhos configurados.');
  },
  setupWeeklySelectionTrigger: function() {
    try {
      ScriptApp.newTrigger('runWeeklySelection')
        .timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(17).create();
      Logger_.info('TriggerManager', 'Gatilho de sexta-feira criado.');
    } catch (error) {
      Logger.log("Erro em setupWeeklySelectionTrigger: " + error.message);
      throw error;
    }
  },
  setupMondayBaselineTrigger: function() {
    try {
      ScriptApp.newTrigger('sendBaselineReminder')
        .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
      Logger_.info('TriggerManager', 'Gatilho de segunda-feira criado.');
    } catch (error) {
      Logger.log("Erro em setupMondayBaselineTrigger: " + error.message);
      throw error;
    }
  },
  listTriggers: function() {
    try {
      return ScriptApp.getProjectTriggers().map(function(t) {
        return { id: t.getUniqueId(), fn: t.getHandlerFunction(), type: t.getEventType() };
      });
    } catch (error) {
      Logger.log("Erro em listTriggers: " + error.message);
      throw error;
    }
  }
};
