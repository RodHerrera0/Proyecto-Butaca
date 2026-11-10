import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Los estilos globales van antes que App para que los de cada componente los puedan ajustar.
import './estilos/tokens.css'
import './estilos/base.css'
import App from './App.jsx'
import { SesionProvider } from './lib/SesionProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SesionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SesionProvider>
  </StrictMode>,
)
