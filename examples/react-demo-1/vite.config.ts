import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts:['l3e5pxg0-zpcjdabc-klbk9ra8l6g1.vcb3.mcprev.cn']
  }
})
