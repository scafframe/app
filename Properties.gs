/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Properties.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Wrapper para o PropertiesService nativo do Google Apps Script. Facilita a leitura e escrita de variáveis de ambiente do projeto, como o SPREADSHEETS_ID, e-mail do administrador e parâmetros operacionais configuráveis.
 *
 * FUNCIONALIDADES:
 *   - get(key)          : Retorna o valor de uma propriedade do script.
 *   - set(key, value)   : Define o valor de uma propriedade do script.
 *   - getAll()          : Retorna todas as propriedades como objeto JSON.
 *   - delete(key)       : Remove uma propriedade do script.
 *   - require(key)      : Retorna a propriedade ou lança erro se ausente.
 *
 * INTEGRAÇÕES:
 *   - PropertiesService (nativo) : API do Apps Script para variáveis de ambiente.
 *   - Config.gs                  : Consome Properties.require('SPREADSHEETS_ID').
 *   - EmailService.gs            : Consome Properties.get('ADMIN_EMAIL').
 *   - DriveService.gs            : Consome Properties.get('DRIVE_FOLDER_ID').
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID   : ID da Google Planilha central (obrigatório).
 *   - ADMIN_EMAIL       : E-mail do administrador para notificações.
 *   - DRIVE_FOLDER_ID   : ID da pasta no Drive para salvar relatórios.
 *   - CALENDAR_ID       : ID do Google Calendar da escola.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Centralização de todas as variáveis de ambiente em PropertiesService.
 *   - Método require() para falha rápida quando variável obrigatória está ausente.
 *   - Nunca hardcodar IDs ou e-mails diretamente no código.
 * ============================================================
 */

var Properties = {
  _p: PropertiesService.getScriptProperties(),
  get: function(k) { return this._p.getProperty(k); },
  set: function(k, v) { this._p.setProperty(k, v); },
  require: function(k) {
    try {
      var v = this.get(k);
      if (!v) throw new Error('Variável de ambiente obrigatória não configurada: ' + k);
      return v;
    } catch (error) {
      Logger.log("Erro em require: " + error.message);
      throw error;
    }
  }
};
