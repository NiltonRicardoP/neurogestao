import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { SectionForm } from "@/components/assessment-models/section-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Nova Seção - NeuroGestão",
  description: "Adicionar nova seção ao modelo de avaliação",
}

export default async function NewSectionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Verificar se o modelo existe
  const { data: model, error } = await supabase.from("assessment_models").select("name").eq("id", params.id).single()

  if (error || !model) {
    redirect("/assessment-models")
  }

  // Buscar a última ordem para definir a próxima
  const { data: lastSection } = await supabase
    .from("assessment_sections")
    .select("order_index")
    .eq("model_id", params.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single()

  const nextOrderIndex = lastSection ? lastSection.order_index + 1 : 0

  async function createSection(formData: FormData) {
    "use server"

    const supabase = createClient()

    const title = formData.get("title") as string
    const description = formData.get("description") as string

    const { error } = await supabase.from("assessment_sections").insert({
      model_id: params.id,
      title,
      description,
      order_index: nextOrderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Erro ao criar seção: ${error.message}`)
    }

    redirect(`/assessment-models/${params.id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Nova Seção para ${model.name}`}
        description="Adicione uma nova seção ao modelo de avaliação"
      />
      <SectionForm action={createSection} />
    </DashboardShell>
  )
}
