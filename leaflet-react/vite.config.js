import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({ // 'Manually' copies files that aren't bundled into the dist folder.
      targets: [
        {
          src: 'WhirlyGlobeWeb.js',
          dest: ''
        },
        {
          src: 'WhirlyGlobeWeb.wasm',
          dest: ''
        }
      ]
    })
  ],  
})
