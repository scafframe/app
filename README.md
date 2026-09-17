# Scafframe — Arquitetura do Sistema (Cine Clube Horizontes Animados)

**Escola Classe 115 Norte — SEEDF / Brasília-DF**
**Versão:** 1.1.0 | **Ano Letivo:** 2026

---

## Visão Geral

O **Scafframe** é um sistema de gestão pedagógica e curadoria analítica para o projeto **Cine Clube Horizontes Animados**. O nome deriva de *Scaffolding* (andaime/suporte) e *Frame* (moldura/ecrã), refletindo a flexibilidade do sistema em permitir que alunos com evolução comportamental participem ativamente das atividades do cine clube. Desenvolvido para a plataforma **Google Apps Script** (`script.google.com`) com interface web SPA e análise avançada via **Google Colab**.

Todo o CRUD é processado em uma **Google Planilha central**, cujo ID é configurado na variável de ambiente `SPREADSHEETS_ID` nas propriedades do script.

## Workflow básico do produto

O percurso oficial é `professor entra → identifica sessão, estudante e filme →
estudante responde às 25 questões → sistema gera rascunho → estudante e professor
revisam → professor confirma e salva → roteiro orienta a roda de conversa`.

Papéis, regras incontornáveis, validação, publicação, smoke test e evidências
estão em [WORKFLOW_BASICO.md](WORKFLOW_BASICO.md). Use
`npm run test:workflow` para o contrato focado e `npm run check` para toda a
porta local de qualidade.

---

## Estrutura da Pasta Raiz

Todos os componentes estão na pasta raiz do projeto, conforme requisito.

---

## Componentes `.gs` — Google Apps Script (44 arquivos)

| # | Arquivo | Responsabilidade Principal |
|---|---------|---------------------------|
| 1 | `Code.gs` | Ponto de entrada do Apps Script. Serve o `Index.html` e roteia todas as requisições do frontend. |
| 2 | `Router.gs` | Roteador central de ações. Mapeia `action` → controller. |
| 3 | `Auth.gs` | Autenticação com usuário/senha em texto plano para usuários e alunos. |
| 4 | `SchemaService.gs` | Serviço central do Scafframe. Gera 15 usuários administrativos sintéticos (admin01 a admin15). |
| 5 | `GeminiService.gs` | Integração com a API do Google Gemini para geração de críticas semiautomatizadas. |
| 6 | `QuestionarioController.gs` | Gestão dos questionários de 25 questões e críticas geradas pela IA. |
| 7 | `Properties.gs` | Gerencia as variáveis de ambiente via `PropertiesService`. |
| 8 | `SheetManager.gs` | Inicializa e gerencia a estrutura da planilha central, incluindo abas de autenticação de alunos. |
| 9 | `TriggerManager.gs` | Configura e gerencia os gatilhos automáticos nativos do Apps Script. |
| 10 | `UserController.gs` | CRUD de usuários do sistema. |
| 11 | `UserDAO.gs` | Acesso direto à aba `Usuarios`. |
| 12 | `StudentController.gs` | CRUD de alunos e geração do perfil completo. |
| 13 | `StudentDAO.gs` | Acesso direto à aba `Alunos`. |
| 14 | `MovieController.gs` | CRUD da curadoria analítica (60 obras). |
| 15 | `MovieDAO.gs` | Acesso direto à aba `Filmes`. |
| 16 | `SessionController.gs` | CRUD de sessões do Cine Clube. |
| 17 | `SessionDAO.gs` | Acesso direto à aba `Sessoes`. |
| 18 | `EvaluationController.gs` | CRUD das Rubricas de Evolução Socioemocional. |
| 19 | `EvaluationDAO.gs` | Acesso direto à aba `Rubricas`. |
| 20 | `AttendanceController.gs` | CRUD de presença nas sessões. |
| 21 | `AttendanceDAO.gs` | Acesso direto à aba `Presencas`. |
| 22 | `SelectionAlgorithm.gs` | Algoritmo de seleção dos 4 alunos por turma. |
| 23 | `SelectionDAO.gs` | Acesso direto à aba `Selecoes`. |
| 24 | `MuralController.gs` | CRUD do Mural da Evolução. |
| 25 | `MuralDAO.gs` | Acesso direto à aba `Mural`. |
| 26 | `ReportController.gs` | Geração de relatórios pedagógicos. |
| 27 | `DashboardService.gs` | Agrega dados para o Dashboard. |
| 28 | `ExportService.gs` | Exportação de dados em PDF e CSV. |
| 29 | `EmailService.gs` | Envio de e-mails automáticos via `MailApp`. |
| 30 | `CalendarService.gs` | Integração com Google Calendar. |
| 31 | `NotificationService.gs` | Sistema de notificações in-app. |
| 32 | `AuditLog.gs` | Registra operações na aba `AuditLog`. |
| 33 | `RoleManager.gs` | Controle de acesso baseado em perfil (RBAC). |
| 34 | `Validation.gs` | Validação server-side de dados. |
| 35 | `Utils.gs` | Funções utilitárias. |
| 36 | `SessionService.gs` | Gerencia os tokens de sessão. |
| 37 | `ColabService.gs` | Integração com o Google Colab. |
| 38 | `WeeklyTrigger.gs` | Gatilho semanal de seleção. |
| 39 | `DailyTrigger.gs` | Gatilho diário de lembretes. |
| 40 | `MonthlyTrigger.gs` | Gatilho mensal de relatórios. |
| 41 | `ErrorHandler.gs` | Tratamento centralizado de erros. |
| 42 | `ResponseBuilder.gs` | Constrói respostas padronizadas JSON. |
| 43 | `SpreadsheetHelper.gs` | Helpers de baixo nível para a planilha. |
| 44 | `appsscript.json` | Manifesto do projeto Apps Script. |

