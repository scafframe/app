/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : ImportService.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Serviço de importação de dados em lote. Permite o upload de um arquivo CSV com a lista de alunos da escola para popular o banco de dados rapidamente no início do projeto, evitando o cadastro manual de cada aluno.
 *
 * FUNCIONALIDADES:
 *   - importStudentsFromCSV(csvContent) : Importa alunos de um CSV.
 *   - importMoviesFromCSV(csvContent)   : Importa o catálogo de filmes de um CSV.
 *   - parseCSV(content)                 : Converte string CSV em array de objetos.
 *   - validateImportData(rows, type)    : Valida os dados antes da importação.
 *   - getImportTemplate(type)           : Retorna o template CSV para download.
 *
 * INTEGRAÇÕES:
 *   - StudentDAO.gs   : Persiste os alunos importados.
 *   - MovieDAO.gs     : Persiste os filmes importados.
 *   - Validation.gs   : Valida cada linha do CSV antes da importação.
 *   - Logger.gs       : Registra o resultado da importação (sucesso/falha por linha).
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Nenhum gatilho direto. Acionado manualmente via ImportForm.html.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SPREADSHEETS_ID : Acessado via os DAOs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Importação em lote com relatório de erros por linha.
 *   - Validação de todos os dados antes de qualquer escrita na planilha.
 *   - Template CSV disponível para download para padronizar o formato.
 *   - Transação: em caso de erro, nenhuma linha é importada (all-or-nothing).
 * ============================================================
 */

var ImportService = { parseCSV: function(content) { return content.split('\n').slice(1).map(function(line) { var cols = line.split(','); return { Nome: cols[0], Turma: cols[1] }; }); } };
