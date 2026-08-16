export type SkillGroup = {
  id: string
  index: string
  title: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    index: '01',
    title: 'Programming',
    items: ['Python', 'SQL', 'R'],
  },
  {
    id: 'data',
    index: '02',
    title: 'Data',
    items: ['pandas', 'NumPy', 'tidyverse', 'ggplot2', 'caret'],
  },
  {
    id: 'engineering',
    index: '03',
    title: 'Engineering',
    items: ['ETL / ELT', 'Data transformation', 'Data validation', 'Data documentation', 'Git / GitHub', 'Azure'],
  },
  {
    id: 'ai-ml',
    index: '04',
    title: 'AI / Machine Learning',
    items: ['Model training', 'Model evaluation', 'LLM integration', 'MCP', 'AI application development'],
  },
  {
    id: 'web-dev',
    index: '05',
    title: 'Web / Development',
    items: ['WordPress', 'Front-end development', 'VS Code'],
  },
  {
    id: 'finance-analytics',
    index: '06',
    title: 'Finance / Analytics',
    items: ['Financial analysis', 'Budget management', 'Forecasting', 'Excel', 'Financial reporting'],
  },
]
