import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteModelDialog } from "@/components/assessment-models/delete-model-dialog"

export const metadata: Metadata = {
  title: "Modelos de Avaliação - NeuroGestão",
  description: "Gerenciamento de modelos de avaliação neuropsicológica",
}

export const revalidate = 0 // Desabilitar cache para esta página

export default async function AssessmentModelsPage() {
  const supabase = createClient()

  // Buscar modelos de avaliação diretamente do Supabase
  const { data: models, error } = await supabase
    .from("assessment_models")
    .select("*")
    .order("name", { ascending: true })

  // Verificar se houve erro na consulta
  if (error) {
    console.error("Erro ao buscar modelos de avaliação:", error)
  }

  console.log("Modelos encontrados:", models)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Modelos de Avaliação"
        description="Gerenciamento de modelos de avaliação neuropsicológica"
      >
        <Link href="/assessment-models/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Modelo
          </Button>
        </Link>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Modelos de Avaliação</CardTitle>
          <CardDescription>Gerencie seus modelos de avaliação neuropsicológica.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models && models.length > 0 ? (
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.description || "Sem descrição"}</TableCell>
                    <TableCell>{new Date(model.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/assessment-models/${model.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/assessment-models/${model.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <DeleteModelDialog modelId={model.id} modelName={model.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum modelo de avaliação encontrado.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Novo Modelo" para criar seu primeiro modelo de avaliação.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
