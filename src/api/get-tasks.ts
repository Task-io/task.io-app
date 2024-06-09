import { api } from '@/lib/axios'

export interface GetTasksResponse {
  tasks: {
    id: number
    description: string
    userId: number
    completed: boolean
    createdAt: Date
    updatedAt: Date
  }[]
}

export async function getTasks() {
  const response = await api.get<GetTasksResponse>(`/tasks/my`)

  return response.data
}
