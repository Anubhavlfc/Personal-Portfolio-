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
    items: ['WordPress', 'Front-end development', 'Site architecture'],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: ['Git / GitHub', 'Azure', 'VS Code', 'Excel'],
  },
  {
    id: 'concepts',
    title: 'Concepts',
    items: [
      'Data structures & algorithms',
      'Statistical machine learning',
      'Linear algebra',
      'Software engineering',
      'Financial analysis',
    ],
  },
]
