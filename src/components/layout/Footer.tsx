export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-ink-faint">© {year} Anubhav Adhikari</p>
        <a href="#top" className="-my-2 py-2 text-sm text-ink-muted transition-colors hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
