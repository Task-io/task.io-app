import './global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { queryClient } from '@/lib/react-query'
import { router } from '@/routes'

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="sistema" storageKey="taskio-theme">
        <Helmet titleTemplate="%s | Task.io" />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />

          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
