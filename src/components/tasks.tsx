import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, Dot, Ellipsis, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { deleteComment } from '@/api/delete-comment'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { axiosErrorHandler } from '@/utils/axiosErrorHandler'

const newCommentForm = z.object({
  content: z.string(),
  taskId: z.number(),
})

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

  const { id: taskId, content: taskContent, completed } = content

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewCommentForm>()

  const {
    data: result,
    isLoading: isLoadingTasks,
    refetch,
  } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => getComments({ id: taskId }),
    staleTime: Infinity,
    enabled: false,
  })

  const { mutateAsync: registerCommentFn } = useMutation({
    mutationFn: registerComment,
  })

  const { mutateAsync: deleteCommentFn } = useMutation({
    mutationFn: deleteComment,
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries(['comments', taskId])

      const previousComments = queryClient.getQueryData(['comments', taskId])

      queryClient.setQueryData(['comments', taskId], (old: any) => ({
        ...old,
        comments: old.comments.filter(
          (comment: Comment) => comment.id !== commentId,
        ),
      }))

      return { previousComments }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['comments', taskId], context.previousComments)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['comments', taskId])
    },
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

      // Limpar textarea ao adicionar tarefa
      reset()

      // Atualiza a lista de comentários após a criação bem-sucedida do comentário
      refetch()

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
            className={`font-medium ${completed ? 'text-green-600 line-through' : ''}`}
          >
            {taskContent}
          </Label>
        </div>

        <AlertDialog
          onOpenChange={(isOpen) => {
            setIsOpen(isOpen)
            if (isOpen) refetch()
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="ghost" title="Apagar tarefa">
              <Ellipsis size={22} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex flex-row items-center justify-between">
                {taskContent}
                <Button
                  variant="outline"
                  size="sm"
                  title="Excluir tarefa"
                  onClick={handleDeleteTask}
                >
                  <Trash className="h-5 w-5 text-rose-500" />
                </Button>
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`${completed ? 'text-green-500' : 'text-rose-500'}`}
              >
                {completed ? 'Tarefa completa' : 'Tarefa a fazer'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Comentários:</h4>
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
              {result?.comments.map((data: Comment) => {
                return (
                  <CollapsibleContent key={data.id} className="space-y-2">
                    <div className="flex flex-row items-center rounded-md bg-secondary px-1 py-2 text-sm">
                      <Dot className="text-muted-foreground" /> {data.content}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        title="Excluir comentário"
                        onClick={() => handleDeleteComment(data.id)}
                      >
                        <Trash className="h-5 w-5 text-rose-500" />
                      </Button>
                    </div>
                  </CollapsibleContent>
                )
              })}
            </Collapsible>

            <Separator />

            <>
              <form onSubmit={handleSubmit(handleCreateNewComment)}>
                <div className="grid w-full gap-4">
                  <Label htmlFor="comment">Novo comentário</Label>
                  <Textarea
                    placeholder="Digite aqui seu novo comentário..."
                    title="Descreva o novo comentário"
                    className="resize-none"
                    id="content"
                    required
                    {...register('content')}
                  />
                </div>

                <AlertDialogFooter className="mt-8">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="gap-2"
                  >
                    <Plus size={20} />
                    Adicionar comentário
                  </Button>
                </AlertDialogFooter>
              </form>
            </>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
