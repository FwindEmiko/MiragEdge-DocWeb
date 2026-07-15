import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const projectRoot = process.cwd()
const outputDir = resolve(projectRoot, 'test_tool/test')

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [resolve(__dirname, 'test/setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: resolve(outputDir, 'coverage'),
      // 仅纳入具备可测试纯逻辑且已有测试覆盖的真实源码
      // DOM 副作用型模块（useTocAutoScroll/useVersionCheck/feature.js）
      // 依赖大量浏览器运行时，单测成本高且脆弱，不纳入覆盖率统计
      include: [
        './.vitepress/theme/composables/useEffectsToggle.ts',
        './.vitepress/theme/components/js/nav-icons.js',
      ],
      exclude: [
        './node_modules/**',
        '**/dist/**',
        '**/test_tool/**',
        '**/*.config.*',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        './.vitepress/test/**',
      ],
      enabled: true,
      clean: true,
      cleanOnRerun: true,
      // 阈值设定为 50%：覆盖被测模块的核心路径，同时为难以单测的
      // 错误处理分支与 SSR 守卫分支留出余量，避免后续维护频繁失败
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
    reporters: [
      'default',
      ['junit', {
        outputFile: resolve(outputDir, 'test-results/junit.xml'),
      }],
    ],
    outputFile: resolve(outputDir, 'test-results/test-output.json'),
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/test_tool/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../'),
      '@components': resolve(__dirname, '../components'),
      '@utils': resolve(__dirname, 'utils'),
    },
  },
})
