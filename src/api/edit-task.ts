import { api } from '@/lib/axios'

export interface EditTaskQuery {
  id: number
}

export interface EditTaskResponse {
  description: string
}

export interface EditTaskInput extends EditTaskQuery, EditTaskResponse {}

export async function editTask({ id, description }: EditTaskInput) {
  await api.put(`/tasks/${id}`, { description })
}
