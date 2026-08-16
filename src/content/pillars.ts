export type Pillar = {
  index: string
  title: string
  description: string
}

export const pillars: Pillar[] = [
  {
    index: '01',
    title: 'Software',
    description: 'Building applications, systems, and technical solutions.',
  },
  {
    index: '02',
    title: 'Data & AI',
    description: 'Transforming raw data into useful information and intelligent decisions.',
  },
  {
    index: '03',
    title: 'Finance',
    description: 'Understanding financial systems, analysis, budgeting, and business context.',
  },
]

export const pillarsIntro = {
  eyebrow: 'Why me',
  lead: "I don't only build software.",
  body: 'I understand the data behind it. I understand the business and financial context around it.',
}
