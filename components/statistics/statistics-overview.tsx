"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/hooks/use-supabase"
import { BarChart } from "@/components/ui/charts"
import { Skeleton } from "@/components/ui/skeleton"

export function StatisticsOverview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    patientCount: 0,
    appointmentCount: 0,
    assessmentCount: 0,
    reportCount: 0,
    monthlyData: [] as any[],
  })
  const [period, setPeriod] = useState("month")
  const { supabase } = useSupabase()

  useEffect(() => {
    async function fetchOverviewStats() {
      setLoading(true)

      // Buscar contagens
      const [{ count: patientCount }, { count: appointmentCount }, { count: assessmentCount }, { count: reportCount }] =
        await Promise.all([
          supabase.from("patients").select("id", { count: "exact", head: true }),
          supabase.from("appointments").select("id", { count: "exact", head: true }),
          supabase.from("assessments").select("id", { count: "exact", head: true }),
          supabase.from("reports").select("id", { count: "exact", head: true }),
        ])

      // Calcular período para dados mensais
      const today = new Date()
      const startDate = new Date()

      if (period === "month") {
        startDate.setMonth(today.getMonth() - 6) // Últimos 6 meses
      } else if (period === "week") {
        startDate.setDate(today.getDate() - 12 * 7) // Últimas 12 semanas
      } else {
        startDate.setFullYear(today.getFullYear() - 1) // Último ano
      }

      // Buscar dados para o gráfico
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("date")
        .gte("date", startDate.toISOString())
        .order("date")

      const { data: assessmentsData } = await supabase
        .from("assessments")
        .select("date")
        .gte("date", startDate.toISOString())
        .order("date")

      // Processar dados para o gráfico
      const monthlyData = processTimeSeriesData(appointmentsData || [], assessmentsData || [], period)

      setStats({
        patientCount: patientCount || 0,
        appointmentCount: appointmentCount || 0,
        assessmentCount: assessmentCount || 0,
        reportCount: reportCount || 0,
        monthlyData,
      })

      setLoading(false)
    }

    fetchOverviewStats()
  }, [period, supabase])

  // Função para processar dados de série temporal
  function processTimeSeriesData(appointments: any[], assessments: any[], periodType: string) {
    const format =
      periodType === "month"
        ? { month: "short", year: "numeric" }
        : periodType === "week"
          ? { day: "numeric", month: "short" }
          : { month: "short" }

    const periods = getPeriodLabels(periodType)

    // Inicializar dados com zeros
    const data = periods.map((label) => ({
      name: label,
      appointments: 0,
      assessments: 0,
    }))

    // Contar agendamentos por período
    appointments.forEach((app) => {
      const date = new Date(app.date)
      const periodLabel = formatDate(date, format)
      const index = data.findIndex((d) => d.name === periodLabel)
      if (index !== -1) {
        data[index].appointments++
      }
    })

    // Contar avaliações por período
    assessments.forEach((assessment) => {
      const date = new Date(assessment.date)
      const periodLabel = formatDate(date, format)
      const index = data.findIndex((d) => d.name === periodLabel)
      if (index !== -1) {
        data[index].assessments++
      }
    })

    return data
  }

  // Função para obter rótulos de período
  function getPeriodLabels(periodType: string) {
    const labels = []
    const today = new Date()

    if (periodType === "month") {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(today.getMonth() - i)
        labels.push(formatDate(date, { month: "short", year: "numeric" }))
      }
    } else if (periodType === "week") {
      // Últimas 12 semanas
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i * 7)
        labels.push(formatDate(date, { day: "numeric", month: "short" }))
      }
    } else {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(today.getMonth() - i)
        labels.push(formatDate(date, { month: "short" }))
      }
    }

    return labels
  }

  // Função para formatar data
  function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("pt-BR", options).format(date)
  }

  if (loading) {
    return <Skeleton className="h-[450px] w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
        <CardDescription>Estatísticas gerais do sistema NeuroGestão</CardDescription>
        <Tabs defaultValue="month" className="w-full" onValueChange={setPeriod}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="week">Semanas</TabsTrigger>
            <TabsTrigger value="month">Meses</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="p-3">
              <CardDescription>Total de Pacientes</CardDescription>
              <CardTitle className="text-2xl">{stats.patientCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardDescription>Total de Agendamentos</CardDescription>
              <CardTitle className="text-2xl">{stats.appointmentCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardDescription>Total de Avaliações</CardDescription>
              <CardTitle className="text-2xl">{stats.assessmentCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardDescription>Total de Relatórios</CardDescription>
              <CardTitle className="text-2xl">{stats.reportCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="h-[300px]">
          <BarChart
            data={stats.monthlyData}
            index="name"
            categories={["appointments", "assessments"]}
            colors={["#3b82f6", "#22c55e"]}
            valueFormatter={(value) => `${value}`}
            yAxisWidth={40}
            showLegend={true}
            showGridLines={true}
            showAnimation={true}
            customTooltip={(props) => {
              if (!props.active || !props.payload || !props.payload.length) return null
              return (
                <div className="bg-white p-2 border shadow-sm rounded-md">
                  <div className="text-sm font-medium">{props.payload[0]?.payload.name}</div>
                  <div className="text-xs text-blue-600">Agendamentos: {props.payload[0]?.value}</div>
                  <div className="text-xs text-green-600">Avaliações: {props.payload[1]?.value}</div>
                </div>
              )
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
