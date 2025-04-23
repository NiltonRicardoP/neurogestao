"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useSupabase } from "@/hooks/use-supabase"

interface CompletePaymentButtonProps {
  paymentId: string
}

export function CompletePaymentButton({ paymentId }: CompletePaymentButtonProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")

  async function handleCompletePayment() {
    if (!paymentMethod) {
      toast({
        title: "Método de pagamento obrigatório",
        description: "Selecione um método de pagamento para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Atualizar o pagamento
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          payment_date: new Date().toISOString(),
          payment_method_id: paymentMethod,
        })
        .eq("id", paymentId)

      if (paymentError) {
        throw new Error("Erro ao atualizar pagamento")
      }

      // Registrar a transação
      const { data: payment } = await supabase.from("payments").select("amount").eq("id", paymentId).single()

      if (payment) {
        const { error: transactionError } = await supabase.from("payment_transactions").insert({
          payment_id: paymentId,
          transaction_type: "payment",
          amount: payment.amount,
          payment_method_id: paymentMethod,
          transaction_date: new Date().toISOString(),
          status: "completed",
        })

        if (transactionError) {
          console.error("Erro ao registrar transação:", transactionError)
        }
      }

      toast({
        title: "Pagamento concluído com sucesso",
        description: "O pagamento foi marcado como concluído.",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Erro ao concluir pagamento:", error)
      toast({
        title: "Erro ao concluir pagamento",
        description: "Ocorreu um erro ao concluir o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle2Icon className="mr-2 h-4 w-4" />
          Marcar como Pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Concluir Pagamento</DialogTitle>
          <DialogDescription>Marque este pagamento como concluído. Esta ação não pode ser desfeita.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Método de Pagamento</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione um método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Dinheiro</SelectItem>
              <SelectItem value="2">Cartão de Crédito</SelectItem>
              <SelectItem value="3">Cartão de Débito</SelectItem>
              <SelectItem value="4">Transferência Bancária</SelectItem>
              <SelectItem value="5">PIX</SelectItem>
              <SelectItem value="6">Boleto Bancário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleCompletePayment} disabled={isSubmitting}>
            {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
