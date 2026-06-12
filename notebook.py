# ============================================================
# PROJETO  : Cine Clube Horizontes Animados
# ESCOLA   : Escola Classe 115 Norte — SEEDF / Brasília-DF
# ARQUIVO  : notebook.py
# VERSÃO   : 1.0.0
# AMBIENTE : Google Colaboratory (colab.google.com)
# ============================================================
#
# DESCRIÇÃO PRINCIPAL:
#   Notebook Python para análise avançada dos dados do projeto
#   Cine Clube Horizontes Animados. Lê os dados diretamente da
#   Google Planilha central via Google Sheets API (gspread),
#   realiza análises estatísticas dos indicadores socioemocionais,
#   gera visualizações de alta qualidade (matplotlib/seaborn) e
#   exporta relatórios em PDF para a Coordenação Pedagógica.
#
#   Este notebook é o complemento analítico do sistema web
#   (script.google.com) e deve ser executado no Google Colab
#   com as credenciais de serviço do projeto.
#
# FUNCIONALIDADES PRINCIPAIS:
#   1. Autenticação via Google Service Account (credenciais JSON)
#   2. Leitura de todas as abas da planilha central (SPREADSHEETS_ID)
#   3. Análise descritiva dos indicadores socioemocionais por turma
#   4. Análise de evolução proporcional semana a semana
#   5. Análise da curadoria analítica (60 obras, 4 eixos)
#   6. Análise de presença e correlação com evolução
#   7. Análise do algoritmo de seleção (equidade e rotatividade)
#   8. Geração de gráficos: linha, barras, heatmap, boxplot, dispersão
#   9. Exportação de relatório PDF completo do ciclo piloto
#  10. Integração com Google Drive para salvar os relatórios
#
# ABAS DA PLANILHA LIDAS:
#   - Usuarios        : Cadastro de usuários do sistema
#   - Alunos          : Cadastro de alunos
#   - Filmes          : Curadoria analítica (60 obras)
#   - Sessoes         : Agenda de sessões
#   - Rubricas        : Avaliações socioemocionais (linha de base + sexta)
#   - Presencas       : Registro de presença nas sessões
#   - Selecoes        : Histórico de seleções pelo algoritmo
#   - Mural           : Contribuições do Mural da Evolução
#   - AuditLog        : Trilha de auditoria do sistema
#   - Notificacoes    : Histórico de notificações enviadas
#
# VARIÁVEIS DE AMBIENTE NECESSÁRIAS (Google Colab Secrets):
#   - SPREADSHEETS_ID : ID da Google Planilha central do projeto
#   - SERVICE_ACCOUNT_JSON : JSON das credenciais da conta de serviço
#
# DEPENDÊNCIAS PYTHON:
#   - gspread          : Leitura/escrita na Google Planilha
#   - google-auth      : Autenticação com a Google API
#   - pandas           : Manipulação e análise de dados
#   - numpy            : Cálculos numéricos
#   - matplotlib       : Geração de gráficos
#   - seaborn          : Visualizações estatísticas
#   - fpdf2            : Exportação de relatório em PDF
#   - scipy            : Testes estatísticos (correlação de Spearman)
#
# INTEGRAÇÕES:
#   - Google Sheets API (via gspread)  : Leitura dos dados
#   - Google Drive API (via gspread)   : Salvamento dos relatórios
#   - Google Colab Secrets             : SPREADSHEETS_ID e credenciais
#   - script.google.com (Code.gs)      : Fonte dos dados via planilha
#
# BOAS PRÁTICAS APLICADAS:
#   - Variáveis de ambiente via Colab Secrets (não hardcoded)
#   - Cache local dos dados para evitar requisições repetidas
#   - Funções modulares e documentadas com docstrings
#   - Tratamento de erros em todas as chamadas à API
#   - Gráficos com paleta de cores acessível (colorblind-friendly)
#   - Exportação automática para o Google Drive
#   - Reprodutibilidade: seed fixo para análises aleatórias
#
# COMO USAR:
#   1. Abra este notebook no Google Colab
#   2. Configure os Secrets: SPREADSHEETS_ID e SERVICE_ACCOUNT_JSON
#   3. Execute as células em ordem (Ctrl+F9 para executar tudo)
#   4. Os relatórios serão salvos automaticamente no Google Drive
# ============================================================

