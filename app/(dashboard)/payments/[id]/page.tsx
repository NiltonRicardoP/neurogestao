import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, FileTextIcon, PencilIcon } from "lucide-react"
import { CompletePaymentButton } from "@/components/payments/complete-payment-button"

export const metadata: Metadata = {
  title: "Detalhes do Pagamento | NeuroGestão",
  description: "Visualize os detalhes do pagamento",
}

export default async function PaymentDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Buscar pagamento
  const { data: payment, error } = await supabase
    .from("payments")
    .select(`
      *,
      patient:patients(id, name, email, phone),
      payment_method:payment_methods(id, name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !payment) {
    console.error("Erro ao buscar pagamento:", error)
    notFound()
  }

  // Buscar itens do pagamento
  const { data: items, error: itemsError } = await supabase
    .from("payment_items")
    .select("*")
    .eq("payment_id", params.id)
    .order("created_at")

  if (itemsError) {
    console.error("Erro ao buscar itens do pagamento:", itemsError)
  }

  // Buscar transações do pagamento
  const { data: transactions, error: transactionsError } = await supabase
    .from("payment_transactions")
    .select(`
      *,
      payment_method:payment_methods(id, name)
    `)
    .eq("payment_id", params.id)
    .order("transaction_date", { ascending: false })

  if (transactionsError) {
    console.error("Erro ao buscar transações do pagamento:", transactionsError)
  }

  // Buscar referência (agendamento, avaliação, etc.)
  let reference = null
  if (payment.reference_type && payment.reference_id) {
    if (payment.reference_type === "appointment") {
      const { data, error: refError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", payment.reference_id)
        .single()

      if (!refError && data) {
        reference = {
          type: "Agendamento",
          data,
          url: `/appointments/${data.id}`,
        }
      }
    } else if (payment.reference_type === "assessment") {
      const { data, error: refError } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", payment.reference_id)
        .single()

      if (!refError && data) {
        reference = {
          type: "Avaliação",
          data,
          url: `/assessments/${data.id}`,
        }
      }
    }
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Pagamento</h1>
            <p className="text-muted-foreground">
              Pagamento de {payment.patient.name} - {formatCurrency(payment.amount)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {payment.status === "pending" && <CompletePaymentButton paymentId={payment.id} />}
          <Link href={`/payments/${payment.id}/receipt`}>
            <Button variant="outline">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Gerar Recibo
            </Button>
          </Link>
          <Link href={`/payments/${payment.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pagamento</CardTitle>
            <CardDescription>Detalhes do pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">{getStatusBadge(payment.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Valor</dt>
                <dd className="mt-1 font-semibold">{formatCurrency(payment.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Método de Pagamento</dt>
                <dd className="mt-1">{payment.payment_method?.name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data de Vencimento</dt>
                <dd className="mt-1">{formatDate(payment.due_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data de Pagamento</dt>
                <dd className="mt-1">{formatDate(payment.payment_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data de Criação</dt>
                <dd className="mt-1">{formatDate(payment.created_at)}</dd>
              </div>
              {reference && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Referência</dt>
                  <dd className="mt-1">
                    <Link href={reference.url} className="text-primary hover:underline">
                      {reference.type} - {formatDate(reference.data.date || reference.data.created_at)}
                    </Link>
                  </dd>
                </div>
              )}
              {payment.notes && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Observações</dt>
                  <dd className="mt-1 whitespace-pre-line">{payment.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Paciente</CardTitle>
            <CardDescription>Detalhes do paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd className="mt-1">
                  <Link href={`/patients/${payment.patient.id}`} className="text-primary hover:underline">
                    {payment.patient.name}
                  </Link>
                </dd>
              </div>
              {payment.patient.email && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{payment.patient.email}</dd>
                </div>
              )}
              {payment.patient.phone && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                  <dd className="mt-1">{payment.patient.phone}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {items && items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pagamento</CardTitle>
            <CardDescription>Detalhes dos itens incluídos neste pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Quantidade</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Valor Unitário</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Desconto</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-right text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.discount || 0)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {formatCurrency(item.amount * item.quantity - (item.discount || 0))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(payment.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>Histórico de transações relacionadas a este pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Método</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.transaction_type === "payment"
                          ? "Pagamento"
                          : transaction.transaction_type === "refund"
                            ? "Reembolso"
                            : transaction.transaction_type === "partial_refund"
                              ? "Reembolso Parcial"
                              : transaction.transaction_type}
                      </td>
                      <td className="px-4 py-3 text-sm">{transaction.payment_method?.name || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.status === "completed" ? (
                          <Badge className="bg-green-500">Concluído</Badge>
                        ) : transaction.status === "pending" ? (
                          <Badge className="bg-yellow-500">Pendente</Badge>
                        ) : transaction.status === "failed" ? (
                          <Badge className="bg-red-500">Falhou</Badge>
                        ) : (
                          <Badge>{transaction.status}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(transaction.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