---

## Componentes `.html` — Frontend SPA (46 arquivos)

### Destaques
- **`MovieReviewForm.html`**: Questionário de 25 questões e interface de geração de crítica via Gemini.
- **`Index.html`**: Shell da SPA Scafframe.
- **`Dashboard.html`**: Painel principal com KPIs de evolução.

---

## Abas da Google Planilha Central

| Aba | Conteúdo |
|-----|----------|
| `Usuarios` | Cadastro de usuários administrativos |
| `AlunosAuth` | Autenticação de alunos por turma (Login/Senha texto plano) |
| `Questionarios` | Respostas das 25 questões e críticas geradas pelo Gemini |
| `Alunos` | Dados pedagógicos dos alunos |
| `Filmes` | Curadoria analítica: 60 obras |
| `Sessoes` | Agenda de sessões |
| `Rubricas` | Avaliações socioemocionais (escala 1–5) |
| `Presencas` | Registro de presença e participação no Mural |
| `Selecoes` | Histórico de seleções pelo algoritmo |
| `AuditLog` | Trilha de auditoria completa |

---

## Variáveis de Ambiente (PropertiesService)

| Variável | Uso |
|----------|-----|
| `SPREADSHEETS_ID` | ID da planilha central |
| `GEMINI_API_KEY` | Chave de API para geração de críticas |
| `ADMIN_EMAIL` | E-mail para notificações do sistema |

---

## Paridade com o padrão da frota (prompts.md)

Passe aditivo que alinha o Scafframe ao backbone comum dos 22 webapps, sem reescrever
os controllers existentes:

| Arquivo | Papel | Prompt |
|---------|-------|--------|
| `StandardReturn.gs` | Envelope canônico `{success,data,error,meta}` + `normalize()` que faz a ponte com o `Response` legado | 2 |
| `Code.gs` → `handleRequest()` | Endpoint RPC único que o frontend chama; normaliza tudo para `StandardReturn`. **Antes não existia** — `Api.html` chamava uma função inexistente | 11 |
| `Code.gs` → `include()` | Passou a usar `createTemplateFromFile().evaluate()` (avalia scriptlets dos partials) | 10 |
| `Config.getSpreadsheetId()` | Resolução em cascata + **auto-provisão** da planilha; não derruba mais o `doGet` por ID ausente | 3 |
| `ClientCall.html` | Wrapper único sobre `google.script.run`: Promise + retry/backoff/jitter + unwrap do envelope | 12 |
| `Api.html` | Refatorado para delegar ao `ClientCall` (não chama `google.script.run` direto) | 12 |
| `Ping.gs` + `HealthCheck.html` | Sonda de saúde frontend↔backend (selo verde/amarelo/vermelho no Index) | 17 |
| `Auth.login` + `UserDAO.findByIdentifier` | Login aceita **usuário OU e-mail** no mesmo campo | 9 |
| `GeminiService.gs` | Retry com backoff+jitter (429/5xx), parse defensivo, **fallback determinístico**, modelo `gemini-2.0-flash` | 18 |
| `JsonUtils.gs` | Parse/stringify defensivos (`JsonUtils_`) | 4 |
| `SmokeWorkflowTest.gs` | `runSmokeWorkflowTest()`: fluxo elementar ponta a ponta com PASS/FAIL | 20 |
| `appsscript.json`, `.clasp.json`, `.claspignore` | Manifesto e empacotamento para publicar via clasp | 1 |

## Camada Pedagógica (v1.2)

Passe que torna o sistema diretamente aproveitável em sala, fechando o ciclo
de avaliação formativa de ponta a ponta:

