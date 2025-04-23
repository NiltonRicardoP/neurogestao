"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

interface PaymentChartData {
  date: string
  amount: number
}

interface PaymentsChartProps {
  data: PaymentChartData[]
}

export function PaymentsChart({ data }: PaymentsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [isMounted, setIsMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Adjust data for mobile view - show fewer data points on small screens
  const displayData = windowWidth < 640 ? data.filter((_, i) => i % 3 === 0) : data

  if (!isMounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md"></div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          stroke={isDark ? "#888888" : "#888888"}
          fontSize={windowWidth < 640 ? 10 : 12}
          tickLine={false}
          axisLine={false}
          interval={windowWidth < 640 ? 2 : 0}
        />
        <YAxis
          stroke={isDark ? "#888888" : "#888888"}
          fontSize={windowWidth < 640 ? 10 : 12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => (windowWidth < 640 ? `${value}` : `R$${value}`)}
          width={windowWidth < 640 ? 30 : 40}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Valor"]}
          labelFormatter={(label) => `Data: ${label}`}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            borderRadius: "0.375rem",
            color: isDark ? "#f9fafb" : "#111827",
            fontSize: windowWidth < 640 ? "0.75rem" : "0.875rem",
          }}
        />
        <Bar dataKey="amount" fill={isDark ? "#3b82f6" : "#3b82f6"} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
