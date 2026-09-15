# Anubhav Adhikari — Portfolio

Personal portfolio site. Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content

All copy lives in `src/content/*.ts` — update those files to change what's on the page. Nothing on the site is hardcoded in components.

**Fill in when ready:**

- `src/content/profile.ts` — `linkedinUrl` (LinkedIn links stay hidden until set) and `portraitUrl` (drop a photo at `public/portrait.jpg` and set to `/portrait.jpg`; a monogram renders until then)
- `src/content/projects.ts` — `caseStudy.reflection` ("What I learned"; the block is hidden while empty), and `githubUrl` / `demoUrl` on any project
- `src/content/notes.ts` — engineering notes; the section shows an empty state until the first entry

**Derived, not authored:** the Proof strip (`src/content/proof.ts`) and the skill-provenance links (`src/lib/skillUsage.ts`) are computed from the experience, project, and education content, so they can't drift from it.
