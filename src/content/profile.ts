export const profile = {
  name: 'Anubhav Adhikari',
  location: 'Caldwell, Idaho',
  headline: 'Computer Science and Finance student building software and data systems.',
  subheadline:
    'I work on data pipelines, AI-assisted applications, and web development. Currently looking for software engineering and data engineering internships.',
  email: 'anubhavadhikari0@gmail.com',

  githubUrl: 'https://github.com/Anubhavlfc',

  // TODO: add the real LinkedIn URL — renders with a "coming soon" state until set.
  linkedinUrl: '',

  // Drop the real file at /public/resume.pdf — no code change needed once it exists.
  resumeUrl: '/resume.pdf',

  about:
    'I’m a Computer Science and Finance student at The College of Idaho, graduating in May 2027. Most of my work sits between software and data — building ETL pipelines on a data engineering team, shipping front-end and architecture changes on my college’s WordPress infrastructure, and writing AI-assisted tools on my own time. The finance half of my degree is what got me interested in systems where the data actually drives a decision. I’m looking for software engineering and data engineering internships.',
} as const

export const isPlaceholderLink = (url: string) => url.trim() === ''
