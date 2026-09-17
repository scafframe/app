/**
 * ============================================================
 * ARQUIVO  : 00_RouterBootstrap.gs
 * PROJETO  : Cine Clube Horizontes Animados — Escola Classe 115 Norte
 * ============================================================
 *
 * Define o stub-buffer de `Router` ANTES de qualquer controller.
 *
 * Os controllers chamam `Router.register('acao', fn)` no escopo global (load
 * time). Como o Apps Script avalia os arquivos em ordem alfabetica, os
 * controllers A–Q (ex.: AttendanceController.gs) eram avaliados ANTES de
 * Router.gs, quando `Router` ainda era `undefined`, gerando
 * "TypeError: Cannot read properties of undefined (reading 'register')".
 *
 * O prefixo "00_" garante que este arquivo seja avaliado primeiro. O stub
 * apenas enfileira as rotas em `Router._pending`; o IIFE em Router.gs drena
 * esse buffer e substitui `Router` pela implementacao real (register/handle).
 */
var Router = {
  register: function(action, fn) {
    try {
      Router._pending = Router._pending || [];
      Router._pending.push([action, fn]);
    } catch (error) {
      Logger.log("Erro em register: " + error.message);
      throw error;
    }
  }
};
