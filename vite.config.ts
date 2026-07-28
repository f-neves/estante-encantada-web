import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Permite abrir pelo IP da rede local (celular no mesmo wi-fi).
    host: true,
  },
  build: {
    outDir: 'dist',
    // Os áudios e capas vivem em public/ e são copiados como estão; nada disso
    // entra no bundle JS.
    assetsInlineLimit: 4096,
  },
});
