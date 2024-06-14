import { api } from '@/lib/axios'

export interface DeleteCommentQuery {
  commentId: number
}

export interface DeleteCommentInput extends DeleteCommentQuery {}

export async function deleteComment({ commentId }: DeleteCommentInput) {
  await api.delete(`/comments/${commentId}`)
}
