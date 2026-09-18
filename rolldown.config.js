import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    input: 'index.js',
    transform: {
      target: 'es2018'
    },
    output: [
      {
        format: 'cjs',
        name: 'xcprinter',
        file: 'dist/index.js'
      },
      {
        format: 'esm',
        file: 'dist/index.mjs'
      }
    ]
  }
])