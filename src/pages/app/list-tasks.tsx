import { Plus } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

export function ListTasks() {
  return (
    <>
      <Helmet title="Início" />
      <div className="p-8">
        <form
          onSubmit={() => null}
          className="flex items-center justify-center gap-4"
        >
          <Textarea
            className="h-14 w-full resize-none p-4"
            placeholder="Adicione uma nova tarefa"
            id="task"
          />

          <Button type="submit" className="h-14 gap-2">
            <Plus size={20} />
            Adicionar
          </Button>
        </form>

        <header className="mb-8 mt-8 flex items-center justify-between">
          <p className="font-medium text-muted-foreground">
            Tarefas criadas{' '}
            <span className="rounded-sm bg-primary px-2 font-bold text-white">
              0
            </span>
          </p>
          <p className="font-medium text-muted-foreground">
            Concluídas{' '}
            <span className="rounded-sm bg-primary px-2 font-bold text-white">
              0
            </span>
          </p>
        </header>

        <Separator />
      </div>
    </>
  )
}
