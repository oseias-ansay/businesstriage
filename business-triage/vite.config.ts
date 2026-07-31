import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Em desenvolvimento, as chamadas para /n8n/* são encaminhadas pelo servidor do
 * Vite até a instância do n8n. Como o navegador passa a conversar apenas com
 * localhost, não há requisição entre origens — e portanto não há CORS nem
 * preflight. Isso evita precisar liberar o localhost no servidor.
 *
 * Em produção o proxy não existe: o build usa as URLs completas definidas em
 * .env.production, e o CORS do n8n já autoriza https://businesstriage.com.br.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/n8n': {
        target: 'https://n8n.businesstriage.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/n8n/, '/webhook'),
      },
    },
  },
});
