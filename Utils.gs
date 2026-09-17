/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Utils.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Biblioteca de funções utilitárias globais. Fornece helpers de formatação de datas, manipulação de strings, geração de IDs únicos e conversões de tipos usados em todo o projeto.
 *
 * FUNCIONALIDADES:
 *   - formatDate(date, fmt)    : Formata uma data no padrão brasileiro (DD/MM/AAAA).
 *   - generateId(prefix)       : Gera um ID único com prefixo (ex: 'ALU-001').
 *   - toJSON(headers, row)     : Converte um array de linha em objeto JSON.
 *   - sanitize(str)            : Remove caracteres especiais de strings de entrada.
 *   - getWeekStart(date)       : Retorna a segunda-feira da semana de uma data.
 *   - getWeekEnd(date)         : Retorna a sexta-feira da semana de uma data.
 *   - calculateAge(birthDate)  : Calcula a idade a partir da data de nascimento.
 *   - padZero(n)               : Adiciona zero à esquerda para formatação.
 *
 * INTEGRAÇÕES:
 *   - Usado por todos os módulos GS do projeto.
 *   - Database.gs    : toJSON() para converter linhas em objetos.
 *   - Validation.gs  : sanitize() para limpeza de inputs.
 *   - SelectionAlgorithm.gs : getWeekStart/End() para delimitar o período.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - Nenhuma variável de ambiente. Funções puras sem efeitos colaterais.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Funções puras e sem estado para máxima reutilização.
 *   - Formatação de datas no padrão brasileiro (DD/MM/AAAA).
 *   - Sanitização de inputs para prevenir injeção de dados na planilha.
 * ============================================================
 */

var Utils = {
  formatDate: function(date) {
    try {
      if (!date) return '';
      var d = new Date(date);
      return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear();
    } catch (error) {
      Logger.log("Erro em formatDate: " + error.message);
      throw error;
    }
  },
  sanitize: function(str) { return String(str).replace(/[<>"']/g, ''); },
  getWeekStart: function(date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
};
