import { isAxiosError } from 'axios'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { Header } from '@/components/header'
import { api } from '@/lib/axios'

export function AppLayout() {
  const navigate = useNavigate()

  // Verifica se o usuário está autenticado
  // Do contrário, redireciona para o login
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error)) {
          const status = error.response?.status
          const url = error.response?.config?.url
          console.log('Erro interceptado:', error) // Log do erro para depuração
          console.log('Status:', status) // Log do status para depuração
          console.log('URL:', url) // Log da URL para depuração

          if (status === 401) {
            console.log('Redirecionando para /sign-in') // Log para confirmar o redirecionamento
            navigate('/sign-in', { replace: true })
          } else {
            throw error
          }
        } else {
          console.log('Erro não reconhecido pelo Axios:', error)
        }
      },
    )

    return () => api.interceptors.response.eject(interceptorId)
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col antialiased">
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-8 pt-6">
        <Outlet />
      </div>
    </div>
  )
}
