---
task: selfImprove()
responsavel: "KaizenChief"
responsavel_type: Agente
atomic_layer: Organism
Entrada:
  - nome: previous_reports
    tipo: object
    obrigatorio: true
  - nome: usage_data
    tipo: object
    obrigatorio: true
  - nome: baseline_data
    tipo: yaml
    obrigatorio: true
    descricao: "ecosystem-baseline.yaml atual para comparação e atualização"
  - nome: changelog
    tipo: markdown
    obrigatorio: false
    descricao: "CHANGELOG.md para rastrear mudanças aplicadas"
Saida:
  - nome: improvement_plan
    tipo: markdown
    obrigatorio: true
  - nome: updated_baseline
    tipo: yaml
    obrigatorio: true
    descricao: "ecosystem-baseline.yaml atualizado com dados correntes"
Checklist:
  - Coletar meta-dados (reports anteriores, usage, data health)
  - Diagnosticar eficacia em 4 dimensoes
  - Gerar plano de melhoria (max 3 por ciclo)
  - Auto-aplicar melhorias triviais
  - Reportar melhorias destrutivas para aprovacao humana
---

# Task: Self-Improvement (Meta-Análise)
# ID: KZ-TP-006
# Executor: kaizen-chief
# Trigger: *self-improve command ou weekly schedule

task:
  name: "Self-Improvement"
  status: ready
  responsible_executor: kaizen-chief
  execution_type: hybrid
  elicit: false

  description: |
    O Kaizen Squad analisa sua própria eficácia e aplica melhorias
    incrementais. Verifica quais recomendações foram implementadas, quais
    agentes estão subutilizados, e onde as heurísticas precisam de calibração.

  input:
    - "data/reports/ — relatórios anteriores"
    - "data/baselines/ — baseline atual"
    - "git log squads/kaizen-v2/ — atividade do squad"
    - "CHANGELOG.md — histórico de mudanças"

  steps:
    - id: "1"
      name: "Rastrear recomendações anteriores"
      action: |
        1. Ler todos os relatórios em data/reports/ (relativo ao squad dir)
        2. Extrair recomendações de cada relatório
        3. Para cada: buscar evidência de implementação (git log, novos arquivos)
        4. Classificar: IMPLEMENTADA / IGNORADA / PARCIAL / PENDENTE

    - id: "2"
      name: "Analisar utilização dos agentes"
      action: |
        Fontes primárias:
        1. Verificar .aios/logs/ para ativações de cada agente
        2. Verificar data/intelligence/daily/ para comandos usados por sessão
        Corroboração secundária:
        3. Verificar git log para confirmar atividade detectada nas fontes primárias
        4. Identificar agentes nunca ativados → candidatos a remoção ou ajuste

    - id: "3"
      name: "Verificar saúde dos dados"
      action: |
        1. ecosystem-baseline.yaml: data da última atualização
        2. initial-radar.yaml: correspondência com realidade
        3. Heurísticas: alguma com threshold desatualizado?

    - id: "4"
      name: "Gerar plano de melhoria (max 3 itens)"
      action: |
        Para cada problema encontrado:
        - PROBLEMA com dados
        - AÇÃO específica (arquivo + mudança)
        - TIPO: CALIBRAR | TRIGGER | BASELINE | TEMPLATE | AGENTE
        - ESFORÇO: P/M/G
        Se esforço P e não-destrutivo:
        1. Criar snapshot diff dos arquivos afetados antes de aplicar
        2. Aplicar a melhoria automaticamente
        3. Validar resultado contra quality gate (acceptance_criteria)
        4. Se validação falhar, reverter usando snapshot diff
        5. Registrar resultado (aplicado ou revertido) no CHANGELOG
        Se esforço M/G ou destrutivo, reportar para aprovação humana.

    - id: "5"
      name: "Atualizar baseline"
      action: |
        Regenerar ecosystem-baseline.yaml com dados atuais, preservando o schema completo:
        - Preservar todas as seções obrigatórias: metadata, squads, agents, tasks, workflows, integrations
        - Contar squads, agentes, tasks, workflows
        - Atualizar status de cada squad
        - Manter campos existentes que não mudaram (não sobrescrever com vazios)
        - Validar que o output mantém a mesma estrutura YAML do input
        - Salvar com data atualizada em metadata.last_updated

  output:
    - artifact: improvement_report
      format: "Self-Improvement Report"
      path: "data/reports/self-improve-{date}.md"
    - artifact: updated_baseline
      format: "yaml"
      path: "data/baselines/ecosystem-baseline.yaml"

  acceptance_criteria:
    - "Todas as recomendações anteriores rastreadas"
    - "Utilização de cada agente verificada"
    - "Baseline atualizado com dados correntes"
    - "Max 3 melhorias propostas"
    - "Melhorias triviais auto-aplicadas com registro no CHANGELOG"
