export const profile = {
  name: 'Anubhav Adhikari',
  location: 'Caldwell, Idaho',
  headline: 'Building intelligent systems at the intersection of software, data, AI, and finance.',
  subheadline:
    'Computer Science and Finance student building data-driven software, AI applications, and intelligent systems.',
  email: 'anubhavadhikari0@gmail.com',

  // TODO: replace with real profile URLs when ready. Until then these render
  // as normal styled links pointing nowhere (data-placeholder is used by
  // components to add a "coming soon" affordance without a build change).
  githubUrl: '',
  linkedinUrl: '',

  // Drop the real file at /public/resume.pdf — no code change needed once it exists.
  resumeUrl: '/resume.pdf',
} as const

export const isPlaceholderLink = (url: string) => url.trim() === ''
