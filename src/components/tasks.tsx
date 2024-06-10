import { Trash } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
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
import { Label } from '@/components/ui/label'
// import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

interface TasksProps {
  content: { id: number; content: string; completed: boolean }
  onDeleteTask: (task: string, completed: boolean) => void
  onToggleComplete: (id: number, completed: boolean) => void
}

export function Tasks({ content, onDeleteTask, onToggleComplete }: TasksProps) {
  const { toast } = useToast()

  const { id: taskId, content: taskContent, completed } = content

  // function handleDeleteTask() {
  //   toast({
  //     title: 'Tarefa',
  //     description: 'A tarefa foi excluída',
  //     // action: <ToastAction altText="Desfazer">Desfazer</ToastAction>,
  //   })

  //   onDeleteTask(taskContent, completed)
  // }

  function handleCheckboxChange() {
    onToggleComplete(taskId, !completed)
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" title="Apagar tarefa">
              <Trash className="text-rose-500" size={22} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar tarefa?</AlertDialogTitle>
              <AlertDialogDescription>
                Sua tarefa será removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={
                  () => null
                  // handleDeleteTask
                }
              >
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
