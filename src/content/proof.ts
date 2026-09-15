import { experience } from './experience'
import { education } from './education'
import { financeSpotlight, leadership } from './leadership'
import { projects } from './projects'

export type ProofItem = {
  value: string
  label: string
  detail: string
}

const gradtrack = projects.find((p) => p.id === 'gradtrack-ai')

/**
 * Every figure here is read from the content it describes, so the strip can't
 * drift from the rest of the site. Nothing is estimated.
 */
export const proof: ProofItem[] = [
  {
    value: '10',
    label: 'MCP tools shipped',
    detail: gradtrack ? `The tool layer behind ${gradtrack.title}` : 'GradTrack AI tool layer',
  },
  {
    value: `${financeSpotlight.eventCount}+`,
    label: 'Student events budgeted',
    detail: `As ${financeSpotlight.role}`,
  },
  {
    value: String(experience.length),
    label: 'Engineering internships',
    detail: 'Data engineering and software development',
  },
  {
    value: String(education.degrees.length),
    label: 'Degrees in progress',
    detail: `${education.degrees.join(' and ')}, ${education.graduation.replace('Expected ', '')}`,
  },
  {
    value: String(leadership.length + 1),
    label: 'Leadership roles',
    detail: 'Student government, campus organizations, and campus safety',
  },
]
