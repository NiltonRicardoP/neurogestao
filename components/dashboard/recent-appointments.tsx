import type { Database } from "@/types/supabase"
import { StatusBadge } from "@/components/ui/status-badge"

type AppointmentWithPatient = Database["public"]["Tables"]["appointments"]["Row"] & {
  patients: {
    name: string
  }
}

interface RecentAppointmentsProps {
  appointments: AppointmentWithPatient[]
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Log para depuração
  console.log("Recent appointments data:", appointments)

  return (
    <div className="space-y-4">
      {appointments && appointments.length > 0 ? (
        appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{appointment.patients?.name || "Paciente sem nome"}</p>
              <p className="text-sm text-muted-foreground">{formatDate(appointment.date)}</p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum agendamento próximo.</p>
      )}
    </div>
  )
}
