import { useMutation } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { signIn } from '@/api/sign-in'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

const signInForm = z.object({
  username: z.string(),
  password: z.string(),
})

type SignInForm = z.infer<typeof signInForm>

export function SignIn() {
  const navigate = useNavigate()

  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>()

  const { mutateAsync: authenticate } = useMutation({
    mutationFn: signIn,
  })

  async function handleSignIn(user: SignInForm) {
    try {
      await authenticate({
        username: user.username,
        password: user.password,
      })

      navigate('/', { replace: true })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Acessar.',
        description: 'Credenciais inválidas.',
      })
    }
  }

  return (
    <>
      <Helmet title="Login" />

      <div className="p-8">
        <div className="flex w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Acessar</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe suas tarefas e ganhe tempo!
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Seu usuário</Label>
              <Input id="username" type="text" {...register('username')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sua senha</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>

            <Button disabled={isSubmitting} className="w-full" type="submit">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
