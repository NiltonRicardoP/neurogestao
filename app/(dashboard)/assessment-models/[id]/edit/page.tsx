import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { AssessmentModelForm } from "@/components/assessment-models/assessment-model-form"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function updateAssessmentModel(formData: FormData) {
  "use server"

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!id || !name) {
    throw new Error("ID e nome são obrigatórios")
  }

  const supabase = createServerComponentClient({ cookies })

  const { error } = await supabase
    .from("assessment_models")
    .update({
      name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar modelo:", error)
    throw new Error("Erro ao atualizar modelo de avaliação")
  }

  redirect("/assessment-models")
}

export default async function EditAssessmentModelPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const { data: model, error } = await supabase.from("assessment_models").select("*").eq("id", params.id).single()

  if (error || !model) {
    console.error("Erro ao buscar modelo:", error)
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Modelo de Avaliação</h1>
        <p className="text-muted-foreground">Atualize as informações do modelo de avaliação</p>
      </div>

      <AssessmentModelForm model={model} action={updateAssessmentModel} />
    </div>
  )
}
