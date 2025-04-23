"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/hooks/use-supabase"
import { PieChart } from "@/components/ui/charts"
import { Skeleton } from "@/components/ui/skeleton"

export function PatientStatistics() {
  const [loading, setLoading] = useState(true)
  const [genderStats, setGenderStats] = useState<any[]>([])
  const [ageStats, setAgeStats] = useState<any[]>([])
  const { supabase } = useSupabase()

  useEffect(() => {
    async function fetchPatientStats() {
      setLoading(true)

      // Buscar todos os pacientes
      const { data: patients } = await supabase.from("patients").select("gender, birth_date")

      if (patients) {
        // Processar estatísticas de gênero
        const genderCounts: Record<string, number> = {}
        patients.forEach((patient) => {
          const gender = patient.gender || "Não informado"
          genderCounts[gender] = (genderCounts[gender] || 0) + 1
        })

        const genderData = Object.entries(genderCounts).map(([gender, count]) => ({
          name: formatGender(gender),
          value: count,
        }))

        // Processar estatísticas de idade
        const ageCounts: Record<string, number> = {
          "0-18": 0,
          "19-30": 0,
          "31-45": 0,
          "46-60": 0,
          "61+": 0,
          "Não informado": 0,
        }

        patients.forEach((patient) => {
          if (!patient.birth_date) {
            ageCounts["Não informado"]++
            return
          }

          const birthDate = new Date(patient.birth_date)
          const age = calculateAge(birthDate)

          if (age <= 18) ageCounts["0-18"]++
          else if (age <= 30) ageCounts["19-30"]++
          else if (age <= 45) ageCounts["31-45"]++
          else if (age <= 60) ageCounts["46-60"]++
          else ageCounts["61+"]++
        })

        const ageData = Object.entries(ageCounts)
          .filter(([_, count]) => count > 0)
          .map(([range, count]) => ({
            name: range,
            value: count,
          }))

        setGenderStats(genderData)
        setAgeStats(ageData)
      }

      setLoading(false)
    }

    fetchPatientStats()
  }, [supabase])

  // Função para calcular idade
  function calculateAge(birthDate: Date) {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Função para formatar gênero
  function formatGender(gender: string) {
    const genderMap: Record<string, string> = {
      masculino: "Masculino",
      feminino: "Feminino",
      outro: "Outro",
      "Não informado": "Não informado",
    }

    return genderMap[gender] || gender
  }

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Pacientes</CardTitle>
        <CardDescription>Distribuição demográfica dos pacientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Distribuição por Gênero</h3>
            <div className="h-[200px]">
              <PieChart
                data={genderStats}
                index="name"
                category="value"
                valueFormatter={(value) => `${value} pacientes`}
                colors={["#3b82f6", "#ec4899", "#8b5cf6", "#6b7280"]}
                showAnimation={true}
                showTooltip={true}
                showLegend={true}
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Distribuição por Idade</h3>
            <div className="h-[200px]">
              <PieChart
                data={ageStats}
                index="name"
                category="value"
                valueFormatter={(value) => `${value} pacientes`}
                colors={["#60a5fa", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e40af", "#6b7280"]}
                showAnimation={true}
                showTooltip={true}
                showLegend={true}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
