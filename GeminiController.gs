/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : GeminiController.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Registra as rotas 'gemini.*' no Router (padrão dos demais Controllers).
 *   Antes deste arquivo, MovieReviewForm.html chamava a ação
 *   'gemini.generateReview' que NÃO estava registrada — toda submissão do
 *   questionário de crítica recebia 404 "Ação desconhecida".
 *
 * ROTAS:
 *   - gemini.generateReview  : Crítica semiautomatizada (25 respostas).
 *   - gemini.discussionGuide : Roteiro de discussão socrática para a roda de
 *                              conversa do cineclube (ensino dialógico):
 *                              perguntas abertas e progressivas geradas a
 *                              partir das mesmas respostas do questionário.
 *
 * INTEGRAÇÕES:
 *   - Router.gs        : Registro das rotas (sessão validada pelo Router).
 *   - GeminiService.gs : generateReview() e generateDiscussionGuide(),
 *                        ambos endurecidos com fallback determinístico.
 *   - Response.gs      : Envelope legado {status,data,message,code}, que o
 *                        Code.gs normaliza para StandardReturn na fronteira.
 * ============================================================
 */

Router.register('gemini.generateReview', function(d, t) {
  var result = GeminiService.generateReview((d && d.answers) || {}, (d && d.movieTitle) || '');
  if (result && result.success) {
    return Response.success({
      review: result.data,
      model: (result.meta && result.meta.model) || GeminiService.MODEL,
      note: (result.meta && result.meta.message) || ''
    }, 'Crítica gerada.');
  }
  return Response.error((result && result.error) || 'Falha ao gerar a crítica.');
});

Router.register('gemini.discussionGuide', function(d, t) {
  return Response.success(
    GeminiService.generateDiscussionGuide((d && d.answers) || {}, (d && d.movieTitle) || ''),
    'Roteiro de discussão gerado.'
  );
});
