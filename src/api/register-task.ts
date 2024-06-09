import { api } from '@/lib/axios'

export interface RegisterTaskBody {
  description: string
}

export async function registerTask({ description }: RegisterTaskBody) {
  await api.post('/tasks', { description })
}
