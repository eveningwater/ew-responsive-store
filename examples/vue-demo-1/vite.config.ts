import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts:["3j9gkg2g-077nf5uk-bni4cos0xqhp.vcb3.mcprev.cn"]
  }
})
