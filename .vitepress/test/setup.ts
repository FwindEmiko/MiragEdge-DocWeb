import { vi, afterEach, beforeEach } from 'vitest'

// 自动清理
afterEach(() => {
  vi.clearAllMocks()
})

// Mock fetch
global.fetch = vi.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock console 方法
console.error = vi.fn()
console.warn = vi.fn()
console.log = vi.fn()

// 清理所有 mock
beforeEach(() => {
  vi.clearAllMocks()
})