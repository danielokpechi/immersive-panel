import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages project path:
//   https://<user>.github.io/immersive-panel/
// Override with BASE_PATH env for a different repo/host (e.g. "/" for a
// custom domain or local preview).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/immersive-panel/',
  plugins: [react()],
})
