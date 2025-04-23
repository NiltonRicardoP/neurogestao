import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EyeIcon } from "lucide-react"

interface RecentPaymentsProps {
  payments: any[]
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelado</Badge>
      case "refunded":
        return <Badge className="bg-blue-500">Reembolsado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground">Nenhum pagamento recente encontrado.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <div className="font-medium">{payment.patient.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</span>
                  <span>{getStatusBadge(payment.status)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-muted-foreground">{payment.payment_method?.name || "-"}</div>
                </div>
                <Link href={`/payments/${payment.id}`}>
                  <Button variant="ghost" size="icon">
                    <EyeIcon className="h-4 w-4" />
                    <span className="sr-only">Ver detalhes</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
