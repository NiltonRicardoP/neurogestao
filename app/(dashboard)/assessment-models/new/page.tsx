import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AssessmentModelForm } from "@/components/assessment-models/assessment-model-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Novo Modelo de Avaliação - NeuroGestão",
  description: "Adicionar novo modelo de avaliação neuropsicológica",
}

export default async function NewAssessmentModelPage() {
  async function createAssessmentModel(formData: FormData) {
    "use server"

    const supabase = createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    const { error } = await supabase.from("assessment_models").insert({
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Erro ao criar modelo de avaliação: ${error.message}`)
    }

    redirect("/assessment-models")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Novo Modelo de Avaliação"
        description="Adicione um novo modelo de avaliação ao sistema"
      />
      <AssessmentModelForm action={createAssessmentModel} />
    </DashboardShell>
  )
}
