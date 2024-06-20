import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCheck,
  ChevronsUpDown,
  Dot,
  Ellipsis,
  LoaderIcon,
  Pencil,
  Plus,
  Trash,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { completeTask } from '@/api/complete-task'
import { deleteComment } from '@/api/delete-comment'
import { editTask } from '@/api/edit-task'
import { Comment, getComments } from '@/api/get-comments'
import { registerComment } from '@/api/register-comment'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { axiosErrorHandler } from '@/utils/axiosErrorHandler'

const newTaskDescriptionForm = z.object({
  description: z.string(),
  taskId: z.number(),
})

const newCommentForm = z.object({
  content: z.string(),
  taskId: z.number(),
})

type NewTaskDescriptionForm = z.infer<typeof newTaskDescriptionForm>
type NewCommentForm = z.infer<typeof newCommentForm>

interface TasksProps {
  content: { id: number; content: string; completed: boolean }
  onToggleComplete: (id: number, completed: boolean) => void
  onDeleteTask: (id: number) => void
}

export function Tasks({ content, onToggleComplete, onDeleteTask }: TasksProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const { id: taskId, content: taskContent, completed } = content

  const {
    register: registerDescription,
    handleSubmit: handleSubmitDescription,
    reset: resetDescription,
  } = useForm<NewTaskDescriptionForm>({
    defaultValues: {
      description: taskContent,
    },
  })

  const {
    register,
    handleSubmit,
    reset: resetComment,
    formState: { isSubmitting },
  } = useForm<NewCommentForm>()

  const {
    data: result,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => getComments({ id: taskId }),
    staleTime: Infinity,
    enabled: false,
  })

  const { mutateAsync: registerCommentFn } = useMutation({
    mutationFn: registerComment,
  })

  const { mutateAsync: editTaskFn } = useMutation({
    mutationFn: editTask,
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

  const { mutateAsync: deleteCommentFn } = useMutation({
    mutationFn: deleteComment,
  })

  function handleCheckboxChange() {
    onToggleComplete(taskId, !completed)
  }

  function handleDeleteTask() {
    onDeleteTask(taskId)
  }

  async function handleCreateNewComment(data: NewCommentForm) {
    try {
      await registerCommentFn({
        content: data.content,
        taskId,
      })

      resetComment() // Limpar textarea ao adicionar tarefa
      refetchComments() // Atualiza a lista de comentários após a criação bem-sucedida do comentário

      toast({
        variant: 'default',
        title: 'Comentários',
        description: 'Comentário adicionado!',
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Comentários',
        description: errorMessage,
      })
    }
  }

  async function handleDeleteComment(commentId: number) {
    try {
      await deleteCommentFn({ commentId })

      refetchComments()

      toast({
        title: 'Comentário',
        description: 'O comentário foi excluído',
      })
    } catch (error) {
      const errorMessage = axiosErrorHandler(error)

      toast({
        variant: 'destructive',
        title: 'Comentário',
        description: errorMessage,
      })
    }
  }

  function handleEditTask() {
    setIsEditing(true)
  }

  async function handleSaveEditTask(data: NewTaskDescriptionForm) {
    try {
      await editTaskFn({
        description: data.description,
        id: taskId,
      })

      resetDescription() // Limpar textarea ao editar tarefa
      setIsEditing(false)

      toast({
        variant: 'default',
        title: 'Tarefas',
        description: 'Tarefa salva!',
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

  async function handleCompleteTask() {
    await completeTaskFn({
      id: taskId,
      completed: true,
    })
  }

  useEffect(() => {
    if (isEditing) {
      resetDescription({ description: taskContent, taskId })
    }
  }, [isEditing, taskContent, taskId, resetDescription])

  return (
    <div className="my-4 block">
      <div
        className={`flex items-center justify-between rounded-md border p-4 ${completed ? '' : 'bg-secondary'}`}
      >
        <div className="flex min-w-5 items-center">
          <Checkbox
            title={`${completed ? 'Desmarcar' : 'Marcar como concluída'}`}
            id={`checkbox-${taskContent}`}
            checked={completed}
            onCheckedChange={handleCheckboxChange}
            className={`mr-4 ${completed ? 'border-green-600 bg-green-600' : 'border-muted-foreground'}`}
          />
          <Label
            htmlFor={`checkbox-${taskContent}`}
            className={`font-medium ${completed ? 'text-green-600 line-through' : ''} overflow-hidden`}
          >
            {taskContent}
          </Label>
        </div>

        <AlertDialog
          onOpenChange={(isOpen) => {
            setIsOpen(isOpen)
            if (isOpen) refetchComments()
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="ghost" title="Apagar tarefa">
              <Ellipsis size={22} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex flex-row items-center justify-between gap-4">
                {isEditing ? (
                  <Textarea
                    {...registerDescription('description')}
                    maxLength={255}
                    className="h-14 w-full resize-none p-4"
                  />
                ) : (
                  taskContent
                )}
                {!completed && (
                  <div className="flex flex-row">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Editar descrição da tarefa"
                        className="mr-2"
                        onClick={handleEditTask}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Salvar descrição da tarefa"
                        className="mr-2"
                        onClick={handleSubmitDescription(handleSaveEditTask)}
                      >
                        <CheckCheck className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      title="Excluir tarefa"
                      onClick={handleDeleteTask}
                    >
                      <Trash className="h-5 w-5 text-rose-500" />
                    </Button>
                  </div>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="flex flex-row items-center justify-between">
                <Label
                  className={`${completed ? 'text-green-500' : 'text-rose-500 '}`}
                >
                  {completed ? 'Tarefa completa!' : 'Tarefa pendente'}
                </Label>
                {!completed && (
                  <Button
                    variant="link"
                    className="-p-1 gap-2 text-green-500"
                    onClick={handleCompleteTask}
                  >
                    Concluir
                    <CheckCheck />
                  </Button>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Comentários:</h4>
                <div>
                  <div className="inline-flex font-medium text-muted-foreground">
                    <span className="mr-2 items-center rounded-sm bg-primary px-3 text-white">
                      {result?.comments.length}
                    </span>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 p-0"
                      title="Expandir/recolher comentários"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              {isLoadingComments ? (
                <div className="flex items-center justify-center">
                  <LoaderIcon className="my-4 h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea>
                  <div className="mr-4 max-h-80 space-y-2">
                    {result?.comments.map((data: Comment) => (
                      <CollapsibleContent key={data.id} className="">
                        <div className="flex h-14 flex-row items-center overflow-hidden rounded-md bg-secondary px-1 py-2 text-sm">
                          <Dot className="text-muted-foreground" />
                          <Label className="whitespace-normal font-normal leading-4">
                            {data.content}
                          </Label>
                          {!completed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto"
                              title="Excluir comentário"
                              onClick={() => handleDeleteComment(data.id)}
                            >
                              <Trash className="h-5 w-5 text-rose-500" />
                            </Button>
                          )}
                        </div>
                      </CollapsibleContent>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Collapsible>

            <Separator />

            <form onSubmit={handleSubmit(handleCreateNewComment)}>
              <div className="grid w-full gap-4">
                <Label htmlFor="comment">Novo comentário</Label>
                <Textarea
                  placeholder="Digite aqui seu novo comentário..."
                  title="Descreva o novo comentário"
                  className="resize-none"
                  id="content"
                  required
                  maxLength={255}
                  disabled={completed}
                  {...register('content')}
                />
              </div>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel onClick={() => setIsEditing(false)}>
                  Cancelar
                </AlertDialogCancel>
                <Button
                  disabled={isSubmitting || completed}
                  type="submit"
                  className="gap-2"
                >
                  <Plus size={20} />
                  Adicionar comentário
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
