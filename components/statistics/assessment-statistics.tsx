"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/hooks/use-supabase"
import { BarChart, LineChart } from "@/components/ui/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AssessmentStatistics() {
  const [loading, setLoading] = useState(true)
  const [modelStats, setModelStats] = useState<any[]>([])
  const [timelineStats, setTimelineStats] = useState<any[]>([])
  const [period, setPeriod] = useState("month")
  const { supabase } = useSupabase()

  useEffect(() => {
    async function fetchAssessmentStats() {
      setLoading(true)

      // Buscar modelos de avaliação
      const { data: models } = await supabase.from("assessment_models").select("id, name")

      if (models) {
        // Buscar contagem de avaliações por modelo
        const modelCounts = await Promise.all(
          models.map(async (model) => {
            // Buscar seções do modelo
            const { data: sections } = await supabase.from("assessment_sections").select("id").eq("model_id", model.id)

            if (!sections || sections.length === 0) {
              return { name: model.name, assessments: 0 }
            }

            // Buscar campos das seções
            const sectionIds = sections.map((section) => section.id)
            const { data: fields } = await supabase.from("assessment_fields").select("id").in("section_id", sectionIds)

            if (!fields || fields.length === 0) {
              return { name: model.name, assessments: 0 }
            }

            // Buscar resultados dos campos
            const fieldIds = fields.map((field) => field.id)
            const { data: results } = await supabase
              .from("assessment_results")
              .select("assessment_id")
              .in("field_id", fieldIds)
              .order("assessment_id")

            if (!results) {
              return { name: model.name, assessments: 0 }
            }

            // Contar avaliações únicas
            const uniqueAssessments = new Set(results.map((r) => r.assessment_id))

            return {
              name: model.name,
              assessments: uniqueAssessments.size,
            }
          }),
        )

        setModelStats(modelCounts)

        // Calcular período para dados de linha do tempo
        const today = new Date()
        const startDate = new Date()

        if (period === "month") {
          startDate.setMonth(today.getMonth() - 6) // Últimos 6 meses
        } else if (period === "week") {
          startDate.setDate(today.getDate() - 12 * 7) // Últimas 12 semanas
        } else {
          startDate.setFullYear(today.getFullYear() - 1) // Último ano
        }

        // Buscar avaliações para o gráfico de linha do tempo
        const { data: assessments } = await supabase
          .from("assessments")
          .select("date, status")
          .gte("date", startDate.toISOString())
          .order("date")

        // Processar dados para o gráfico de linha do tempo
        const timelineData = processTimelineData(assessments || [], period)
        setTimelineStats(timelineData)
      }

      setLoading(false)
    }

    fetchAssessmentStats()
  }, [period, supabase])

  // Função para processar dados de linha do tempo
  function processTimelineData(assessments: any[], periodType: string) {
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
      completed: 0,
      inProgress: 0,
    }))

    // Contar avaliações por período e status
    assessments.forEach((assessment) => {
      const date = new Date(assessment.date)
      const periodLabel = formatDate(date, format)
      const index = data.findIndex((d) => d.name === periodLabel)

      if (index !== -1) {
        if (assessment.status === "concluída") {
          data[index].completed++
        } else {
          data[index].inProgress++
        }
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
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Avaliações</CardTitle>
        <CardDescription>Análise de avaliações neuropsicológicas</CardDescription>
        <Tabs defaultValue="month" className="w-full" onValueChange={setPeriod}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="week">Semanas</TabsTrigger>
            <TabsTrigger value="month">Meses</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Avaliações por Modelo</h3>
            <div className="h-[200px]">
              <BarChart
                data={modelStats}
                index="name"
                categories={["assessments"]}
                colors={["#8b5cf6"]}
                valueFormatter={(value) => `${value}`}
                showLegend={false}
                showAnimation={true}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Avaliações ao Longo do Tempo</h3>
            <div className="h-[200px]">
              <LineChart
                data={timelineStats}
                index="name"
                categories={["completed", "inProgress"]}
                colors={["#22c55e", "#f59e0b"]}
                valueFormatter={(value) => `${value}`}
                showLegend={true}
                showAnimation={true}
                customTooltip={(props) => {
                  if (!props.active || !props.payload || !props.payload.length) return null
                  return (
                    <div className="bg-white p-2 border shadow-sm rounded-md">
                      <div className="text-sm font-medium">{props.payload[0]?.payload.name}</div>
                      <div className="text-xs text-green-600">Concluídas: {props.payload[0]?.value}</div>
                      <div className="text-xs text-orange-600">Em Progresso: {props.payload[1]?.value}</div>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
