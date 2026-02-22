import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/assets': 'http://localhost:5000',
            '/risk': 'http://localhost:5000'
        }
    }
})
