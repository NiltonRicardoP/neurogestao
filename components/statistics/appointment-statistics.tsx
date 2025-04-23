"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/hooks/use-supabase"
import { BarChart, DonutChart } from "@/components/ui/charts"
import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentStatistics() {
  const [loading, setLoading] = useState(true)
  const [statusStats, setStatusStats] = useState<any[]>([])
  const [weekdayStats, setWeekdayStats] = useState<any[]>([])
  const { supabase } = useSupabase()

  useEffect(() => {
    async function fetchAppointmentStats() {
      setLoading(true)

      // Buscar todos os agendamentos
      const { data: appointments } = await supabase.from("appointments").select("date, status")

      if (appointments) {
        // Processar estatísticas de status
        const statusCounts: Record<string, number> = {}
        appointments.forEach((appointment) => {
          const status = appointment.status || "Não definido"
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
          name: formatStatus(status),
          value: count,
        }))

        // Processar estatísticas de dia da semana
        const weekdayCounts: Record<string, number> = {
          Domingo: 0,
          Segunda: 0,
          Terça: 0,
          Quarta: 0,
          Quinta: 0,
          Sexta: 0,
          Sábado: 0,
        }

        appointments.forEach((appointment) => {
          if (appointment.date) {
            const date = new Date(appointment.date)
            const weekday = getWeekdayName(date.getDay())
            weekdayCounts[weekday]++
          }
        })

        const weekdayData = Object.entries(weekdayCounts).map(([weekday, count]) => ({
          name: weekday,
          appointments: count,
        }))

        setStatusStats(statusData)
        setWeekdayStats(weekdayData)
      }

      setLoading(false)
    }

    fetchAppointmentStats()
  }, [supabase])

  // Função para obter nome do dia da semana
  function getWeekdayName(weekdayIndex: number) {
    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    return weekdays[weekdayIndex]
  }

  // Função para formatar status
  function formatStatus(status: string) {
    const statusMap: Record<string, string> = {
      agendado: "Agendado",
      confirmado: "Confirmado",
      cancelado: "Cancelado",
      concluído: "Concluído",
      "Não definido": "Não definido",
    }

    return statusMap[status] || status
  }

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Agendamentos</CardTitle>
        <CardDescription>Análise de agendamentos por status e dia da semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Status dos Agendamentos</h3>
            <div className="h-[200px]">
              <DonutChart
                data={statusStats}
                index="name"
                category="value"
                valueFormatter={(value) => `${value} agendamentos`}
                colors={["#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#6b7280"]}
                showAnimation={true}
                showTooltip={true}
                showLegend={true}
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Agendamentos por Dia da Semana</h3>
            <div className="h-[200px]">
              <BarChart
                data={weekdayStats}
                index="name"
                categories={["appointments"]}
                colors={["#3b82f6"]}
                valueFormatter={(value) => `${value}`}
                showLegend={false}
                showAnimation={true}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
