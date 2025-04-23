import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentAppointments } from "@/components/dashboard/recent-appointments"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { PaymentsSummary } from "@/components/dashboard/payments-summary"
import { PaymentsChart } from "@/components/dashboard/payments-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard - NeuroGestão",
  description: "Visão geral do sistema NeuroGestão",
}

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch stats
  const { data: patientsData, error: patientsError } = await supabase.from("patients").select("id", { count: "exact" })

  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id", { count: "exact" })

  const { data: assessmentsData, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id", { count: "exact" })

  const { data: reportsData, error: reportsError } = await supabase.from("reports").select("id", { count: "exact" })

  // Fetch payment stats
  const { data: paymentStats, error: paymentStatsError } = await supabase.rpc("get_dashboard_payment_stats")

  // Fetch daily payments for chart
  const { data: dailyPayments, error: dailyPaymentsError } = await supabase.rpc("get_daily_payments", { days_back: 30 })

  // Log errors for debugging
  if (patientsError) console.error("Error fetching patients:", patientsError)
  if (appointmentsError) console.error("Error fetching appointments:", appointmentsError)
  if (assessmentsError) console.error("Error fetching assessments:", assessmentsError)
  if (reportsError) console.error("Error fetching reports:", reportsError)
  if (paymentStatsError) console.error("Error fetching payment stats:", paymentStatsError)
  if (dailyPaymentsError) console.error("Error fetching daily payments:", dailyPaymentsError)

  // Get counts
  const patientsCount = patientsData?.length || 0
  const appointmentsCount = appointmentsData?.length || 0
  const assessmentsCount = assessmentsData?.length || 0
  const reportsCount = reportsData?.length || 0

  // Fetch upcoming appointments
  const today = new Date()
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .gte("date", today.toISOString())
    .order("date", { ascending: true })
    .limit(5)

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*, patients(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" description="Visão geral do sistema NeuroGestão" />

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStats
          stats={[
            {
              title: "Pacientes",
              value: patientsCount,
              description: "Total de pacientes cadastrados",
            },
            {
              title: "Agendamentos",
              value: appointmentsCount,
              description: "Total de consultas agendadas",
            },
            {
              title: "Avaliações",
              value: assessmentsCount,
              description: "Total de avaliações realizadas",
            },
            {
              title: "Relatórios",
              value: reportsCount,
              description: "Total de relatórios gerados",
            },
          ]}
        />
      </div>

      {/* Payments Summary - Responsive scrollable container for small screens */}
      {paymentStats && (
        <div className="mt-6">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Resumo Financeiro</h2>
          <div className="mt-2 overflow-x-auto pb-2">
            <div className="min-w-[600px] md:min-w-0">
              <PaymentsSummary stats={paymentStats} />
            </div>
          </div>
        </div>
      )}

      {/* Charts and Appointments - Stack on mobile, side by side on larger screens */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardTitle className="text-lg font-medium md:text-xl">Consultas por Mês</CardTitle>
            <CardDescription>Número de consultas agendadas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-2">
            <AppointmentsChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardTitle className="text-lg font-medium md:text-xl">Próximos Agendamentos</CardTitle>
            <CardDescription>Consultas e avaliações agendadas para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <RecentAppointments appointments={upcomingAppointments || []} />
          </CardContent>
        </Card>
      </div>

      {/* Payments Chart and Recent Payments - Stack on mobile, side by side on larger screens */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardTitle className="text-lg font-medium md:text-xl">Pagamentos Recebidos</CardTitle>
            <CardDescription>Valores recebidos nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-2">
            <PaymentsChart data={dailyPayments || []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardTitle className="text-lg font-medium md:text-xl">Pagamentos Recentes</CardTitle>
            <CardDescription>Últimos pagamentos registrados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {recentPayments?.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                >
                  <div>
                    <p className="font-medium line-clamp-1">{payment.patients?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {payment.status === "completed"
                        ? "Pago"
                        : payment.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                    </span>
                    <span className="ml-4 font-medium tabular-nums">
                      R$ {Number(payment.amount).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentPayments || recentPayments.length === 0) && (
                <p className="text-center text-muted-foreground">Nenhum pagamento registrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
