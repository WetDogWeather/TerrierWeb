import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
  build: {
    sourcemap: true,
  },
  plugins: [
    viteStaticCopy({ // 'Manually' copies files that aren't bundled into the dist folder.
      targets: [
      ]
    })
  ]
}
