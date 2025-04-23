"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/pt-br"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"

// Set up the localizer
moment.locale("pt-br")
const localizer = momentLocalizer(moment)

type AppointmentWithPatient = Database["public"]["Tables"]["appointments"]["Row"] & {
  patients: {
    name: string
  }
}

interface AppointmentsCalendarProps {
  appointments: AppointmentWithPatient[]
}

export function AppointmentsCalendar({ appointments }: AppointmentsCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day">("month")

  // Format appointments for the calendar
  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.patients.name} - ${appointment.status}`,
    start: new Date(appointment.date),
    end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // Add 1 hour
    resource: appointment,
  }))

  // Custom event component
  const EventComponent = ({ event }: any) => {
    const appointment = event.resource as AppointmentWithPatient

    // Função para obter a cor de fundo baseada no status
    const getStatusColor = (status: string) => {
      switch (status) {
        case "agendado":
          return "bg-blue-500"
        case "confirmado":
          return "bg-green-500"
        case "cancelado":
          return "bg-red-500"
        case "concluído":
          return "bg-gray-500"
        default:
          return "bg-gray-500"
      }
    }

    return (
      <div className={`${getStatusColor(appointment.status)} p-1 rounded text-white overflow-hidden text-sm`}>
        <div className="font-semibold">{appointment.patients.name}</div>
        <div className="text-xs">{appointment.status}</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário de Agendamentos</CardTitle>
        <CardDescription>Visualize e gerencie seus agendamentos</CardDescription>
        <div className="flex space-x-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
            Mês
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
            Semana
          </Button>
          <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>
            Dia
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={(newView: any) => setView(newView)}
            components={{
              event: EventComponent,
            }}
            popup
            messages={{
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Não há agendamentos neste período.",
            }}
            onSelectEvent={(event) => {
              window.location.href = `/appointments/${event.id}`
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
