import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRoot } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRoot>
        <App />
      </BrowserRoot>
  </StrictMode>,
)
