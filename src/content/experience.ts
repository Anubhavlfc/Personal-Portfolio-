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
      'Worked inside real, production-oriented data workflows — building and maintaining the pipelines that move enterprise data from raw source to something people can trust.',
    highlights: [
      'Built and maintained ETL/ELT pipelines for enterprise data workflows',
      'Cleaned, transformed, and validated data moving through production pipelines',
      'Monitored pipeline health and debugged failures across the workflow',
      'Documented pipeline behavior for the wider data team',
      'Collaborated directly with data engineers and analysts',
    ],
    stack: ['Python', 'SQL', 'ETL/ELT', 'Data Validation'],
  },
  {
    id: 'coi-it',
    role: 'Software Developer Intern',
    org: 'The College of Idaho — IT Department',
    period: 'Summer 2026 – Present',
    summary:
      'Owns front-end and architecture work on the college’s WordPress infrastructure, coordinating directly with campus departments on what gets built and who can touch it.',
    highlights: [
      'Developed and improved front-end experiences on WordPress',
      'Shipped technical fixes across site architecture and plugins',
      'Managed user permissions and access control',
      'Coordinated feature and fix requests with campus departments',
    ],
    stack: ['WordPress', 'Front-end Development', 'Site Architecture'],
  },
]
