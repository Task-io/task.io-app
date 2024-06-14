import { api } from '@/lib/axios'

export interface RegisterCommentBody {
  content: string
  taskId: number
}

// Ensure this function is exported so it can be imported in other files
export async function registerComment({
  content,
  taskId,
}: RegisterCommentBody) {
  await api.post('/comments', { content, taskId })
}
