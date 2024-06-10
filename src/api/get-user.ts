import { api } from '@/lib/axios'

export interface GetUserResponse {
  id: number
  name: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export async function getUser() {
  const response = await api.get<GetUserResponse>(`/users/me`)

  return response.data
}
