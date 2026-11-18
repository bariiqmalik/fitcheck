import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadClothingAIModel } from './lib/clothingDetector'

// Preload the lightweight vision model in background idle time
preloadClothingAIModel();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
