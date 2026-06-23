import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from '@/context/AppContext'
import Router from '@/router'
import { Toaster } from 'sonner'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <Router />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '1rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
          },
        }}
      />
    </AppProvider>
  </React.StrictMode>
)
