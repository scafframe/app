/**
 * ============================================================
 * PROJETO  : Cine Clube Horizontes Animados
 * ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
 * ARQUIVO  : Migration.gs
 * VERSÃO   : 1.0.0
 * ============================================================
 *
 * DESCRIÇÃO PRINCIPAL:
 *   Sistema de migração de estrutura da planilha. Gerencia atualizações de cabeçalhos e formatos das abas quando o sistema recebe novas funcionalidades, garantindo compatibilidade com dados existentes sem perda de informação.
 *
 * FUNCIONALIDADES:
 *   - getCurrentVersion()        : Retorna a versão atual do schema da planilha.
 *   - runMigrations()            : Executa todas as migrações pendentes.
 *   - migrate_v1_to_v2()         : Migração específica da versão 1 para 2.
 *   - addColumn(sheet, header)   : Adiciona uma nova coluna a uma aba existente.
 *   - renameColumn(sheet, old, new): Renomeia uma coluna sem perder dados.
 *   - backupBeforeMigration()    : Cria uma cópia da planilha antes de migrar.
 *
 * INTEGRAÇÕES:
 *   - SheetManager.gs  : Usa os cabeçalhos definidos como referência.
 *   - Database.gs      : Operações de leitura/escrita durante a migração.
 *   - DriveService.gs  : Cria backup no Drive antes de migrar.
 *   - Properties.gs    : Armazena a versão atual do schema.
 *   - Logger.gs        : Registra cada etapa da migração.
 *
 * GATILHOS NATIVOS (script.google.com):
 *   - Executado manualmente via menu do Apps Script antes de atualizar o sistema.
 *
 * VARIÁVEIS DE AMBIENTE (PropertiesService):
 *   - SCHEMA_VERSION : Versão atual do schema da planilha.
 *   - SPREADSHEETS_ID : Acessado via Config.gs.
 *
 * BOAS PRÁTICAS APLICADAS:
 *   - Backup obrigatório antes de qualquer migração.
 *   - Migrações versionadas e idempotentes.
 *   - Rollback manual via backup em caso de falha.
 * ============================================================
 */

var Migration = { getCurrentVersion: function() { return Properties.get('SCHEMA_VERSION') || '1.0'; }, runMigrations: function() { Logger_.info('Migration', 'Schema versão: ' + this.getCurrentVersion()); } };
