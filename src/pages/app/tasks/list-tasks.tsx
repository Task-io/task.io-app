import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownUp,
  CheckCheck,
  ClipboardX,
  LoaderIcon,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { completeTask } from '@/api/complete-task'
import { deleteTask } from '@/api/delete-task'
import { getTasks } from '@/api/get-tasks'
import { registerTask } from '@/api/register-task'
import { Tasks } from '@/components/tasks'
import { TotalizerSkeleton } from '@/components/totalizer-skeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { axiosErrorHandler } from '@/utils/axiosErrorHandler'

const newTaskForm = z.object({
  description: z.string(),
})

type NewTaskForm = z.infer<typeof newTaskForm>

export function ListTasks() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()

  const [sort, setSort] = useState('toDo')
  const [perPage, setPerPage] = useState(5)

  const pageIndex = z.coerce
    .number()
    .transform((page) => page - 1)
    .parse(searchParams.get('page') ?? '1')

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewTaskForm>()

  const { data: result, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', pageIndex, perPage, sort],
    queryFn: () =>
      getTasks({
        pageIndex,
        perPage,
        sort,
      }),
    staleTime: Infinity,
  })

  const { mutateAsync: registerTaskFn } = useMutation({
    mutationFn: registerTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { mutateAsync: completeTaskFn } = useMutation({
    mutationFn: completeTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { mutateAsync: deleteTaskFn } = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  async function handleCreateNewTask(data: NewTaskForm) {
    try {
      await registerTaskFn({
        description: data.description,
      })

      // Limpar textarea ao adicionar tarefa
      reset()

      toast({
        variant: 'default',
        title: 'Tarefas',
        description: 'Tarefa adicionada!',
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Tarefas',
        description: errorMessage,
      })
    }
  }

  async function handleToggleComplete(id: number, completed: boolean) {
    await completeTaskFn({
      id,
      completed,
    })
  }

  async function handleDeleteTask(id: number) {
    try {
      await deleteTaskFn({
        id,
      })

      toast({
        title: 'Tarefa',
        description: 'A tarefa foi excluída',
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Tarefa',
        description: errorMessage,
      })
    }
  }

  function handlePaginate(pageIndex: number) {
    setSearchParams((prevState) => {
      prevState.set('page', (pageIndex + 1).toString())

      return prevState
    })
  }

  function handlePerPageChange(newPerPage: number) {
    setPerPage(newPerPage)
    handlePaginate(0)
  }

  return (
    <>
      <Helmet title="Início" />
      <div className="lg:px-40 lg:py-6 xl:px-60 xl:py-8">
        <form
          onSubmit={handleSubmit(handleCreateNewTask)}
          className="flex items-center justify-center gap-4"
        >
          <Textarea
            title="Descreva a tarefa para adicionar"
            className="h-14 w-full resize-none p-4"
            placeholder="Adicione uma nova tarefa"
            id="task"
            required
            maxLength={255}
            {...register('description')}
          />

          <Button
            disabled={isSubmitting}
            type="submit"
            title="Adicionar tarefa"
            className="h-14 gap-2 p-5"
          >
            <Plus size={20} />
            <Label className="hidden sm:inline">Adicionar</Label>
          </Button>
        </form>

        <header className="mt-6 flex items-center justify-between xl:mt-8">
          <div className="inline-flex gap-2 text-sm font-medium text-muted-foreground sm:text-base">
            Tarefas criadas
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {result?.meta.totalCount ?? 0}
              </span>
            )}
          </div>
          <div className="inline-flex gap-2 text-sm font-medium text-muted-foreground sm:text-base">
            Concluídas
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {result?.meta.completedTotalCount ?? 0}
              </span>
            )}
          </div>
        </header>

        {result?.tasks.length ? (
          <div className="mt-4 flex items-center justify-between xl:mt-8">
            <div className="flex-grow">
              <Separator className="w-[calc(100%-8px)]" />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button title="Ordenar" size="icon" variant="ghost">
                  <ArrowDownUp />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Ordenação</h4>
                    <p className="text-sm text-muted-foreground">
                      Ordenar por:
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant={`${sort === 'toDo' ? 'outline' : 'ghost'}`}
                      onClick={() => setSort('toDo')}
                    >
                      {sort === 'toDo' && (
                        <CheckCheck className="mr-2 h-4 w-4" />
                      )}
                      A fazer
                    </Button>
                    <Button
                      variant={`${sort === 'completed' ? 'outline' : 'ghost'}`}
                      onClick={() => setSort('completed')}
                    >
                      {sort === 'completed' && (
                        <CheckCheck className="mr-2 h-4 w-4" />
                      )}
                      Concluídas
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Tarefas por página:
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant={`${perPage === 5 ? 'outline' : 'ghost'}`}
                        className="h-8 w-8 p-0"
                        onClick={() => handlePerPageChange(5)}
                      >
                        5<span className="sr-only">5</span>
                      </Button>

                      <Button
                        variant={`${perPage === 15 ? 'outline' : 'ghost'}`}
                        className="h-8 w-8 p-0"
                        onClick={() => handlePerPageChange(15)}
                      >
                        15
                        <span className="sr-only">15</span>
                      </Button>

                      <Button
                        variant={`${perPage === 30 ? 'outline' : 'ghost'}`}
                        className="h-8 w-8 p-0"
                        onClick={() => handlePerPageChange(30)}
                      >
                        30
                        <span className="sr-only">30</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}

        <div className="mt-4 xl:mt-8">
          {isLoadingTasks ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : result?.tasks.length ? (
            <>
              {result?.tasks.map((task) => {
                return (
                  <Tasks
                    key={`${task.id}`}
                    content={{
                      id: task.id,
                      content: task.description,
                      completed: task.completed,
                    }}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                  />
                )
              })}
              <Pagination
                onPageChange={handlePaginate}
                pageIndex={result.meta.pageIndex}
                totalCount={result.meta.totalCount}
                perPage={result.meta.perPage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <ClipboardX className="mt-12 h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-semibold leading-7">
                Você ainda não tem tarefas cadastradas
              </p>
              <span>Crie tarefas e organize seus itens a fazer</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
