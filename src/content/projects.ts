export type DiagramStage = {
  label: string
  detail: string
}

export type Project = {
  id: string
  title: string
  kicker: string
  problem: string
  contribution: string
  whyItMatters: string
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
    problem:
      'Graduate school applications end up scattered across email threads, portals, and deadlines that are easy to miss.',
    contribution:
      'Built the MCP tool layer the assistant calls — 10 tools covering status parsing, deadline tracking, program comparison, and document storage — plus the email integration that keeps application state current. Developed in sprints with code review on a shared GitHub repo.',
    whyItMatters:
      'Pulls everything into one place an assistant can actually reason about, instead of a person re-reading the same inbox.',
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
    problem:
      'Which geographic regions actually produce enrolled students — not just applicants? Simple to ask, hard to answer from the data as it existed.',
    contribution:
      'Cleaned a messy enrollment dataset — missing values, type mismatches, duplicate records, and inconsistent international student entries — then built classification models over the result and turned the regional findings into a recommendation the college could act on.',
    whyItMatters:
      'The analysis ended in a recruitment recommendation rather than a report, which is the difference between data science and a homework assignment.',
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

/**
 * The long-form case study. Every field is drawn from the GradTrack AI entry
 * above; `reflection` is intentionally empty until there is something real
 * to say — the section hides it rather than filling it in.
 */
export const caseStudy = {
  projectId: 'gradtrack-ai',
  eyebrow: 'Selected case study',
  problem:
    'Graduate applications generate a lot of state — which programs, what stage each is at, which deadline is next — and that state lives in email threads and separate portals. Keeping it straight by hand meant re-reading the same inbox and hoping nothing slipped.',
  approach:
    'Rather than asking a language model to reason over raw emails, give it a tool layer it can call. Each tool does one concrete thing against structured application data, so the assistant plans and delegates instead of guessing.',
  decisions: [
    {
      title: 'MCP as the tool protocol',
      detail: 'The assistant reaches everything through 10 MCP tools — reading, parsing, and updating application state — so the model’s job is choosing tools, not inventing facts.',
    },
    {
      title: 'Email as the source of truth',
      detail: 'Status changes arrive by email, so the email API feeds the application record directly rather than depending on the user to relay updates.',
    },
    {
      title: 'Persistent memory',
      detail: 'Application context is stored, not re-derived, so a conversation can pick up where the last one left off.',
    },
  ],
  implementation:
    'The 10 tools cover status parsing, deadline tracking, program comparison, and document storage, with an email integration that keeps the underlying state current. The project was built in sprints with code review on a shared GitHub repository.',
  challenge:
    'Status parsing. Emails and portals don’t share a format, so reliably turning “we’ve received your materials” and its many variants into a consistent application state was the part that took real work.',
  result: [
    'Application status updates automatically from incoming email',
    'Deadline alerts and side-by-side program comparison',
    'Document management with memory that persists across sessions',
  ],
  reflection: '',
}
