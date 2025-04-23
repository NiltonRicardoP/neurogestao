import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { PatientForm } from "@/components/patients/patient-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Novo Paciente - NeuroGestão",
  description: "Adicionar novo paciente ao sistema",
}

export default async function NewPatientPage() {
  async function createPatient(formData: FormData) {
    "use server"

    const supabase = createClient()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const birthDate = formData.get("birthDate") as string
    const gender = formData.get("gender") as string
    const address = formData.get("address") as string
    const medicalHistory = formData.get("medicalHistory") as string

    const { error } = await supabase.from("patients").insert({
      name,
      email,
      phone,
      birth_date: birthDate,
      gender,
      address,
      medical_history: medicalHistory,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Erro ao criar paciente: ${error.message}`)
    }

    redirect("/patients")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Novo Paciente" description="Adicione um novo paciente ao sistema" />
      <PatientForm action={createPatient} />
    </DashboardShell>
  )
}
