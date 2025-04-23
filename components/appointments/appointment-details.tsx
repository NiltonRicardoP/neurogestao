import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Database } from "@/types/supabase"

type AppointmentWithPatient = Database["public"]["Tables"]["appointments"]["Row"] & {
  patients: {
    name: string
  }
}

interface AppointmentDetailsProps {
  appointment: AppointmentWithPatient
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Agendamento</CardTitle>
        <CardDescription>Detalhes do agendamento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Paciente</h3>
            <p className="text-base">{appointment.patients.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Data e Hora</h3>
            <p className="text-base">{formatDate(appointment.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <StatusBadge status={appointment.status} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
            <p className="text-base">{formatDate(appointment.created_at)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
          <p className="text-base whitespace-pre-line">{appointment.notes || "Nenhuma observação registrada."}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/appointments">
          <Button variant="outline">Voltar</Button>
        </Link>
        <Link href={`/patients/${appointment.patient_id}`}>
          <Button variant="outline">Ver Paciente</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
