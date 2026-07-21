export type CssLength = number | string | null | undefined

const NUMERIC_LENGTH = /^-?(?:\d+|\d*\.\d+)$/

export function normalizeCssLength(value: CssLength): string | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number') return Number.isFinite(value) ? `${value}px` : undefined

  const normalized = value.trim()
  if (!normalized) return undefined
  return NUMERIC_LENGTH.test(normalized) ? `${normalized}px` : normalized
}
