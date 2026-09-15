export type ExperienceEntry = {
  id: string
  role: string
  org: string
  period: string
  summary: string
  highlights: string[]
  stack: string[]
}

export const experience: ExperienceEntry[] = [
  {
    id: 'oppenheimer',
    role: 'Data Engineer Intern',
    org: 'Oppenheimer Companies, Inc.',
    period: 'Summer 2026',
    summary:
      'Worked with the data team on the pipelines that move and validate enterprise data.',
    highlights: [
      'Built and maintained ETL/ELT pipelines for enterprise data workflows',
      'Cleaned, transformed, and validated data moving through production pipelines',
      'Monitored pipeline health, debugged failures, and documented pipeline behavior',
      'Worked alongside data engineers and analysts on day-to-day requests',
    ],
    stack: ['Python', 'SQL', 'ETL/ELT', 'Data Validation'],
  },
  {
    id: 'coi-it',
    role: 'Software Developer Intern',
    org: 'The College of Idaho — IT Department',
    period: 'Summer 2026 – Present',
    summary:
      'Develop and maintain the college’s WordPress site, working directly with campus departments.',
    highlights: [
      'Ship front-end improvements and technical fixes across the site',
      'Work on site architecture and plugin configuration',
      'Manage user permissions and access control',
      'Scope and prioritize requests from campus departments',
    ],
    stack: ['WordPress', 'Front-end Development', 'Site Architecture'],
  },
]