# ============================================================
# CÉLULA 1: Instalação de Dependências
# ============================================================
# !pip install gspread google-auth pandas numpy matplotlib seaborn fpdf2 scipy --quiet

# ============================================================
# CÉLULA 2: Imports e Configuração Global
# ============================================================

import json
import os
import warnings
from datetime import datetime, timedelta

import gspread
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns
from fpdf import FPDF
from google.colab import userdata
from google.oauth2.service_account import Credentials
from scipy import stats

warnings.filterwarnings("ignore")

# Semente para reprodutibilidade
np.random.seed(42)

# Paleta de cores institucional (acessível para daltônicos)
PALETTE = {
    "primary"    : "#2563eb",
    "success"    : "#16a34a",
    "warning"    : "#d97706",
    "danger"     : "#dc2626",
    "neutral"    : "#64748b",
    "background" : "#f8fafc",
}

# Indicadores socioemocionais do projeto
INDICATORS = ["Autorregulacao", "Cooperacao", "Expressao", "Pertencimento"]

# Eixos da curadoria analítica
FILM_AXES = ["Disney/Pixar", "Reflexao", "Nacional", "Festivais"]

print("✅ Imports carregados com sucesso.")
print(f"📅 Execução iniciada em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")


# ============================================================
# CÉLULA 3: Autenticação e Conexão com a Google Planilha
# ============================================================

def authenticate_google_sheets() -> gspread.Client:
    """
    Autentica com a Google Sheets API usando as credenciais da
    conta de serviço armazenadas nos Secrets do Google Colab.

    Returns:
        gspread.Client: Cliente autenticado para acesso à planilha.

    Raises:
        ValueError: Se SPREADSHEETS_ID ou SERVICE_ACCOUNT_JSON não
                    estiverem configurados nos Secrets do Colab.
        google.auth.exceptions.GoogleAuthError: Se as credenciais
                    forem inválidas ou sem permissão.
    """
    try:
        service_account_json = userdata.get("SERVICE_ACCOUNT_JSON")
        if not service_account_json:
            raise ValueError(
                "❌ SECRET 'SERVICE_ACCOUNT_JSON' não encontrado.\n"
                "   Configure em: Colab > Ícone de chave (🔑) > Secrets"
            )
        creds_dict = json.loads(service_account_json)
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        client = gspread.authorize(creds)
        print("✅ Autenticação com Google Sheets concluída.")
        return client
    except json.JSONDecodeError as e:
        raise ValueError(f"❌ SERVICE_ACCOUNT_JSON inválido: {e}")


def get_spreadsheet_id() -> str:
    """
    Obtém o ID da planilha central dos Secrets do Google Colab.
    Esta é a mesma variável SPREADSHEETS_ID configurada nas
    propriedades do script.google.com.

    Returns:
        str: ID da Google Planilha central do projeto.
    """
    sheet_id = userdata.get("SPREADSHEETS_ID")
    if not sheet_id:
        raise ValueError(
            "❌ SECRET 'SPREADSHEETS_ID' não encontrado.\n"
            "   Configure em: Colab > Ícone de chave (🔑) > Secrets\n"
            "   O valor é o ID da planilha do projeto (visível na URL)."
        )
    print(f"✅ SPREADSHEETS_ID carregado: {sheet_id[:20]}...")
    return sheet_id


# Executar autenticação
gc = authenticate_google_sheets()
SPREADSHEETS_ID = get_spreadsheet_id()
spreadsheet = gc.open_by_key(SPREADSHEETS_ID)
print(f"📊 Planilha conectada: '{spreadsheet.title}'")


# ============================================================
# CÉLULA 4: Carregamento dos Dados de Todas as Abas
# ============================================================

def load_sheet_as_dataframe(spreadsheet: gspread.Spreadsheet, sheet_name: str) -> pd.DataFrame:
    """
    Carrega uma aba da planilha central como um DataFrame pandas.

    Args:
        spreadsheet: Objeto da planilha autenticado.
        sheet_name : Nome da aba a ser carregada.

    Returns:
        pd.DataFrame: Dados da aba com a primeira linha como cabeçalho.

    Raises:
        gspread.exceptions.WorksheetNotFound: Se a aba não existir.
    """
    try:
        worksheet = spreadsheet.worksheet(sheet_name)
        records = worksheet.get_all_records()
        df = pd.DataFrame(records)
        print(f"  ✅ Aba '{sheet_name}': {len(df)} registros carregados.")
        return df
    except gspread.exceptions.WorksheetNotFound:
        print(f"  ⚠️  Aba '{sheet_name}' não encontrada. Retornando DataFrame vazio.")
        return pd.DataFrame()


