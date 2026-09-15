export type SkillGroup = {
  id: string
  title: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    items: ['Python', 'SQL', 'R'],
  },
  {
    id: 'data-ml',
    title: 'Data & Machine Learning',
    items: ['pandas', 'NumPy', 'tidyverse', 'ggplot2', 'caret', 'Model training & evaluation'],
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    items: ['ETL / ELT', 'Data transformation', 'Data validation', 'Pipeline documentation'],
  },
  {
    id: 'ai',
    title: 'AI Development',
    items: ['LLM integration', 'MCP', 'AI application development'],
  },
  {
    id: 'web',
    title: 'Web & Software',
    items: ['WordPress', 'Front-end development'],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: ['Git / GitHub', 'Azure', 'VS Code', 'Excel'],
  },
]
