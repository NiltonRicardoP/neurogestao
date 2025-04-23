import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AssessmentForm } from "@/components/assessments/assessment-form"

export const metadata: Metadata = {
  title: "Nova Avaliação - NeuroGestão",
  description: "Criar uma nova avaliação neuropsicológica",
}

export default async function NewAssessmentPage({ searchParams }) {
  const supabase = createClient()

  // Buscar pacientes
  const { data: patients } = await supabase.from("patients").select("id, name").order("name", { ascending: true })

  // Buscar modelos de avaliação
  const { data: models } = await supabase
    .from("assessment_models")
    .select("id, name")
    .order("name", { ascending: true })

  // Verificar se há um modelo pré-selecionado nos parâmetros da URL
  const preSelectedModelId = searchParams?.model

  return (
    <DashboardShell>
      <DashboardHeader heading="Nova Avaliação" description="Criar uma nova avaliação neuropsicológica" />
      <div className="grid gap-8">
        <AssessmentForm
          patients={patients || []}
          models={models || []}
          assessment={preSelectedModelId ? { model_id: preSelectedModelId } : undefined}
        />
      </div>
    </DashboardShell>
  )
}
