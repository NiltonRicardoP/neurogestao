"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteAssessmentModel } from "@/app/actions/delete-assessment-model"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface DeleteModelDialogProps {
  modelId: string
  modelName: string
}

export function DeleteModelDialog({ modelId, modelName }: DeleteModelDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteAssessmentModel(modelId)

      if (result.success) {
        toast({
          title: "Modelo excluído",
          description: `O modelo "${modelName}" foi excluído com sucesso.`,
        })
        setOpen(false)
        router.push("/assessment-models")
      } else {
        toast({
          title: "Erro ao excluir modelo",
          description: result.error || "Ocorreu um erro ao excluir o modelo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir modelo",
        description: "Ocorreu um erro ao excluir o modelo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Modelo de Avaliação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o modelo "{modelName}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
