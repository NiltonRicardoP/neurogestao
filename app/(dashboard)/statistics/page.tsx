import { Suspense } from "react"
import type { Metadata } from "next"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatisticsOverview } from "@/components/statistics/statistics-overview"
import { PatientStatistics } from "@/components/statistics/patient-statistics"
import { AppointmentStatistics } from "@/components/statistics/appointment-statistics"
import { AssessmentStatistics } from "@/components/statistics/assessment-statistics"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Estatísticas | NeuroGestão",
  description: "Visualize estatísticas e métricas importantes do sistema",
}

export default async function StatisticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Estatísticas" description="Visualize estatísticas e métricas importantes do sistema" />
      <div className="grid gap-8">
        <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
          <StatisticsOverview />
        </Suspense>

        <div className="grid gap-8 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <PatientStatistics />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <AppointmentStatistics />
          </Suspense>
        </div>

        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <AssessmentStatistics />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
