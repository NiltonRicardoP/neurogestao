"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface MonthData {
  name: string
  total: number
}

export function AppointmentsChart() {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      console.log("Fetching appointment data for chart...")

      // Get last 6 months
      const months = []
      const today = new Date()

      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
        months.push({
          date: month,
          name: month.toLocaleDateString("pt-BR", { month: "short" }),
          startDate: new Date(month.getFullYear(), month.getMonth(), 1).toISOString(),
          endDate: new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString(),
        })
      }

      // Fetch appointment counts for each month
      const monthsData = await Promise.all(
        months.map(async (month) => {
          const { data, count, error } = await supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .gte("date", month.startDate)
            .lt("date", month.endDate)

          if (error) {
            console.error(`Error fetching appointments for ${month.name}:`, error)
          }

          console.log(`Month ${month.name}: found ${count || 0} appointments`)

          return {
            name: month.name.charAt(0).toUpperCase() + month.name.slice(1),
            total: count || 0,
          }
        }),
      )

      console.log("Chart data:", monthsData)
      setData(monthsData)
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return <div className="flex h-[200px] items-center justify-center">Carregando...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-sm text-muted-foreground" />
        <YAxis className="text-sm text-muted-foreground" />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Mês</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                      <span className="font-bold">{payload[0].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="total" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
