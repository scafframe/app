/**
 * ============================================================
 * PROJETO  : Scafframe (Cine Clube Horizontes Animados)
 * ARQUIVO  : AuthController.gs
 * ============================================================
 *
 * Registra as ações de autenticação no Router (padrão dos demais Controllers).
 * Antes deste arquivo, o Router isentava 'auth.login' da validação de sessão,
 * mas nenhum handler estava registrado — toda tentativa de login caía em
 * "Ação desconhecida: auth.login". Estas rotas fecham essa lacuna.
 *
 * Contratos:
 *   auth.login  { usuario, senha } -> { token, nome, perfil }
 *   auth.logout { } (token no payload) -> mensagem
 *   auth.me     { } (token no payload) -> usuário atual
 *
 * As respostas seguem o Response legado; o handleRequest em Code.gs normaliza
 * para o envelope StandardReturn antes de devolver ao frontend.
 */
Router.register('auth.login', function(d, t) {
  var result = Auth.login(d.usuario, d.senha);
  if (result && result.success) {
    return Response.success(result, 'Login realizado com sucesso.');
  }
  return Response.error((result && result.message) || 'Credenciais invalidas.', 401);
});

Router.register('auth.logout', function(d, t) {
  var result = Auth.logout(t);
  if (result && result.success === false) {
    return Response.error(result.message || 'Nao foi possivel encerrar a sessao.', 401);
  }
  return Response.success(result || {}, 'Sessao encerrada.');
});

Router.register('auth.me', function(d, t) {
  var user = Auth.getCurrentUser(t);
  return user ? Response.success(user) : Response.unauthorized('Sessão não encontrada.');
});
