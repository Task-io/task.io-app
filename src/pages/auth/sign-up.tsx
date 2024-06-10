import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { signUp } from '@/api/sign-up'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { axiosErrorHandler } from '@/utils/axiosErrorHandler'

const signUpForm = z.object({
  name: z.string().min(3, { message: 'Digite o nome completo.' }),
  username: z
    .string()
    .min(3, { message: 'O nome de usuário deve ter no mínimo 3 caracteres.' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'O nome de usuário deve conter apenas letras.',
    }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    .regex(/[A-Z]/, {
      message: 'A senha deve conter pelo menos uma letra maiúscula.',
    })
    .regex(/[0-9]/, { message: 'A senha deve conter pelo menos um número.' }),
})

type SignUpForm = z.infer<typeof signUpForm>

export function SignUp() {
  const navigate = useNavigate()

  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpForm),
  })

  const { mutateAsync: registerUser } = useMutation({
    mutationFn: signUp,
  })

  async function handleSignUp(user: SignUpForm) {
    try {
      await registerUser({
        name: user.name,
        username: user.username,
        password: user.password,
      })

      toast({
        variant: 'default',
        title: 'Criar conta',
        description: 'Conta criada! Entre agora',
        action: <ToastAction altText="Fazer login">Fazer login</ToastAction>,
        onClick: () => navigate('/sign-in'),
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Criar conta',
        description: errorMessage,
      })
    }
  }

  return (
    <>
      <Helmet title="Cadastro" />

      <div className="p-8">
        <div className="absolute right-8 top-8 flex flex-row items-center">
          <p className="text-sm">Já possui conta?</p>
          <Button asChild variant="link">
            <Link to="/sign-in">Fazer login</Link>
          </Button>
        </div>

        <div className="flex w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Será ótimo tê-lo conosco!
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" type="text" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Seu usuário</Label>
              <Input id="username" type="text" {...register('username')} />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sua senha</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <>
                  <p className="text-sm text-red-500">
                    A senha deve ter no mínimo 6 caracteres, conter pelo menos
                    uma letra maiúscula e pelo menos um número.
                  </p>
                </>
              )}
            </div>

            <Button disabled={isSubmitting} className="w-full" type="submit">
              Finalizar cadastro
            </Button>

            <p className="px-6 text-center text-sm leading-relaxed text-muted-foreground">
              Ao continuar, você concorda com nossos{' '}
              <a href="" className="underline underline-offset-4">
                termos de serviço
              </a>{' '}
              e{' '}
              <a href="" className="underline underline-offset-4">
                políticas de privacidade
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
