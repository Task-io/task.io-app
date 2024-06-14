import { api } from '@/lib/axios'

export interface Comment {
  id: number
  content: string
  userId: number
  taskId: number
  createdAt: Date
  updatedAt: Date
}

export interface GetCommentsQuery {
  id: number
}

export interface GetCommentsResponse {
  comments: Comment[]
}

export async function getComments({ id }: GetCommentsQuery) {
  const response = await api.get(`/comments/${id}`)

  return response.data
}