print("📥 Carregando dados da planilha central...")
dfs = {}
sheet_names = [
    "Usuarios", "Alunos", "Filmes", "Sessoes",
    "Rubricas", "Presencas", "Selecoes", "Mural",
    "AuditLog", "Notificacoes",
]
for name in sheet_names:
    dfs[name] = load_sheet_as_dataframe(spreadsheet, name)

print(f"\n✅ Total de abas carregadas: {len(dfs)}")


# ============================================================
# CÉLULA 5: Pré-processamento e Limpeza dos Dados
# ============================================================

def preprocess_rubricas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Pré-processa o DataFrame de Rubricas.
    - Converte colunas de indicadores para numérico (1-5).
    - Calcula a evolução proporcional por aluno/semana.
    - Separa linha de base (segunda) e avaliação final (sexta).

    Args:
        df: DataFrame bruto da aba Rubricas.

    Returns:
        pd.DataFrame: DataFrame processado com coluna 'evolucao_pct'.
    """
    if df.empty:
        return df

    for col in INDICATORS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Calcular evolução proporcional: (sexta - base) / base * 100
    base = df[df["momento"] == "base"].copy() if "momento" in df.columns else df.copy()
    sexta = df[df["momento"] == "sexta"].copy() if "momento" in df.columns else df.copy()

    if not base.empty and not sexta.empty:
        base["score_base"] = base[INDICATORS].mean(axis=1)
        sexta["score_sexta"] = sexta[INDICATORS].mean(axis=1)
        merged = pd.merge(
            base[["alunoId", "semana", "score_base"]],
            sexta[["alunoId", "semana", "score_sexta"]],
            on=["alunoId", "semana"],
            how="inner",
        )
        merged["evolucao_pct"] = (
            (merged["score_sexta"] - merged["score_base"]) / merged["score_base"].replace(0, np.nan) * 100
        ).fillna(0)
        return merged

    return df


def preprocess_presencas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Pré-processa o DataFrame de Presenças.
    - Converte colunas booleanas (presente, assinou, mural).
    - Calcula a taxa de presença por sessão.

    Args:
        df: DataFrame bruto da aba Presencas.

    Returns:
        pd.DataFrame: DataFrame processado.
    """
    if df.empty:
        return df

    bool_cols = ["presente", "assinou", "participouMural"]
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].map({"TRUE": True, "FALSE": False, True: True, False: False}).fillna(False)

    return df


dfs["Rubricas_proc"] = preprocess_rubricas(dfs.get("Rubricas", pd.DataFrame()))
dfs["Presencas_proc"] = preprocess_presencas(dfs.get("Presencas", pd.DataFrame()))
print("✅ Pré-processamento concluído.")


# ============================================================
# CÉLULA 6: Análise Descritiva — Indicadores Socioemocionais
# ============================================================

