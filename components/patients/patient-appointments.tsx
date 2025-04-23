import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Database } from "@/types/supabase"

type Appointment = Database["public"]["Tables"]["appointments"]["Row"]

interface PatientAppointmentsProps {
  appointments: Appointment[]
  patientId: string
}

export function PatientAppointments({ appointments, patientId }: PatientAppointmentsProps) {
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
        <CardTitle>Agendamentos</CardTitle>
        <CardDescription>Histórico de consultas e agendamentos do paciente</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{appointment.notes || "-"}</TableCell>
                  <TableCell>
                    <Link href={`/appointments/${appointment.id}`}>
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Link href={`/appointments/new?patientId=${patientId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
