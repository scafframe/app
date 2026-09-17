/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : QuestionarioController.gs
 * VERSÃO   : 1.1.0
 * ============================================================
 * 
 * DESCRIÇÃO PRINCIPAL:
 *   Controlador para gestão dos questionários analíticos e críticas 
 *   geradas pelo Gemini. Gerencia o salvamento das 25 respostas 
 *   e da crítica final na planilha central.
 * 
 * FUNCIONALIDADES:
 *   - save(data) : Salva as respostas e a crítica na aba 'Questionarios'.
 *   - listByMovie(movieId) : Lista todos os questionários de um filme.
 *   - getById(id) : Recupera um questionário específico.
 * 
 * INTEGRAÇÕES COM O BACKEND:
 *   - Database.gs : Para persistência na planilha.
 *   - AuditLog.gs : Para registro da operação de salvamento.
 * 
 * BOAS PRÁTICAS APLICADAS:
 *   - Armazenamento das 25 respostas em formato JSON para flexibilidade.
 *   - Registro de auditoria para cada crítica salva.
 *   - Validação de permissões (apenas Professor/Coordenacao).
 *   - Exige 25 respostas e confirmação humana antes de persistir a crítica.
 * ============================================================
 */

var QuestionarioController = {
  
  /**
   * Salva um novo questionário e sua crítica correspondente.
   */
  save: function(data, token) {
    try {
      data = data || {};
      var principal = Auth.validateSession(token);
      if (!principal) {
        return Response.error("Sessão inválida. Faça login novamente.", 401);
      }

      var perfil = String(principal.perfil || principal.role || '');
      if (perfil !== 'Professor' && perfil !== 'Coordenacao') {
        return Response.error("Acesso negado.", 403);
      }

      if (!String(data.sessaoId || '').trim() ||
          !String(data.alunoId || '').trim() ||
          !String(data.filmeId || '').trim()) {
        return Response.error("Sessão, estudante e filme são obrigatórios.", 422);
      }

      var sessaoId = String(data.sessaoId).trim();
      var alunoId = String(data.alunoId).trim();
      var filmeId = String(data.filmeId).trim();
      var sessao = Database.findById('Sessoes', sessaoId);
      if (!sessao || !Database.findById('Alunos', alunoId) || !Database.findById('Filmes', filmeId)) {
        return Response.error("Sessão, estudante ou filme não encontrado. Atualize os cadastros selecionados.", 422);
      }
      if (String(sessao.FilmeID || '').trim() !== filmeId) {
        return Response.error("O filme selecionado não pertence à sessão escolhida.", 422);
      }
      if (String(sessao.Status || '').trim().toLowerCase() === 'cancelada') {
        return Response.error("Escolha uma sessão que não esteja cancelada.", 422);
      }

      var answers = {};
      for (var index = 1; index <= 25; index++) {
        var answer = data.answers && data.answers['q' + index];
        if (typeof answer !== 'string' || !answer.trim() || answer.trim().length > 1000) {
          return Response.error("As 25 respostas são obrigatórias, com até 1000 caracteres cada.", 422);
        }
        answers['q' + index] = answer.trim();
      }

      var critica = String(data.criticaGemini || '').trim();
      if (!critica) return Response.error("Revise a crítica antes de salvar.", 422);
      if (critica.length > 15000) return Response.error("A crítica deve ter até 15000 caracteres.", 422);
      if (data.humanReviewed !== true) {
        return Response.error("Confirmação humana obrigatória antes de salvar.", 422);
      }

      var id = Utils.generateId();
      var record = {
        ID: id,
        SessaoID: sessaoId,
        AlunoID: alunoId,
        FilmeID: filmeId,
        RespostasJson: JSON.stringify(answers),
        DataPreenchimento: new Date().toISOString(),
        CriticaGemini: critica
      };
    
      try {
        Database.appendRow("Questionarios", record);
        AuditLog.log("CREATE", "Questionario", id, "Crítica revisada e salva para o filme ID: " + data.filmeId);
        return Response.success(id, "Questionário e crítica salvos com sucesso.");
      } catch (e) {
        return Response.error("Erro ao salvar questionário: " + e.toString());
      }
    } catch (error) {
      Logger.log("Erro em save: " + error.message);
      throw error;
    }
  }
};

Router.register('questionario.save', function(data, token) {
  return QuestionarioController.save(data, token);
});
