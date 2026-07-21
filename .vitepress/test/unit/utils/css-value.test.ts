import { describe, expect, it } from 'vitest'
import { normalizeCssLength } from '../../../theme/utils/cssValue'

describe('normalizeCssLength', () => {
  it('数字与纯数字字符串应追加 px', () => {
    expect(normalizeCssLength(48)).toBe('48px')
    expect(normalizeCssLength('48')).toBe('48px')
    expect(normalizeCssLength('0.5')).toBe('0.5px')
  })

  it('合法 CSS 长度应原样保留', () => {
    expect(normalizeCssLength('50%')).toBe('50%')
    expect(normalizeCssLength('12rem')).toBe('12rem')
    expect(normalizeCssLength('auto')).toBe('auto')
    expect(normalizeCssLength('calc(100% - 2rem)')).toBe('calc(100% - 2rem)')
  })

  it('空值和非有限数字应忽略', () => {
    expect(normalizeCssLength(null)).toBeUndefined()
    expect(normalizeCssLength('  ')).toBeUndefined()
    expect(normalizeCssLength(Number.NaN)).toBeUndefined()
  })
})
