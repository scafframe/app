/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : StudentDAO.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Data Access Object para a entidade Aluno. Gerencia os dados dos estudantes de 8 a 10 anos da Escola Classe 115 Norte na aba 'Alunos'. Campos: ID, Nome, Turma, DataNascimento, NecessidadesEspeciais, DataCadastro.
 *
 * FUNCIONALIDADES:
 *   - findAll()              : Lista todos os alunos cadastrados.
 *   - findByTurma(turma)     : Filtra alunos por turma (ex: '3A', '4B').
 *   - findById(id)           : Retorna um aluno pelo ID.
 *   - create(studentData)    : Cadastra um novo aluno.
 *   - update(id, data)       : Atualiza dados de um aluno.
 *   - delete(id)             : Remove um aluno da planilha.
 *   - countByTurma()         : Retorna contagem de alunos por turma.
 *
 * INTEGRAÇÕES:
 *   - Database.gs      : Operações CRUD na aba 'Alunos'.
 *   - Config.gs        : Nome da aba (SHEET_NAMES.ALUNOS).
 *   - EvaluationDAO.gs : Busca o histórico de rubricas de um aluno.
 *   - AttendanceDAO.gs : Verifica o histórico de presenças do aluno.
 *   - SelectionAlgorithm.gs : Consome dados do aluno para o cálculo de seleção.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via Database.gs > Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Campos de necessidades especiais para inclusão pedagógica.
 *   - Filtro por turma para operações em lote (ex: seleção semanal).
 *   - Validação de faixa etária (8-10 anos) no momento do cadastro.
 * ============================================================
 */

// CRUD base via createBaseDao; busca por turma para a seleção semanal.
var StudentDAO = createBaseDao(Config.SHEET_NAMES.ALUNOS, {
  findByTurma: function(turma) { return Database.findByField(Config.SHEET_NAMES.ALUNOS, 'Turma', turma); }
});
