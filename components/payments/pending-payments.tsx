import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, EyeIcon } from "lucide-react"

interface PendingPaymentsProps {
  payments: any[]
}

export function PendingPayments({ payments }: PendingPaymentsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground">Nenhum pagamento pendente encontrado.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <div className="font-medium">{payment.patient.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Vencimento: {formatDate(payment.due_date)}</span>
                  {payment.due_date && isOverdue(payment.due_date) && <Badge className="bg-red-500">Atrasado</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-muted-foreground">{payment.payment_method?.name || "-"}</div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/payments/${payment.id}`}>
                    <Button variant="ghost" size="icon">
                      <EyeIcon className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </Link>
                  <Link href={`/payments/${payment.id}/complete`}>
                    <Button variant="ghost" size="icon">
                      <CheckCircle2Icon className="h-4 w-4" />
                      <span className="sr-only">Marcar como pago</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
