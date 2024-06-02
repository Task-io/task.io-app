import { api } from '@/lib/axios'

interface UpdateProfileBody {
  id: string
  name: string
  oldPassword: string | null
  newPassword: string | null
}

export async function updateProfile({
  id,
  name,
  oldPassword,
  newPassword,
}: UpdateProfileBody) {
  await api.put(`/users/${id}`, { name, oldPassword, newPassword })
}
