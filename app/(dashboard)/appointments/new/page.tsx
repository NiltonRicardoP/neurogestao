import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Novo Agendamento - NeuroGestão",
  description: "Adicionar novo agendamento ao sistema",
}

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: { patientId?: string }
}) {
  const supabase = createClient()

  // Fetch patients for the dropdown
  const { data: patients } = await supabase.from("patients").select("id, name").order("name", { ascending: true })

  async function createAppointment(formData: FormData) {
    "use server"

    const supabase = createClient()

    const patientId = formData.get("patientId") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const status = formData.get("status") as string
    const notes = formData.get("notes") as string

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`)

    const { error } = await supabase.from("appointments").insert({
      patient_id: patientId,
      date: dateTime.toISOString(),
      status,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Erro ao criar agendamento: ${error.message}`)
    }

    redirect("/appointments")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Novo Agendamento" description="Adicione um novo agendamento ao sistema" />
      <AppointmentForm patients={patients || []} action={createAppointment} defaultPatientId={searchParams.patientId} />
    </DashboardShell>
  )
}
