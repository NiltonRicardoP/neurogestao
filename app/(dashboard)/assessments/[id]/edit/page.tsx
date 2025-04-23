import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AssessmentForm } from "@/components/assessments/assessment-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Editar Avaliação - NeuroGestão",
  description: "Editar informações da avaliação neuropsicológica",
}

export default async function EditAssessmentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Fetch assessment details
  const { data: assessment, error } = await supabase.from("assessments").select("*").eq("id", params.id).single()

  if (error || !assessment) {
    notFound()
  }

  // Fetch patients for the dropdown
  const { data: patients } = await supabase.from("patients").select("id, name").order("name", { ascending: true })

  // Fetch assessment models for the dropdown
  const { data: assessmentModels } = await supabase
    .from("assessment_models")
    .select("id, name")
    .order("name", { ascending: true })

  async function updateAssessment(formData: FormData) {
    "use server"

    const supabase = createClient()

    const patientId = formData.get("patientId") as string
    const title = formData.get("title") as string
    const date = formData.get("date") as string
    const status = formData.get("status") as string
    const notes = formData.get("notes") as string

    const { error } = await supabase
      .from("assessments")
      .update({
        patient_id: patientId,
        title,
        date,
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      throw new Error(`Erro ao atualizar avaliação: ${error.message}`)
    }

    redirect(`/assessments/${params.id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Editar Avaliação" description="Edite as informações da avaliação neuropsicológica" />
      <AssessmentForm
        patients={patients || []}
        assessmentModels={assessmentModels || []}
        assessment={assessment}
        action={updateAssessment}
      />
    </DashboardShell>
  )
}
