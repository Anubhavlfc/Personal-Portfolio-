export type DiagramStage = {
  label: string
  detail: string
}

export type Project = {
  id: string
  title: string
  kicker: string
  summary: string
  contribution: string
  highlights: string[]
  stack: string[]
  diagramLabel: string
  diagram: DiagramStage[]
  githubUrl?: string
  demoUrl?: string
}

export const projects: Project[] = [
  {
    id: 'gradtrack-ai',
    title: 'GradTrack AI',
    kicker: 'AI application · Python, MCP',
    summary:
      'Graduate school applications are scattered across email threads, portals, and deadlines that are easy to miss. GradTrack AI pulls that into one place an assistant can actually reason about.',
    contribution:
      'Built the MCP tool layer the assistant calls — 10 tools covering status parsing, deadline tracking, program comparison, and document storage — plus the email integration that keeps application state current. Developed in sprints with code review on a shared GitHub repo.',
    highlights: [
      'Email integration that updates application status automatically',
      'Status parsing across inconsistent email and portal formats',
      'Deadline alerts and side-by-side program comparison',
      'Persistent memory so context carries across sessions',
    ],
    stack: ['Python', 'MCP', 'LLM Integration', 'Email API'],
    diagramLabel: 'How it works',
    diagram: [
      { label: 'User', detail: 'Asks about an application or requests an update.' },
      { label: 'AI Assistant', detail: 'Interprets the request and selects the tools it needs.' },
      { label: 'MCP Tools', detail: '10 tools for reading, parsing, and updating application state.' },
      { label: 'Application Data', detail: 'Structured record of every program and its current status.' },
      { label: 'Email / Documents', detail: 'Source data pulled in through the email API and stored files.' },
      { label: 'Recommendations', detail: 'Deadline alerts and program comparisons returned to the user.' },
    ],
  },
  {
    id: 'recruitment-analytics',
    title: 'College Recruitment Analytics',
    kicker: 'Data science · R, classification modeling',
    summary:
      'The admissions question was simple to ask and hard to answer: which geographic regions actually produce enrolled students, not just applicants?',
    contribution:
      'Cleaned a messy enrollment dataset — missing values, type mismatches, duplicate records, and inconsistent international student entries — then built classification models over the result and turned the regional findings into a recommendation the college could act on.',
    highlights: [
      'Resolved missing values, type mismatches, and duplicate records',
      'Reconciled inconsistent international student data',
      'Built classification models for regional enrollment analysis',
      'Translated the analysis into a recruitment recommendation',
    ],
    stack: ['R', 'tidyverse', 'ggplot2', 'caret', 'pandas'],
    diagramLabel: 'Analysis pipeline',
    diagram: [
      { label: 'Raw Data', detail: 'Enrollment records across domestic and international applicants.' },
      { label: 'Cleaning', detail: 'Missing values, type mismatches, duplicates, inconsistent entries.' },
      { label: 'Exploration', detail: 'Regional distributions and enrollment patterns.' },
      { label: 'Modeling', detail: 'Classification models over the cleaned regional data.' },
      { label: 'Visualization', detail: 'Regional results rendered for a non-technical audience.' },
      { label: 'Recommendation', detail: 'Findings translated into a recruitment decision.' },
    ],
  },
]
