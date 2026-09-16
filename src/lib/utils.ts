import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Resolves a file in /public against the deploy base path, so links work
 * both at a domain root (Vercel, a username.github.io site) and under a
 * project path like /Personal-Portfolio-/ on GitHub Pages.
 */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
