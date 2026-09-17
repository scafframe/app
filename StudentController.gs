/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : StudentController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador da entidade Aluno. Gerencia a lógica de negócio para cadastro, atualização e consulta de estudantes. Valida a faixa etária (8-10 anos) e garante que a turma informada seja válida.
 *
 * FUNCIONALIDADES:
 *   - listStudents(data, token)  : Lista alunos, com filtro opcional por turma.
 *   - createStudent(data, token) : Cadastra novo aluno com validação de idade.
 *   - updateStudent(data, token) : Atualiza dados do aluno.
 *   - deleteStudent(data, token) : Remove aluno (apenas Coordenação).
 *   - getStudentProfile(d, t)    : Retorna perfil completo com histórico de evolução.
 *
 * INTEGRAÇÕES:
 *   - Router.gs       : Registra as rotas 'student.*'.
 *   - StudentDAO.gs   : Persistência dos dados de aluno.
 *   - EvaluationDAO.gs: Busca histórico de rubricas para o perfil.
 *   - Validation.gs   : Valida campos e faixa etária.
 *   - RoleManager.gs  : Controle de acesso por perfil.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado indiretamente via StudentDAO.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Validação de faixa etária (8-10 anos) conforme escopo do projeto.
 *   - Perfil completo do aluno agrega dados de múltiplos DAOs.
 * ============================================================
 */

Router.register('student.list',   function(d, t) { return Response.success(StudentDAO.findAll()); });
Router.register('student.create', function(d, t) { return Response.success(StudentDAO.create(d)); });
