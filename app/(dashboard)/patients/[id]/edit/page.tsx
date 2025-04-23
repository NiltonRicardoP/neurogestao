import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { PatientForm } from "@/components/patients/patient-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Editar Paciente - NeuroGestão",
  description: "Editar informações do paciente",
}

export default async function EditPatientPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: patient, error } = await supabase.from("patients").select("*").eq("id", params.id).single()

  if (error || !patient) {
    notFound()
  }

  async function updatePatient(formData: FormData) {
    "use server"

    const supabase = createClient()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const birthDate = formData.get("birthDate") as string
    const gender = formData.get("gender") as string
    const address = formData.get("address") as string
    const medicalHistory = formData.get("medicalHistory") as string

    const { error } = await supabase
      .from("patients")
      .update({
        name,
        email,
        phone,
        birth_date: birthDate,
        gender,
        address,
        medical_history: medicalHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      throw new Error(`Erro ao atualizar paciente: ${error.message}`)
    }

    redirect(`/patients/${params.id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Editar Paciente" description="Edite as informações do paciente" />
      <PatientForm patient={patient} action={updatePatient} />
    </DashboardShell>
  )
}