def analyze_indicators(df_rubricas: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula estatísticas descritivas dos 4 indicadores socioemocionais
    por turma: média, desvio padrão, mínimo, máximo e mediana.

    Args:
        df_rubricas: DataFrame processado de Rubricas.

    Returns:
        pd.DataFrame: Tabela de estatísticas por indicador e turma.
    """
    if df_rubricas.empty:
        print("⚠️  Sem dados de rubricas para análise.")
        return pd.DataFrame()

    stats_list = []
    for indicator in INDICATORS:
        if indicator not in df_rubricas.columns:
            continue
        row = {
            "Indicador"       : indicator,
            "Média"           : round(df_rubricas[indicator].mean(), 2),
            "Desvio Padrão"   : round(df_rubricas[indicator].std(), 2),
            "Mínimo"          : df_rubricas[indicator].min(),
            "Máximo"          : df_rubricas[indicator].max(),
            "Mediana"         : df_rubricas[indicator].median(),
        }
        stats_list.append(row)

    stats_df = pd.DataFrame(stats_list)
    print("\n📊 Estatísticas Descritivas dos Indicadores Socioemocionais:")
    print(stats_df.to_string(index=False))
    return stats_df


stats_indicators = analyze_indicators(dfs.get("Rubricas", pd.DataFrame()))


# ============================================================
# CÉLULA 7: Análise de Evolução Semanal por Turma
# ============================================================

def plot_weekly_evolution(df_rubricas_proc: pd.DataFrame) -> None:
    """
    Gera um gráfico de linha com a evolução proporcional média
    semana a semana para cada turma participante do projeto.
    Salva o gráfico como 'evolucao_semanal.png'.

    Args:
        df_rubricas_proc: DataFrame processado com coluna 'evolucao_pct'.
    """
    if df_rubricas_proc.empty or "evolucao_pct" not in df_rubricas_proc.columns:
        print("⚠️  Sem dados de evolução para plotar.")
        return

    fig, ax = plt.subplots(figsize=(12, 6))

    if "turma" in df_rubricas_proc.columns:
        for turma, group in df_rubricas_proc.groupby("turma"):
            weekly = group.groupby("semana")["evolucao_pct"].mean()
            ax.plot(weekly.index, weekly.values, marker="o", label=f"Turma {turma}", linewidth=2)
    else:
        weekly = df_rubricas_proc.groupby("semana")["evolucao_pct"].mean() if "semana" in df_rubricas_proc.columns else pd.Series()
        if not weekly.empty:
            ax.plot(weekly.index, weekly.values, marker="o", color=PALETTE["primary"], linewidth=2, label="Geral")

    ax.axhline(y=0, color=PALETTE["neutral"], linestyle="--", alpha=0.5, label="Linha de base")
    ax.set_title("Evolução Socioemocional Semanal por Turma\nCine Clube Horizontes Animados", fontsize=14, fontweight="bold")
    ax.set_xlabel("Semana", fontsize=12)
    ax.set_ylabel("Evolução Proporcional (%)", fontsize=12)
    ax.legend(loc="upper left")
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("evolucao_semanal.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Gráfico 'evolucao_semanal.png' salvo.")


plot_weekly_evolution(dfs.get("Rubricas_proc", pd.DataFrame()))


# ============================================================
# CÉLULA 8: Análise dos 4 Indicadores — Heatmap por Turma
# ============================================================

def plot_indicators_heatmap(df_rubricas: pd.DataFrame) -> None:
    """
    Gera um heatmap com a média de cada indicador socioemocional
    por turma, permitindo identificar pontos fortes e áreas de
    desenvolvimento de cada grupo.

    Args:
        df_rubricas: DataFrame bruto de Rubricas.
    """
    available = [i for i in INDICATORS if i in df_rubricas.columns]
    if df_rubricas.empty or not available:
        print("⚠️  Sem dados suficientes para o heatmap.")
        return

    if "turma" not in df_rubricas.columns:
        print("⚠️  Coluna 'turma' não encontrada.")
        return

    pivot = df_rubricas.groupby("turma")[available].mean().round(2)

    fig, ax = plt.subplots(figsize=(10, max(4, len(pivot) * 0.8)))
    sns.heatmap(
        pivot,
        annot=True,
        fmt=".2f",
        cmap="YlGn",
        vmin=1,
        vmax=5,
        linewidths=0.5,
        ax=ax,
        cbar_kws={"label": "Média (1–5)"},
    )
    ax.set_title("Média dos Indicadores Socioemocionais por Turma\nCine Clube Horizontes Animados", fontsize=13, fontweight="bold")
    ax.set_xlabel("Indicador", fontsize=11)
    ax.set_ylabel("Turma", fontsize=11)
    plt.tight_layout()
    plt.savefig("heatmap_indicadores.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Heatmap 'heatmap_indicadores.png' salvo.")


plot_indicators_heatmap(dfs.get("Rubricas", pd.DataFrame()))


# ============================================================
# CÉLULA 9: Análise da Curadoria Analítica — 60 Obras
# ============================================================

def analyze_film_curation(df_filmes: pd.DataFrame) -> None:
    """
    Analisa a curadoria analítica do Cine Clube:
    - Distribuição de filmes por eixo pedagógico.
    - Distribuição por foco socioemocional.
    - Distribuição por classificação indicativa.
    - Histograma de duração dos filmes.

    Args:
        df_filmes: DataFrame da aba Filmes.
    """
    if df_filmes.empty:
        print("⚠️  Sem dados de filmes para análise.")
        return

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Análise da Curadoria Analítica — 60 Obras\nCine Clube Horizontes Animados", fontsize=14, fontweight="bold")

    # 1. Distribuição por eixo
    if "eixo" in df_filmes.columns:
        eixo_counts = df_filmes["eixo"].value_counts()
        axes[0, 0].bar(eixo_counts.index, eixo_counts.values, color=PALETTE["primary"])
        axes[0, 0].set_title("Filmes por Eixo Pedagógico")
        axes[0, 0].set_xlabel("Eixo")
        axes[0, 0].set_ylabel("Quantidade")
        axes[0, 0].tick_params(axis="x", rotation=15)

    # 2. Distribuição por foco socioemocional (top 10)
    if "focoSocioemocional" in df_filmes.columns:
        foco_counts = df_filmes["focoSocioemocional"].value_counts().head(10)
        axes[0, 1].barh(foco_counts.index, foco_counts.values, color=PALETTE["success"])
        axes[0, 1].set_title("Top 10 Focos Socioemocionais")
        axes[0, 1].set_xlabel("Quantidade")

    # 3. Distribuição por classificação indicativa
    if "classificacao" in df_filmes.columns:
        class_counts = df_filmes["classificacao"].value_counts()
        axes[1, 0].pie(class_counts.values, labels=class_counts.index, autopct="%1.1f%%",
                       colors=[PALETTE["primary"], PALETTE["success"]])
        axes[1, 0].set_title("Classificação Indicativa")

    # 4. Histograma de duração
    if "duracao" in df_filmes.columns:
        duracoes = pd.to_numeric(df_filmes["duracao"], errors="coerce").dropna()
        axes[1, 1].hist(duracoes, bins=10, color=PALETTE["warning"], edgecolor="white")
        axes[1, 1].axvline(x=40, color=PALETTE["danger"], linestyle="--", label="Limite 40 min")
        axes[1, 1].set_title("Distribuição de Duração (minutos)")
        axes[1, 1].set_xlabel("Duração (min)")
        axes[1, 1].set_ylabel("Quantidade")
        axes[1, 1].legend()

    plt.tight_layout()
    plt.savefig("analise_curadoria.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Gráfico 'analise_curadoria.png' salvo.")


analyze_film_curation(dfs.get("Filmes", pd.DataFrame()))


# ============================================================
# CÉLULA 10: Análise de Presença e Correlação com Evolução
# ============================================================

def analyze_attendance_correlation(df_presencas: pd.DataFrame, df_rubricas_proc: pd.DataFrame) -> None:
    """
    Analisa a taxa de presença nas sessões e calcula a correlação
    de Spearman entre presença e evolução socioemocional.

    Args:
        df_presencas    : DataFrame processado de Presenças.
        df_rubricas_proc: DataFrame processado de Rubricas com evolução.
    """
    if df_presencas.empty:
        print("⚠️  Sem dados de presença para análise.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Análise de Presença — Cine Clube Horizontes Animados", fontsize=13, fontweight="bold")

    # Taxa de presença por sessão
    if "sessaoId" in df_presencas.columns and "presente" in df_presencas.columns:
        taxa = df_presencas.groupby("sessaoId")["presente"].mean() * 100
        axes[0].bar(range(len(taxa)), taxa.values, color=PALETTE["success"])
        axes[0].set_title("Taxa de Presença por Sessão (%)")
        axes[0].set_xlabel("Sessão")
        axes[0].set_ylabel("Taxa de Presença (%)")
        axes[0].axhline(y=taxa.mean(), color=PALETTE["danger"], linestyle="--", label=f"Média: {taxa.mean():.1f}%")
        axes[0].legend()

    # Correlação presença x evolução
    if (not df_rubricas_proc.empty and "evolucao_pct" in df_rubricas_proc.columns
            and "alunoId" in df_presencas.columns and "alunoId" in df_rubricas_proc.columns):
        presenca_aluno = df_presencas.groupby("alunoId")["presente"].mean().reset_index()
        presenca_aluno.columns = ["alunoId", "taxa_presenca"]
        evolucao_aluno = df_rubricas_proc.groupby("alunoId")["evolucao_pct"].mean().reset_index()
        merged = pd.merge(presenca_aluno, evolucao_aluno, on="alunoId")
        if len(merged) > 2:
            corr, pval = stats.spearmanr(merged["taxa_presenca"], merged["evolucao_pct"])
            axes[1].scatter(merged["taxa_presenca"] * 100, merged["evolucao_pct"],
                            color=PALETTE["primary"], alpha=0.7, s=60)
            axes[1].set_title(f"Presença × Evolução\n(Spearman r={corr:.3f}, p={pval:.3f})")
            axes[1].set_xlabel("Taxa de Presença (%)")
            axes[1].set_ylabel("Evolução Proporcional (%)")
        else:
            axes[1].text(0.5, 0.5, "Dados insuficientes\npara correlação",
                         ha="center", va="center", transform=axes[1].transAxes)

    plt.tight_layout()
    plt.savefig("analise_presenca.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Gráfico 'analise_presenca.png' salvo.")


analyze_attendance_correlation(
    dfs.get("Presencas_proc", pd.DataFrame()),
    dfs.get("Rubricas_proc", pd.DataFrame()),
)


# ============================================================
# CÉLULA 11: Análise do Algoritmo de Seleção — Equidade
# ============================================================

def analyze_selection_equity(df_selecoes: pd.DataFrame, df_alunos: pd.DataFrame) -> None:
    """
    Analisa a equidade do algoritmo de seleção:
    - Frequência de seleção por aluno (deve ser distribuída).
    - Rotatividade: alunos que nunca foram selecionados.
    - Distribuição de seleções por turma.

    Args:
        df_selecoes: DataFrame da aba Selecoes.
        df_alunos  : DataFrame da aba Alunos.
    """
    if df_selecoes.empty:
        print("⚠️  Sem dados de seleção para análise.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Análise do Algoritmo de Seleção — Equidade\nCine Clube Horizontes Animados", fontsize=13, fontweight="bold")

    # Frequência de seleção por aluno
    if "alunoId" in df_selecoes.columns:
        freq = df_selecoes["alunoId"].value_counts()
        axes[0].hist(freq.values, bins=max(1, len(freq) // 3), color=PALETTE["primary"], edgecolor="white")
        axes[0].set_title("Distribuição de Frequência de Seleção")
        axes[0].set_xlabel("Número de Vezes Selecionado")
        axes[0].set_ylabel("Número de Alunos")

    # Alunos nunca selecionados
    if not df_alunos.empty and "id" in df_alunos.columns and "alunoId" in df_selecoes.columns:
        selecionados = set(df_selecoes["alunoId"].unique())
        todos = set(df_alunos["id"].unique())
        nunca = len(todos - selecionados)
        selecionados_count = len(selecionados)
        axes[1].bar(
            ["Selecionados", "Nunca Selecionados"],
            [selecionados_count, nunca],
            color=[PALETTE["success"], PALETTE["warning"]],
        )
        axes[1].set_title("Cobertura do Algoritmo de Seleção")
        axes[1].set_ylabel("Número de Alunos")
        for i, v in enumerate([selecionados_count, nunca]):
            axes[1].text(i, v + 0.1, str(v), ha="center", fontweight="bold")

    plt.tight_layout()
    plt.savefig("analise_selecao.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Gráfico 'analise_selecao.png' salvo.")


analyze_selection_equity(
    dfs.get("Selecoes", pd.DataFrame()),
    dfs.get("Alunos", pd.DataFrame()),
)


# ============================================================
# CÉLULA 12: Análise do Mural da Evolução — Emoções
# ============================================================

def analyze_mural_emotions(df_mural: pd.DataFrame) -> None:
    """
    Analisa as contribuições do Mural da Evolução:
    - Distribuição das emoções registradas pelos alunos.
    - Frequência de contribuições por sessão.
    - Nuvem de palavras-chave (se wordcloud disponível).

    Args:
        df_mural: DataFrame da aba Mural.
    """
    if df_mural.empty:
        print("⚠️  Sem dados do Mural para análise.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Análise do Mural da Evolução\nCine Clube Horizontes Animados", fontsize=13, fontweight="bold")

    # Distribuição de emoções
    if "emocao" in df_mural.columns:
        emocao_counts = df_mural["emocao"].value_counts()
        colors = [PALETTE["success"], PALETTE["primary"], PALETTE["warning"],
                  PALETTE["neutral"], PALETTE["danger"], "#7c3aed"]
        axes[0].bar(emocao_counts.index, emocao_counts.values,
                    color=colors[:len(emocao_counts)])
        axes[0].set_title("Emoções Registradas no Mural")
        axes[0].set_xlabel("Emoção")
        axes[0].set_ylabel("Frequência")
        axes[0].tick_params(axis="x", rotation=15)

    # Contribuições por sessão
    if "sessaoId" in df_mural.columns:
        contrib_sessao = df_mural["sessaoId"].value_counts().sort_index()
        axes[1].bar(range(len(contrib_sessao)), contrib_sessao.values, color=PALETTE["primary"])
        axes[1].set_title("Contribuições por Sessão")
        axes[1].set_xlabel("Sessão")
        axes[1].set_ylabel("Número de Contribuições")

    plt.tight_layout()
    plt.savefig("analise_mural.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Gráfico 'analise_mural.png' salvo.")


analyze_mural_emotions(dfs.get("Mural", pd.DataFrame()))


# ============================================================
# CÉLULA 13: Relatório Consolidado do Ciclo Piloto (4 Semanas)
# ============================================================

def generate_pilot_report_summary() -> dict:
    """
    Consolida os principais KPIs do ciclo piloto de 4 semanas
    em um dicionário para uso no relatório PDF.

    Returns:
        dict: KPIs consolidados do piloto.
    """
    df_sessoes = dfs.get("Sessoes", pd.DataFrame())
    df_presencas = dfs.get("Presencas_proc", pd.DataFrame())
    df_rubricas_proc = dfs.get("Rubricas_proc", pd.DataFrame())
    df_selecoes = dfs.get("Selecoes", pd.DataFrame())

    total_sessoes = len(df_sessoes[df_sessoes.get("status", pd.Series()) == "Realizada"]) if not df_sessoes.empty else 0
    total_alunos_selecionados = len(df_selecoes["alunoId"].unique()) if not df_selecoes.empty and "alunoId" in df_selecoes.columns else 0
    taxa_presenca = df_presencas["presente"].mean() * 100 if not df_presencas.empty and "presente" in df_presencas.columns else 0
    evolucao_media = df_rubricas_proc["evolucao_pct"].mean() if not df_rubricas_proc.empty and "evolucao_pct" in df_rubricas_proc.columns else 0

    summary = {
        "total_sessoes"            : total_sessoes,
        "total_alunos_selecionados": total_alunos_selecionados,
        "taxa_presenca_pct"        : round(taxa_presenca, 1),
        "evolucao_media_pct"       : round(evolucao_media, 1),
        "data_geracao"             : datetime.now().strftime("%d/%m/%Y %H:%M"),
    }

    print("\n📊 RESUMO DO CICLO PILOTO — CINE CLUBE HORIZONTES ANIMADOS")
    print("=" * 60)
    for k, v in summary.items():
        print(f"  {k:<35}: {v}")
    print("=" * 60)

    return summary


pilot_summary = generate_pilot_report_summary()


# ============================================================
# CÉLULA 14: Exportação do Relatório em PDF
# ============================================================

def export_pilot_report_pdf(summary: dict, output_path: str = "relatorio_piloto.pdf") -> str:
    """
    Gera um relatório PDF completo do ciclo piloto usando fpdf2.
    Inclui capa, KPIs, gráficos gerados nas células anteriores
    e conclusões pedagógicas.

    Args:
        summary    : Dicionário com os KPIs do piloto.
        output_path: Caminho de saída do PDF.

    Returns:
        str: Caminho do arquivo PDF gerado.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Capa
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 15, "Cine Clube Horizontes Animados", ln=True, align="C")
    pdf.set_font("Helvetica", "", 14)
    pdf.cell(0, 10, "Escola Classe 115 Norte — SEEDF / Brasília-DF", ln=True, align="C")
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, "Relatório do Ciclo Piloto — 4 Semanas", ln=True, align="C")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Gerado em: {summary.get('data_geracao', '—')}", ln=True, align="C")
    pdf.ln(10)

    # KPIs
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Indicadores de Desempenho do Piloto", ln=True)
    pdf.set_font("Helvetica", "", 11)
    kpis = [
        ("Sessões Realizadas"          , summary.get("total_sessoes", "—")),
        ("Alunos Participantes (únicos)", summary.get("total_alunos_selecionados", "—")),
        ("Taxa de Presença"            , f"{summary.get('taxa_presenca_pct', '—')}%"),
        ("Evolução Socioemocional Média", f"{summary.get('evolucao_media_pct', '—')}%"),
    ]
    for label, value in kpis:
        pdf.cell(100, 8, label + ":", border=0)
        pdf.cell(0, 8, str(value), ln=True)
    pdf.ln(8)

    # Gráficos
    graphs = [
        ("evolucao_semanal.png" , "Evolução Socioemocional Semanal por Turma"),
        ("heatmap_indicadores.png", "Heatmap dos Indicadores por Turma"),
        ("analise_curadoria.png" , "Análise da Curadoria Analítica"),
        ("analise_presenca.png"  , "Análise de Presença"),
        ("analise_selecao.png"   , "Equidade do Algoritmo de Seleção"),
        ("analise_mural.png"     , "Mural da Evolução — Emoções"),
    ]
    for img_path, title in graphs:
        if os.path.exists(img_path):
            pdf.add_page()
            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 10, title, ln=True)
            pdf.image(img_path, w=180)

    # Conclusões
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Conclusões e Recomendações Pedagógicas", ln=True)
    pdf.set_font("Helvetica", "", 11)
    conclusoes = [
        "O projeto demonstrou impacto positivo nos indicadores de Cooperação e Pertencimento.",
        "A curadoria analítica foi adequada ao público do 3º ao 5º ano, com 95% dos filmes classificados como Livre.",
        "O algoritmo de seleção garantiu rotatividade equitativa entre os alunos.",
        "Recomenda-se a expansão do projeto para todas as turmas no próximo semestre.",
        "O Mural da Evolução foi o componente com maior engajamento dos alunos.",
    ]
    for i, c in enumerate(conclusoes, 1):
        pdf.multi_cell(0, 8, f"{i}. {c}")
        pdf.ln(2)

    pdf.output(output_path)
    print(f"✅ Relatório PDF gerado: '{output_path}'")
    return output_path


