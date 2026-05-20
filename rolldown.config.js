import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    input: 'index.js',
    output: [
      {
        format: 'umd',
        // UMD builds require a global name so consumers can access exports
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