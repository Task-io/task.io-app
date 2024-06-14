import { api } from '@/lib/axios'

export interface DeleteTaskQuery {
  id: number
}

export interface DeleteTaskInput extends DeleteTaskQuery {}

export async function deleteTask({ id }: DeleteTaskInput) {
  await api.delete(`/tasks/${id}`)
}
