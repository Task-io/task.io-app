import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getUser } from '@/api/get-user'
// import { getManagedRestaurant } from '@/api/get-managed-restaurant'
import { updateProfile } from '@/api/update-profile'
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { axiosErrorHandler } from '@/utils/axiosErrorHandler'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

const userProfileSchema = z
  .object({
    name: z.string().min(1),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.oldPassword) {
        return data.newPassword?.length > 0
      }
      return true
    },
    {
      message: 'Nova senha é obrigatória se a senha antiga for fornecida',
      path: ['newPassword'],
    },
  )

type UserProfileSchema = z.infer<typeof userProfileSchema>

export function UserProfileSheet() {
  const { toast } = useToast()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: Infinity,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileSchema>({
    resolver: zodResolver(userProfileSchema),
    values: {
      name: user?.name ?? '',
      username: user?.username ?? '',
    },
  })

  const { mutateAsync: updateProfileFn } = useMutation({
    mutationFn: updateProfile,
  })

  async function handleUpdateProfile(data: UserProfileSchema) {
    try {
      await updateProfileFn({
        id: user?.id,
        name: data.name,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })

      toast({
        variant: 'default',
        title: 'Perfil',
        description: 'Perfil atualizado com sucesso!',
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Perfil',
        description: errorMessage,
      })
    }
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Editar perfil</SheetTitle>
        <SheetDescription>
          Faça alterações em seu perfil aqui. Clique em salvar quando terminar.
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit(handleUpdateProfile)}>
        <div className="grid gap-4 py-8">
          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input className="col-span-3" id="name" {...register('name')} />
          </div>

          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              disabled={true}
              className="col-span-3"
              id="username"
              {...register('username')}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor="oldPassword">Senha antiga</Label>
            <Input
              type="password"
              className="col-span-3"
              id="oldPassword"
              {...register('oldPassword')}
            />
          </div>
          {errors.oldPassword && (
            <p className="text-sm text-red-500">{errors.oldPassword.message}</p>
          )}

          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              type="password"
              className="col-span-3"
              id="newPassword"
              {...register('newPassword')}
            />
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isSubmitting}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}
