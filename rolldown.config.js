import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    input: 'index.js',
    output: [
      {
        format: 'umd',
        // UMD builds require a global name so consumers can access exports
        name: 'xcprinter',
        file: 'dist/index.js',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/index.mjs',
        sourcemap: true
      }
    ]
  }
])