import { api } from '@/lib/axios'

export interface SignUpBody {
  name: string
  username: string
  password: string
}

export async function signUp({ name, username, password }: SignUpBody) {
  await api.post('/users', { name, username, password })
}
