import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'server/services/**',
        'server/utils/**',
        'server/routes/**',
        'app/components/**',
        'app/pages/checkout.vue',
        'app/composables/**',
        'app/utils/**'
      ],
      exclude: [
        'app/components/AppHeader.vue',
        'app/app.vue',
        'app/pages/index.vue',
        '**/*.css',
        'server/data/**',
        'shared/types.ts',
        '**/*.d.ts',
        'node_modules/**',
        '.nuxt/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
          setupFiles: ['test/unit/setup.ts']
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
