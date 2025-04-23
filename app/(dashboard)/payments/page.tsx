import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { PaymentsList } from "@/components/payments/payments-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Pagamentos | NeuroGestão",
  description: "Gerencie os pagamentos dos pacientes",
}

export const revalidate = 0

export default async function PaymentsPage() {
  const supabase = createClient()

  // Buscar pagamentos
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      patient:patients(id, name),
      payment_method:payment_methods(id, name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pagamentos:", error)
  }

  // Buscar estatísticas de pagamentos
  const { data: stats, error: statsError } = await supabase.rpc("get_payment_stats")

  if (statsError) {
    console.error("Erro ao buscar estatísticas de pagamentos:", statsError)
  }

  const paymentStats = stats || {
    total_payments: 0,
    pending_payments: 0,
    completed_payments: 0,
    total_amount: 0,
    pending_amount: 0,
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie os pagamentos dos pacientes</p>
        </div>
        <Link href="/payments/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Total de Pagamentos</div>
          <div className="mt-2 text-2xl font-bold">{paymentStats.total_payments}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
          <div className="mt-2 text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(paymentStats.total_amount)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</div>
          <div className="mt-2 text-2xl font-bold">{paymentStats.pending_payments}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Valor Pendente</div>
          <div className="mt-2 text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(paymentStats.pending_amount)}
          </div>
        </div>
      </div>

      <PaymentsList payments={payments || []} />
    </div>
  )
}
