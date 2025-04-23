import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { FieldForm } from "@/components/assessment-models/field-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Novo Campo - NeuroGestão",
  description: "Adicionar novo campo à seção do modelo de avaliação",
}

export default async function NewFieldPage({ params }: { params: { id: string; sectionId: string } }) {
  const supabase = createClient()

  // Verificar se a seção existe
  const { data: section, error } = await supabase
    .from("assessment_sections")
    .select("title, model_id")
    .eq("id", params.sectionId)
    .single()

  if (error || !section) {
    redirect(`/assessment-models/${params.id}`)
  }

  // Verificar se o modelo corresponde
  if (section.model_id !== params.id) {
    redirect(`/assessment-models/${params.id}`)
  }

  // Buscar a última ordem para definir a próxima
  const { data: lastField } = await supabase
    .from("assessment_fields")
    .select("order_index")
    .eq("section_id", params.sectionId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single()

  const nextOrderIndex = lastField ? lastField.order_index + 1 : 0

  async function createField(formData: FormData) {
    "use server"

    const supabase = createClient()

    const label = formData.get("label") as string
    const type = formData.get("type") as string
    const required = formData.get("required") === "true"
    const optionsString = formData.get("options") as string

    // Processar opções para tipos select, radio e checkbox
    let options = null
    if (["select", "radio", "checkbox"].includes(type) && optionsString) {
      options = optionsString
        .split("\n")
        .map((option) => option.trim())
        .filter(Boolean)
    }

    const { error } = await supabase.from("assessment_fields").insert({
      section_id: params.sectionId,
      label,
      type,
      required,
      options,
      order_index: nextOrderIndex,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Erro ao criar campo: ${error.message}`)
    }

    redirect(`/assessment-models/${params.id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Novo Campo para ${section.title}`}
        description="Adicione um novo campo à seção do modelo de avaliação"
      />
      <FieldForm action={createField} />
    </DashboardShell>
  )
}