| Arquivo | Papel pedagógico |
|---------|------------------|
| `Rubric.gs` | **Fonte única da rubrica**: descritores comportamentais observáveis (níveis 1–5) dos 4 indicadores + sugestões de **mediação formativa** por nível + fórmula da evolução proporcional `(final − base) ÷ (5 − base)` (valoriza o espaço de crescimento de quem partiu de mais longe; base 5 mantida = 100%). |
| `EvaluationDAO.gs` | Ciclo completo implementado: upsert da linha de base (chave AlunoID+Semana), avaliação de sexta exige base prévia e persiste a `EvolucaoProporcional` consumida pelo `SelectionAlgorithm.gs`. |
| `EvaluationController.gs` | Novas ações: `evaluation.saveFriday`, `evaluation.get`, `evaluation.byWeek`, `evaluation.rubric`. |
| `EvaluationForm.html` | Formulário funcional: escalas 1–5 com **descritores visíveis** ao avaliar (mesma régua para todos os avaliadores), sugestão de mediação ao marcar cada nível, badge com a base de segunda no modo sexta e evolução calculada em tempo real. |
| `MovieReviewForm.html` | As 25 questões ganharam **andaimes de escrita**: dica orientadora + início de frase (placeholder) por questão, sem alterar o esquema da aba `Questionarios`. |
| `Help.html` | Guia pedagógico completo: ciclo semanal, rubrica por extenso, fórmula explicada com exemplo, vínculo com a BNCC (Competências Gerais 8 e 9), orientações de **uso ético** (rubrica não é nota nem rótulo) e FAQ. |

### Setup do zero

1. `clasp create` ou cole o `scriptId` em `.clasp.json`; `clasp push`.
2. (Opcional) defina `SPREADSHEETS_ID` em ScriptProperties. **Se não definir, o primeiro
   `doGet`/`getSpreadsheetId()` cria a planilha automaticamente** e persiste o ID.
3. Rode `runSmokeWorkflowTest` no editor — isso estrutura as abas e semeia os 15 admins
   (`admin01..admin15`, senha = login).
4. (Opcional) defina `GEMINI_API_KEY`; sem ela, a crítica usa o fallback determinístico.
5. Deploy como Web App (executar como "eu", acesso conforme o público) e faça o smoke manual:
   login `admin01`/`admin01` → selo de saúde verde no canto inferior direito.

---

*Arquitetura Scafframe — Suporte e Moldura para a Evolução Socioemocional.*


---

## Mapeamento de Schema da Planilha (item 6 — pré-requisito para fixtures analíticos)

> **Status do catálogo AI:** vazio — o `SchemaService` atual não declara `PROJECT_SCHEMA_DEFINITIONS` nem expõe entidades analíticas. O serviço só gerencia criação de usuários administrativos sintéticos.

### Abas declaradas no SchemaService

O `SchemaService` do Scafframe não declara um catálogo de entidades. As abas são inferidas a partir do uso em `UserDAO` e demais DAOs do projeto:

| Aba (inferida via UserDAO) | Tipo | Colunas declaradas |
|---|---|---|
| Aba de usuários (via `UserDAO`) | Autenticação | `nome`, `login`, `senha`, `perfil`, `email` |

> As demais abas (filmes, sessões, votações, reservas) são gerenciadas pelos DAOs específicos do Scafframe e **não estão documentadas no SchemaService**.

### Semântica das colunas conhecidas

**Usuários (via `UserDAO`)**:
- `login` / `senha`: credenciais em texto plano (decisão do projeto).
- `perfil`: papel do usuário (`"Coordenacao"` para administradores).
- `email`: formato `loginXX@escola.edu.br` para contas sintéticas.

### Entidades pendentes de mapeamento analítico

O Scafframe é um Cine Clube com gestão de filmes, sessões e participação de alunos. As entidades de domínio do projeto não estão no `SchemaService`.

| Entidade esperada | Por que ausente | O que precisa ser feito |
|---|---|---|
| Filmes / Acervo | Não declarada no SchemaService | Mapear aba real da planilha e declarar com colunas (título, diretor, gênero, duração, classificação) |
| Sessões de exibição | Não declarada | Declarar entidade com data, filme, sala, capacidade |
| Reservas / Inscrições | Não declarada | Declarar entidade com FK aluno + sessão, status |
| Avaliações / Fichas de análise | Não declarada | Declarar entidade de avaliação filmográfica por aluno |
| Presença | Não declarada | Declarar entidade de presença confirmada por sessão |

> **Ação necessária para o item 6:** Elevar o `SchemaService` do Scafframe ao padrão da frota — declarar `PROJECT_SCHEMA_DEFINITIONS` com as entidades reais do cine clube antes de criar qualquer fixture. O serviço atual é vestigial (só cria admins) e não reflete a estrutura de dados real do projeto.