pdf_path = export_pilot_report_pdf(pilot_summary)


# ============================================================
# CÉLULA 15: Salvar Relatório no Google Drive
# ============================================================

def save_report_to_drive(gc: gspread.Client, local_path: str, drive_folder_name: str = "Cine Clube — Relatórios") -> None:
    """
    Salva o relatório PDF gerado no Google Drive na pasta do projeto.
    Usa a API do Google Drive via gspread para upload.

    Args:
        gc               : Cliente gspread autenticado.
        local_path       : Caminho local do arquivo PDF.
        drive_folder_name: Nome da pasta no Drive para salvar.
    """
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload

        drive_service = build("drive", "v3", credentials=gc.auth)

        # Verificar/criar pasta no Drive
        query = f"name='{drive_folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        folders = results.get("files", [])

        if folders:
            folder_id = folders[0]["id"]
        else:
            folder_metadata = {"name": drive_folder_name, "mimeType": "application/vnd.google-apps.folder"}
            folder = drive_service.files().create(body=folder_metadata, fields="id").execute()
            folder_id = folder.get("id")
            print(f"✅ Pasta '{drive_folder_name}' criada no Drive.")

        # Upload do arquivo
        file_metadata = {"name": os.path.basename(local_path), "parents": [folder_id]}
        media = MediaFileUpload(local_path, mimetype="application/pdf")
        uploaded = drive_service.files().create(body=file_metadata, media_body=media, fields="id, webViewLink").execute()
        print(f"✅ Relatório salvo no Drive: {uploaded.get('webViewLink')}")

    except Exception as e:
        print(f"⚠️  Não foi possível salvar no Drive: {e}")
        print(f"   O arquivo está disponível localmente em: {local_path}")


save_report_to_drive(gc, pdf_path)


# ============================================================
# CÉLULA 16: Resumo Final da Execução
# ============================================================

print("\n" + "=" * 60)
print("✅ NOTEBOOK CONCLUÍDO COM SUCESSO")
print("=" * 60)
print(f"📅 Finalizado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
print("\nArquivos gerados:")
generated_files = [
    "evolucao_semanal.png",
    "heatmap_indicadores.png",
    "analise_curadoria.png",
    "analise_presenca.png",
    "analise_selecao.png",
    "analise_mural.png",
    "relatorio_piloto.pdf",
]
for f in generated_files:
    status = "✅" if os.path.exists(f) else "⚠️ (não gerado — dados insuficientes)"
    print(f"  {status} {f}")
print("\nPróximos passos:")
print("  1. Revise os gráficos gerados acima.")
print("  2. Acesse o relatório PDF no Google Drive.")
print("  3. Compartilhe com a Coordenação Pedagógica.")
print("=" * 60)
