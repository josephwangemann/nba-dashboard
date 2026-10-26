import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { persistOptions } from './queryPersistence'
import { queryClient } from './queries'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
