import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DeleteModelDialog } from "@/components/assessment-models/delete-model-dialog"

export const revalidate = 0

export default async function AssessmentModelPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Buscar o modelo de avaliação
  const { data: model, error: modelError } = await supabase
    .from("assessment_models")
    .select("*")
    .eq("id", params.id)
    .single()

  if (modelError || !model) {
    console.error("Erro ao buscar modelo de avaliação:", modelError)
    return notFound()
  }

  // Buscar as seções do modelo
  const { data: sections, error: sectionsError } = await supabase
    .from("assessment_sections")
    .select("*")
    .eq("model_id", params.id)
    .order("order_index", { ascending: true })

  if (sectionsError) {
    console.error("Erro ao buscar seções do modelo:", sectionsError)
  }

  // Buscar os campos de cada seção
  const sectionsWithFields = await Promise.all(
    (sections || []).map(async (section) => {
      const { data: fields, error: fieldsError } = await supabase
        .from("assessment_fields")
        .select("*")
        .eq("section_id", section.id)
        .order("order_index", { ascending: true })

      if (fieldsError) {
        console.error(`Erro ao buscar campos da seção ${section.id}:`, fieldsError)
      }

      return {
        ...section,
        fields: fields || [],
      }
    }),
  )

  return (
    <DashboardShell>
      <DashboardHeader heading={model.name} description={model.description || "Sem descrição"}>
        <div className="flex space-x-2">
          <Link href="/assessment-models">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href={`/assessment-models/${model.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/assessments/new?model=${model.id}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Avaliação
            </Button>
          </Link>
          <DeleteModelDialog modelId={model.id} modelName={model.name} />
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Modelo</CardTitle>
            <CardDescription>Informações gerais sobre o modelo de avaliação.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd className="text-base">{model.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data de Criação</dt>
                <dd className="text-base">{new Date(model.created_at).toLocaleDateString("pt-BR")}</dd>
              </div>
              <div className="col-span-1 md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Descrição</dt>
                <dd className="text-base">{model.description || "Sem descrição"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seções e Campos</CardTitle>
            <CardDescription>Estrutura do modelo de avaliação.</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionsWithFields.length > 0 ? (
              <div className="space-y-8">
                {sectionsWithFields.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.description || "Sem descrição"}</p>
                    </div>
                    <Separator />
                    {section.fields.length > 0 ? (
                      <div className="space-y-2">
                        {section.fields.map((field) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 rounded-md hover:bg-muted"
                          >
                            <div>
                              <p className="font-medium">{field.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {field.required ? "Obrigatório" : "Opcional"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm">Tipo: {field.type}</p>
                            </div>
                            <div>
                              {field.options && (
                                <p className="text-sm">Opções: {JSON.parse(field.options).join(", ")}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum campo nesta seção.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Este modelo não possui seções definidas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
