/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasilia-DF
 * ARQUIVO  : StandardReturn.gs
 * VERSAO   : 1.0.0
 * ============================================================
 *
 * codex-standard-return-contract
 * Envelope canonico da frota para tudo que e exposto ao frontend.
 *
 *   { success: boolean, data: any|null, error: string|null, meta: Object }
 *
 * PONTE COM O CONTRATO LEGADO:
 *   Este projeto nasceu com Response.gs ({ status, data, message, code }).
 *   StandardReturn.normalize() converte esse formato (e valores crus) para o
 *   envelope canonico, sem exigir que cada Controller seja reescrito de uma vez.
 *   O ponto de fronteira (handleRequest em Code.gs) normaliza toda resposta
 *   antes de devolve-la ao ClientCall do frontend, garantindo um contrato unico.
 * ============================================================
 */
var StandardReturn = (function() {
  function now_() { return new Date().toISOString(); }

  function hasOwn_(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function errorMessage_(error) {
    try {
      if (error === null || error === undefined) return null;
      if (typeof error === 'string') return error;
      if (error.message) return String(error.message);
      if (error.error) return errorMessage_(error.error);
      return String(error);
    } catch (error) {
      Logger.log("Erro em errorMessage_: " + error.message);
      throw error;
    }
  }

  function metaFrom_(source, extra) {
    try {
      var meta = {};
      source = source || {};
      extra = extra || {};
      ['code', 'status', 'statusCode', 'message', 'timestamp', 'generatedAt', 'attempts', 'model'].forEach(function(key) {
        if (hasOwn_(source, key) && source[key] !== undefined && source[key] !== null) {
          meta[key] = source[key];
        }
      });
      Object.keys(extra).forEach(function(key) {
        if (extra[key] !== undefined && extra[key] !== null) meta[key] = extra[key];
      });
      if (!meta.generatedAt) meta.generatedAt = now_();
      return meta;
    } catch (error) {
      Logger.log("Erro em metaFrom_: " + error.message);
      throw error;
    }
  }

  function ok(data, meta) {
    return {
      success: true,
      data: data === undefined ? null : data,
      error: null,
      meta: metaFrom_(meta)
    };
  }

  function fail(error, data, meta) {
    return {
      success: false,
      data: data === undefined ? null : data,
      error: errorMessage_(error) || 'Erro desconhecido.',
      meta: metaFrom_(meta)
    };
  }

  function isEnvelope(value) {
    return Boolean(
      value &&
      typeof value === 'object' &&
      typeof value.success === 'boolean' &&
      (hasOwn_(value, 'data') || hasOwn_(value, 'error'))
    );
  }

  /**
   * Converte qualquer retorno para o envelope canonico.
   * Reconhece: o proprio envelope; o contrato legado Response
   * ({ status:'success'|'error', data, message, code }); { ok, ... };
   * e valores crus (string, array, objeto, numero).
   */
  function normalize(value) {
    if (isEnvelope(value)) return value;

    // Contrato legado Response.gs
    if (value && typeof value === 'object' && (value.status === 'success' || value.status === 'error')) {
      var legacyMeta = { code: value.code, message: value.message };
      if (value.status === 'success') return ok(value.data, legacyMeta);
      return fail(value.message || 'Erro.', value.data, legacyMeta);
    }

    // Contrato { ok: boolean, ... }
    if (value && typeof value === 'object' && typeof value.ok === 'boolean') {
      return value.ok ? ok(value.data || value, {}) : fail(value.error || value.message, value.data);
    }

    // Valor cru
    return ok(value);
  }

  return {
    ok: ok,
    fail: fail,
    isEnvelope: isEnvelope,
    normalize: normalize
  };
})();
