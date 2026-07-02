import { describe, it, expect, vi } from 'vitest'

// 示例工具函数 - 日期格式化
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

// 示例工具函数 - 字符串处理
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// 示例工具函数 - 验证邮箱格式
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 示例工具函数 - 生成随机ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 示例组件方法
export const ExampleComponentMethods = {
  // 计算两个数字的和
  addNumbers(a: number, b: number): number {
    return a + b
  },

  // 格式化字符串
  formatString(str: string, prefix: string = ''): string {
    return `${prefix}${str.trim().toUpperCase()}`
  },

  // 异步获取数据
  async fetchData(url: string): Promise<any> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  // 数组去重
  uniqueArray<T>(arr: T[]): T[] {
    return [...new Set(arr)]
  },

  // 深度合并对象
  deepMerge(target: any, source: any): any {
    const output = { ...target }
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = this.deepMerge(target[key], source[key])
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    
    return output
  }
}

// 辅助函数：检查是否为对象
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

describe('工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('2024/1/15')
    })

    it('应该处理字符串日期', () => {
      expect(formatDate('2024-01-15')).toBe('2024/1/15')
    })
  })

  describe('truncateString', () => {
    it('应该截断超过最大长度的字符串', () => {
      expect(truncateString('Hello World', 5)).toBe('Hello...')
    })

    it('不应该截断不超过最大长度的字符串', () => {
      expect(truncateString('Hello', 10)).toBe('Hello')
    })

    it('应该正确处理空字符串', () => {
      expect(truncateString('', 5)).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('generateId', () => {
    it('应该生成带有前缀的ID', () => {
      const id = generateId('user')
      expect(id.startsWith('user_')).toBe(true)
    })

    it('应该生成唯一的ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })
})

describe('组件方法测试', () => {
  describe('addNumbers', () => {
    it('应该正确计算两个数字的和', () => {
      expect(ExampleComponentMethods.addNumbers(2, 3)).toBe(5)
      expect(ExampleComponentMethods.addNumbers(-1, 1)).toBe(0)
      expect(ExampleComponentMethods.addNumbers(0, 0)).toBe(0)
    })
  })

  describe('formatString', () => {
    it('应该格式化字符串为大写', () => {
      expect(ExampleComponentMethods.formatString('hello')).toBe('HELLO')
      expect(ExampleComponentMethods.formatString('  world  ')).toBe('WORLD')
    })

    it('应该添加前缀', () => {
      expect(ExampleComponentMethods.formatString('test', 'prefix-')).toBe('prefix-TEST')
    })
  })

  describe('fetchData', () => {
    it('应该成功获取数据', async () => {
      const mockData = { id: 1, name: 'Test' }
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData)
      }
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

      const result = await ExampleComponentMethods.fetchData('https://api.example.com/data')
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data')
    })

    it('应该在HTTP错误时抛出异常', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

      await expect(ExampleComponentMethods.fetchData('https://api.example.com/not-found'))
        .rejects
        .toThrow('HTTP error! status: 404')
    })
  })

  describe('uniqueArray', () => {
    it('应该对数组去重', () => {
      expect(ExampleComponentMethods.uniqueArray([1, 2, 2, 3])).toEqual([1, 2, 3])
      expect(ExampleComponentMethods.uniqueArray(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })

    it('应该处理空数组', () => {
      expect(ExampleComponentMethods.uniqueArray([])).toEqual([])
    })
  })

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: { d: 3 }, e: 4 }
      
      const result = ExampleComponentMethods.deepMerge(target, source)
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
    })

    it('应该处理非对象合并', () => {
      const target = { a: 1 }
      const source = { a: 2, b: 3 }
      
      const result = ExampleComponentMethods.deepMerge(target, source)
      expect(result).toEqual({ a: 2, b: 3 })
    })
  })
})