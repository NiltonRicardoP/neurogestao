import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { AppointmentsCalendar } from "@/components/appointments/appointments-calendar"

export const metadata: Metadata = {
  title: "Agendamentos - NeuroGestão",
  description: "Gerenciamento de agendamentos",
}

export default async function AppointmentsPage() {
  const supabase = createClient()

  // Fetch appointments with patient names
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .order("date", { ascending: true })

  return (
    <DashboardShell>
      <DashboardHeader heading="Agendamentos" description="Gerenciamento de agendamentos">
        <Link href="/appointments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </DashboardHeader>

      <AppointmentsCalendar appointments={appointments || []} />
    </DashboardShell>
  )
}
