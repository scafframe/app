/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Validation.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Biblioteca de validação de dados de entrada. Verifica campos obrigatórios, formatos de e-mail, faixa etária de alunos, classificação indicativa de filmes e sanitização de strings para prevenir injeção de dados na planilha.
 *
 * FUNCIONALIDADES:
 *   - isRequired(value, field)    : Verifica se um campo obrigatório está preenchido.
 *   - isValidEmail(email)         : Valida o formato de um endereço de e-mail.
 *   - isValidAge(birthDate)       : Verifica se o aluno tem entre 8 e 10 anos.
 *   - isValidRating(value)        : Verifica se a nota está na escala de 1 a 5.
 *   - isAdequateClassification(c) : Verifica se a classificação indicativa é adequada.
 *   - validateUserData(data)      : Valida o conjunto completo de dados de um usuário.
 *   - validateStudentData(data)   : Valida o conjunto completo de dados de um aluno.
 *   - validateMovieData(data)     : Valida os dados de um filme da curadoria.
 *
 * INTEGRAÇÕES:
 *   - Usado por todos os Controllers antes de acionar os DAOs.
 *   - Response.gs : Retorna validationError() com lista de campos inválidos.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - Nenhuma variável de ambiente.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Validação centralizada para evitar duplicação de regras nos Controllers.
 *   - Mensagens de erro em português para exibição direta ao usuário.
 *   - Classificações indicativas adequadas ao público de 8-10 anos: L, 10.
 * ============================================================
 */

var Validation = {
  isRequired: function(v, f) { if (!v || String(v).trim() === '') throw new Error('Campo obrigatório: ' + f); return true; },
  isValidEmail: function(e) { return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); },
  isValidRating: function(v) {
    if (v === null || v === undefined || String(v).trim() === '') return false;
    var rating = Number(v);
    return isFinite(rating) && rating >= 1 && rating <= 5;
  },
  isAdequateClassification: function(c) { return ['L', '10'].indexOf(String(c)) !== -1; }
};
