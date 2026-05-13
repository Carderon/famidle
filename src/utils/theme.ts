const STORAGE_KEY = 'famidle-theme'

export function initThemeFromStorage(): void {
  const saved = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null
  const dark =
    saved === 'dark' ? true : saved === 'light' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
}

export function setDarkMode(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}
