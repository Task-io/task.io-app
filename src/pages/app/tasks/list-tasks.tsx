import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardX, LoaderIcon, Plus } from 'lucide-react'
import { ChangeEvent, FormEvent, InvalidEvent, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getTasks } from '@/api/get-tasks'
import { registerTask } from '@/api/register-task'
import { Tasks } from '@/components/tasks'
import { TotalizerSkeleton } from '@/components/totalizer-skeleton'
import { Button } from '@/components/ui/button'
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewTaskForm>()

  const { data: result, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    staleTime: Infinity,
  })

  const { mutateAsync: registerTaskFn } = useMutation({
    mutationFn: registerTask,
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
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

  // async function handleToggleComplete() {
  // }

  const completedTasksCount = result?.tasks.filter(
    (task) => task.completed,
  ).length

  return (
    <>
      <Helmet title="Início" />
      <div className="px-12 py-8 md:px-40">
        <form
          onSubmit={handleSubmit(handleCreateNewTask)}
          className="flex items-center justify-center gap-4"
        >
          <Textarea
            title="Descreva a tarefa para adicionar"
            className="h-14 w-full resize-none p-4"
            placeholder="Adicione uma nova tarefa"
            id="task"
            // value={newTaskText}
            // onChange={handleNewTaskChange}
            // onInvalid={handleNewTaskInvalid}
            required
            {...register('description')}
          />

          <Button
            disabled={isSubmitting}
            type="submit"
            title="Adicionar tarefa"
            className="h-14 gap-2"
          >
            <Plus size={20} />
            Adicionar
          </Button>
        </form>

        <header className="mb-8 mt-8 flex items-center justify-between">
          <div className="inline-flex gap-2 font-medium text-muted-foreground">
            Tarefas criadas{' '}
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {result?.tasks.length}
              </span>
            )}
          </div>
          <div className="inline-flex gap-2 font-medium text-muted-foreground">
            Concluídas{' '}
            {isLoadingTasks ? (
              <TotalizerSkeleton />
            ) : (
              <span className="items-center rounded-sm bg-primary px-3 text-white">
                {completedTasksCount}{' '}
                {result?.tasks.length ? 'de ' + result?.tasks.length : null}
              </span>
            )}
          </div>
        </header>

        {result?.tasks.length ? <Separator /> : null}

        <div className="mt-8 ">
          {isLoadingTasks ? (
            <div className="flex items-center justify-center">
              <LoaderIcon className="mt-12 h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : result?.tasks.length ? (
            <>
              {result?.tasks.map((task) => {
                return (
                  <Tasks
                    key={`${task.id}`}
                    content={{
                      taskId: task.id,
                      content: task.description,
                      completed: task.completed,
                    }}
                    // onDeleteTask={deleteTask}
                    // onToggleComplete={handleToggleComplete}
                  />
                )
              })}
            </>
          ) : (
            <div className="flex flex-col items-center">
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
