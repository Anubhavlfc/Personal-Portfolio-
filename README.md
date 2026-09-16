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

## Deploying

**GitHub Pages** — automatic. `.github/workflows/deploy.yml` builds and publishes on every push to `main`. One-time setup: in the repo on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The workflow detects whether the repo is a project site (`/<repo>/`) or a user site (`<user>.github.io`) and sets the base path accordingly, so no config change is needed if the repo is renamed.

**Vercel** — also works unchanged; it builds at the domain root.

## Portrait

Drop a photo at `public/portrait.jpg` (roughly 4:5, ~1000px wide is plenty). Nothing else to change — the About section shows it when the file exists and a monogram when it doesn't.

## Content

All copy lives in `src/content/*.ts` — update those files to change what's on the page. Nothing on the site is hardcoded in components.

**Fill in when ready:**

- `src/content/profile.ts` — `linkedinUrl` (LinkedIn links stay hidden until set)
- `src/content/projects.ts` — `caseStudy.reflection` ("What I learned"; the block is hidden while empty), and `githubUrl` / `demoUrl` on any project
- `src/content/notes.ts` — engineering notes; the section shows an empty state until the first entry

**Derived, not authored:** the Proof strip (`src/content/proof.ts`) and the skill-provenance links (`src/lib/skillUsage.ts`) are computed from the experience, project, and education content, so they can't drift from it.
