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

interface Task {
  id: number
  description: string
  completed: boolean
}

interface TasksResponse {
  tasks: Task[]
  meta: {
    pageIndex: number
    perPage: number
    totalCount: number
  }
}

export function ListTasks() {
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const [sortOption, setSortOption] = useState<'toDoFirst' | 'completedFirst'>(
    'toDoFirst',
  )

  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = z.coerce
    .number()
    .transform((page) => page - 1)
    .parse(searchParams.get('page') ?? '1')

  const perPage = 5

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewTaskForm>()

  const { data: result, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', pageIndex, perPage],
    queryFn: () =>
      getTasks({
        pageIndex,
        perPage,
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
      const tasks = queryClient.getQueryData<TasksResponse>(['tasks'])
      if (tasks) {
        const sortedTasks = sortTasks(tasks.tasks, sortOption)
        queryClient.setQueryData(['tasks'], { ...tasks, tasks: sortedTasks })
      }
    },
  })

  const { mutateAsync: deleteTaskFn } = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      const tasks = queryClient.getQueryData<TasksResponse>(['tasks'])
      if (tasks) {
        const sortedTasks = sortTasks(tasks.tasks, sortOption)
        queryClient.setQueryData(['tasks'], { ...tasks, tasks: sortedTasks })
      }
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

  function sortTasks(tasks: Task[], option: 'toDoFirst' | 'completedFirst') {
    return tasks.sort((a, b) => {
      if (option === 'toDoFirst') {
        return Number(a.completed) - Number(b.completed)
      } else {
        return Number(b.completed) - Number(a.completed)
      }
    })
  }

  const sortedTasks = result ? sortTasks(result.tasks, sortOption) : []
  const completedTasksCount = result?.tasks.filter(
    (task) => task.completed,
  ).length

  function handlePaginate(pageIndex: number) {
    setSearchParams((prevState) => {
      prevState.set('page', (pageIndex + 1).toString())

      return prevState
    })
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
            Tarefas criadas{' '}
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {result?.meta.totalCount}
              </span>
            )}
          </div>
          <div className="inline-flex gap-2 text-sm font-medium text-muted-foreground sm:text-base">
            Concluídas{' '}
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {completedTasksCount}{' '}
                {result?.meta.totalCount
                  ? 'de ' + result?.meta.totalCount
                  : null}
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
                <Button title="Ordenar" variant="ghost">
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
                      variant={`${
                        sortOption === 'toDoFirst' ? 'outline' : 'ghost'
                      }`}
                      onClick={() => setSortOption('toDoFirst')}
                    >
                      {sortOption === 'toDoFirst' && (
                        <CheckCheck className="mr-2 h-4 w-4" />
                      )}
                      A fazer
                    </Button>

                    <Button
                      variant={`${
                        sortOption === 'completedFirst' ? 'outline' : 'ghost'
                      }`}
                      onClick={() => setSortOption('completedFirst')}
                    >
                      {sortOption === 'completedFirst' && (
                        <CheckCheck className="mr-2 h-4 w-4" />
                      )}
                      Concluídas
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}

        <div className="mt-4 xl:mt-8">
          {isLoadingTasks ? (
            <div className="flex items-center justify-center">
              <LoaderIcon className="mt-12 h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : result?.tasks.length ? (
            <>
              {sortedTasks.map((task) => {
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
