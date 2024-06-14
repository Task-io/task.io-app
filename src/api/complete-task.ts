import { api } from '@/lib/axios'

export interface CompleteTaskQuery {
  id: number
}

export interface CompleteTaskResponse {
  completed: boolean
}

export interface CompleteTaskInput
  extends CompleteTaskQuery,
    CompleteTaskResponse {}

export async function completeTask({ id, completed }: CompleteTaskInput) {
  await api.put(`/tasks/${id}`, { completed })
}
