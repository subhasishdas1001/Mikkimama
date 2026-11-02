import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __MIKKIMAMA_STORE_PROMISE__?: Promise<unknown>;
  }
}

async function bootstrap() {
  if (typeof window !== 'undefined' && window.__MIKKIMAMA_STORE_PROMISE__) {
    try {
      await Promise.race([
        window.__MIKKIMAMA_STORE_PROMISE__,
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } catch {
      // Proceed with fallback state
    }
  }
  createRoot(document.getElementById('root')!).render(<App />);
}

bootstrap();
