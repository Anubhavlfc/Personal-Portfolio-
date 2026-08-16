export type ThinkingStage = {
  id: string
  label: string
  explanation: string
}

export const howIThink: ThinkingStage[] = [
  {
    id: 'question',
    label: 'Question',
    explanation: 'Start by getting specific about what’s actually being asked — and what decision it needs to support.',
  },
  {
    id: 'data',
    label: 'Data',
    explanation: 'Find the data that bears on the question, then clean and validate it before trusting it.',
  },
  {
    id: 'system',
    label: 'System',
    explanation: 'Design how the pieces fit together — the pipeline, the application, the architecture that makes the data usable.',
  },
  {
    id: 'model',
    label: 'Model',
    explanation: 'Where it’s warranted, apply a model — statistical or machine learning — to turn data into a signal.',
  },
  {
    id: 'insight',
    label: 'Insight',
    explanation: 'Translate the output into something a person can actually understand and act on.',
  },
  {
    id: 'decision',
    label: 'Decision',
    explanation: 'Connect the insight back to the original question — and the business or technical decision it informs.',
  },
]
