import { api } from '@/lib/axios'

export interface CompleteTaskQuery {
  id: number
}

export interface CompleteTaskBody {
  completed: boolean
}

export interface CompleteTaskInput
  extends CompleteTaskQuery,
    CompleteTaskBody {}

export async function completeTask({ id, completed }: CompleteTaskInput) {
  await api.put(`/tasks/${id}`, { completed })
}
