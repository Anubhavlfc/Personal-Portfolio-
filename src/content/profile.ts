export const profile = {
  name: 'Anubhav Adhikari',
  location: 'Caldwell, Idaho',

  positioning: 'Building software that makes messy data useful.',
  supporting:
    'Computer Science and Finance student at The College of Idaho. Lately that’s meant ETL pipelines on an enterprise data team, an MCP tool layer for an AI assistant, and the front end and architecture of my college’s WordPress site.',

  email: 'anubhavadhikari0@gmail.com',
  githubUrl: 'https://github.com/Anubhavlfc',

  // TODO: add the real LinkedIn URL — every LinkedIn link stays hidden until set.
  linkedinUrl: '',

  // Drop the real file at /public/resume.pdf — no code change needed once it exists.
  resumeUrl: '/resume.pdf',

  // Drop a photo at /public/portrait.jpg and set this to '/portrait.jpg'.
  // Until then the About section renders a designed monogram instead.
  portraitUrl: '',

  about:
    'I’m a Computer Science and Finance student at The College of Idaho, graduating in May 2027. Most of my work sits between software and data — building ETL pipelines on a data engineering team, shipping front-end and architecture changes on my college’s WordPress infrastructure, and writing AI-assisted tools on my own time. The finance half of my degree is what got me interested in systems where data drives a decision, and that’s still the work I like most: taking messy inputs and getting them into a shape someone can actually use.',

  // Personal details already present elsewhere on the site — nothing new is claimed here.
  outsideOfWork:
    'Away from a terminal I run the college chess club and represent the school as a Chess.com College Ambassador, and I spend a fair amount of time on the budget side of student government.',
} as const

export const isPlaceholderLink = (url: string) => url.trim() === ''
