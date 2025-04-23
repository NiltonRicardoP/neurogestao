import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart } from "@/components/payments/revenue-chart"
import { PaymentMethodsChart } from "@/components/payments/payment-methods-chart"
import { RecentPayments } from "@/components/payments/recent-payments"
import { PendingPayments } from "@/components/payments/pending-payments"

export const metadata: Metadata = {
  title: "Dashboard Financeiro | NeuroGestão",
  description: "Visualize estatísticas e métricas financeiras",
}

export const revalidate = 0

export default async function FinancialDashboardPage() {
  const supabase = createServerClient()

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

  // Buscar dados para o gráfico de receita
  const { data: revenueData, error: revenueError } = await supabase.rpc("get_monthly_revenue")

  if (revenueError) {
    console.error("Erro ao buscar dados de receita:", revenueError)
  }

  // Buscar dados para o gráfico de métodos de pagamento
  const { data: methodsData, error: methodsError } = await supabase.rpc("get_payment_methods_stats")

  if (methodsError) {
    console.error("Erro ao buscar estatísticas de métodos de pagamento:", methodsError)
  }

  // Buscar pagamentos recentes
  const { data: recentPayments, error: recentError } = await supabase
    .from("payments")
    .select(`
      *,
      patient:patients(id, name),
      payment_method:payment_methods(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (recentError) {
    console.error("Erro ao buscar pagamentos recentes:", recentError)
  }

  // Buscar pagamentos pendentes
  const { data: pendingPayments, error: pendingError } = await supabase
    .from("payments")
    .select(`
      *,
      patient:patients(id, name),
      payment_method:payment_methods(id, name)
    `)
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(5)

  if (pendingError) {
    console.error("Erro ao buscar pagamentos pendentes:", pendingError)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Visualize estatísticas e métricas financeiras</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Receita Total</div>
            <div className="mt-2 text-3xl font-bold">{formatCurrency(paymentStats.total_amount)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{paymentStats.total_payments} pagamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Pagamentos Concluídos</div>
            <div className="mt-2 text-3xl font-bold">
              {formatCurrency(paymentStats.total_amount - paymentStats.pending_amount)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{paymentStats.completed_payments} pagamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</div>
            <div className="mt-2 text-3xl font-bold">{formatCurrency(paymentStats.pending_amount)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{paymentStats.pending_payments} pagamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Taxa de Conversão</div>
            <div className="mt-2 text-3xl font-bold">
              {paymentStats.total_payments > 0
                ? Math.round((paymentStats.completed_payments / paymentStats.total_payments) * 100)
                : 0}
              %
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Pagamentos concluídos / total</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Receita total por mês</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={revenueData || []} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Distribuição por método de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodsChart data={methodsData || []} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Recentes</CardTitle>
                <CardDescription>Últimos 5 pagamentos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentPayments payments={recentPayments || []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Pendentes</CardTitle>
                <CardDescription>Próximos pagamentos a vencer</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingPayments payments={pendingPayments || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
              <CardDescription>Análise detalhada de receitas e pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Funcionalidade em desenvolvimento</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Relatórios detalhados para análise financeira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Funcionalidade em desenvolvimento</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
