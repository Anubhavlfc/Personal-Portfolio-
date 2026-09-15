import { experience } from '@/content/experience'
import { projects } from '@/content/projects'

export type SkillSource = {
  kind: 'experience' | 'project'
  title: string
  context: string
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Additional links the stack arrays don't capture but the written content
 * already states outright. Nothing here is a claim the site doesn't make
 * elsewhere — each maps to a highlight or contribution line.
 */
const fromProse: Record<string, string[]> = {
  'Data transformation': ['oppenheimer'],
  'Pipeline documentation': ['oppenheimer'],
  'Model training & evaluation': ['recruitment-analytics'],
  'AI application development': ['gradtrack-ai'],
  'Git / GitHub': ['gradtrack-ai'],
}

const sourcesById = new Map<string, SkillSource>()
const byNormalizedSkill = new Map<string, Set<string>>()

const register = (id: string, source: SkillSource, stack: string[]) => {
  sourcesById.set(id, source)
  for (const item of stack) {
    const key = normalize(item)
    if (!byNormalizedSkill.has(key)) byNormalizedSkill.set(key, new Set())
    byNormalizedSkill.get(key)!.add(id)
  }
}

for (const entry of experience) {
  register(entry.id, { kind: 'experience', title: entry.org, context: entry.role }, entry.stack)
}

for (const project of projects) {
  register(project.id, { kind: 'project', title: project.title, context: 'Project' }, project.stack)
}

export function getSkillSources(skill: string): SkillSource[] {
  const ids = new Set(byNormalizedSkill.get(normalize(skill)) ?? [])
  for (const id of fromProse[skill] ?? []) ids.add(id)

  return [...ids]
    .map((id) => sourcesById.get(id))
    .filter((s): s is SkillSource => s !== undefined)
}
