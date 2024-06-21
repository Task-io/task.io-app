import { api } from '@/lib/axios'

interface GetTasksQuery {
  pageIndex?: number | null
  perPage?: number | null
}

export interface GetTasksResponse {
  tasks: {
    id: number
    description: string
    userId: number
    completed: boolean
    createdAt: Date
    updatedAt: Date
  }[]
  meta: {
    pageIndex: number
    perPage: number
    totalCount: number
  }
}

export async function getTasks({ pageIndex = 0, perPage }: GetTasksQuery) {
  const response = await api.get<GetTasksResponse>(`/tasks/my`, {
    params: {
      page: pageIndex !== null ? pageIndex + 1 : undefined,
      limit: perPage,
    },
  })

  return response.data
}
