export type ArchitectureStage = {
  label: string
  detail: string
}

export type FlagshipProject = {
  kind: 'flagship'
  id: string
  title: string
  tagline: string
  story: string
  stack: string[]
  highlights: string[]
  architecture: ArchitectureStage[]
}

export type CaseStudyProject = {
  kind: 'case-study'
  id: string
  title: string
  tagline: string
  problem: string
  pipeline: ArchitectureStage[]
  highlights: string[]
  stack: string[]
  outcome: string
}

export type PlaceholderProject = {
  kind: 'placeholder'
  id: string
}

export type Project = FlagshipProject | CaseStudyProject | PlaceholderProject

export const projects: Project[] = [
  {
    kind: 'flagship',
    id: 'gradtrack-ai',
    title: 'GradTrack AI',
    tagline: 'Graduate Application Tracker',
    story:
      'A full-stack AI application built to help students manage graduate school applications — reading email for status updates, parsing application state, and surfacing what needs attention before a deadline does.',
    stack: ['Python', 'MCP', 'LLM Integration', 'Email API'],
    highlights: [
      'Email integration with automatic application status updates',
      '10 custom MCP tools exposed to the AI assistant',
      'Application status parsing across inconsistent source formats',
      'Deadline alerts and program comparison',
      'Document management with persistent memory across sessions',
      'Built with GitHub collaboration, sprint-based development, and code review',
    ],
    architecture: [
      { label: 'User', detail: 'Asks a question or requests an update on their applications.' },
      { label: 'AI Assistant', detail: 'Interprets the request and decides which tools it needs.' },
      { label: 'MCP Tools', detail: '10 purpose-built tools for reading, parsing, and updating application state.' },
      { label: 'Application Data', detail: 'Persistent, structured record of every program and its status.' },
      { label: 'Email / Documents', detail: 'Source of truth pulled in via the email API and stored documents.' },
      { label: 'Personalized Recommendations', detail: 'Deadline alerts and program comparisons surfaced back to the user.' },
    ],
  },
  {
    kind: 'case-study',
    id: 'recruitment-analytics',
    title: 'College Recruitment Analytics',
    tagline: 'Regional enrollment analysis',
    problem: 'Understanding which geographic regions produce the most enrolled students.',
    pipeline: [
      { label: 'Raw Data', detail: 'Enrollment records across domestic and international applicants.' },
      { label: 'Data Cleaning', detail: 'Missing values, type mismatches, duplicate records, inconsistent international student data.' },
      { label: 'Exploratory Analysis', detail: 'Regional distributions and enrollment patterns.' },
      { label: 'Machine Learning', detail: 'Classification modeling over cleaned regional data.' },
      { label: 'Visualization', detail: 'Regional analysis surfaced through data visualization.' },
      { label: 'Recruitment Insight', detail: 'Findings translated into an actual organizational decision.' },
    ],
    highlights: [
      'Handled missing values, type mismatches, and duplicate records',
      'Reconciled inconsistent international student data',
      'Built classification models for regional analysis',
      'Turned analysis into a business decision, not just a report',
    ],
    stack: ['R', 'tidyverse', 'ggplot2', 'caret', 'pandas'],
    outcome: 'Connected technical analysis directly to a recruitment decision.',
  },
  {
    kind: 'placeholder',
    id: 'project-03',
  },
]
