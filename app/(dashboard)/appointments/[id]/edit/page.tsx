import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Editar Agendamento - NeuroGestão",
  description: "Editar informações do agendamento",
}

export default async function EditAppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Fetch appointment details
  const { data: appointment, error } = await supabase.from("appointments").select("*").eq("id", params.id).single()

  if (error || !appointment) {
    notFound()
  }

  // Fetch patients for the dropdown
  const { data: patients } = await supabase.from("patients").select("id, name").order("name", { ascending: true })

  async function updateAppointment(formData: FormData) {
    "use server"

    const supabase = createClient()

    const patientId = formData.get("patientId") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const status = formData.get("status") as string
    const notes = formData.get("notes") as string

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`)

    const { error } = await supabase
      .from("appointments")
      .update({
        patient_id: patientId,
        date: dateTime.toISOString(),
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`)
    }

    redirect(`/appointments/${params.id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Editar Agendamento" description="Edite as informações do agendamento" />
      <AppointmentForm patients={patients || []} appointment={appointment} action={updateAppointment} />
    </DashboardShell>
  )
}
