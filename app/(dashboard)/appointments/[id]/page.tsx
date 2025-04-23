import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { AppointmentDetails } from "@/components/appointments/appointment-details"

export const metadata: Metadata = {
  title: "Detalhes do Agendamento - NeuroGestão",
  description: "Visualizar detalhes do agendamento",
}

export default async function AppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Fetch appointment details with patient name
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .eq("id", params.id)
    .single()

  if (error || !appointment) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Detalhes do Agendamento" description={`Agendamento para ${appointment.patients.name}`}>
        <Link href={`/appointments/${params.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </DashboardHeader>

      <AppointmentDetails appointment={appointment} />
    </DashboardShell>
  )
}
