/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ARQUIVO  : Ping.gs
 * ============================================================
 *
 * codex-frontend-backend-healthcheck
 * Sonda de saude leve: confirma que o frontend alcanca o backend via
 * google.script.run e recebe um envelope StandardReturn valido.
 *
 * - Sem efeitos colaterais, sem dependencia de sessao ou planilha.
 * - Arquivo isolado: nao altera nenhuma rota existente.
 * - Exposto como global para o ClientCall chamar diretamente (callServer('ping')).
 */
function ping() {
  try {
    return StandardReturn.ok({
      status: 'ok',
      service: 'backend',
      project: 'Scafframe',
      time: new Date().toISOString()
    });
  } catch (error) {
    Logger.log("Erro em ping: " + error.message);
    throw error;
  }
}
