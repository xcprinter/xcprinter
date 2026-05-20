import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    input: 'index.js',
    output: [
      {
        format: 'umd',
        file: 'dist/index.js'
      },
      {
        format: 'esm',
        file: 'dist/index.mjs'
      }
    ]
  }
])