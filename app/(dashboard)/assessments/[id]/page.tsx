import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { AssessmentDetails } from "@/components/assessments/assessment-details"
import { AssessmentResults } from "@/components/assessments/assessment-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Detalhes da Avaliação - NeuroGestão",
  description: "Visualizar detalhes da avaliação neuropsicológica",
}

export default async function AssessmentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Fetch assessment details with patient name
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*, patients(name)")
    .eq("id", params.id)
    .single()

  if (error || !assessment) {
    notFound()
  }

  // Fetch assessment results
  const { data: results } = await supabase
    .from("assessment_results")
    .select("*, assessment_fields(label, type, options)")
    .eq("assessment_id", params.id)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Detalhes da Avaliação"
        description={`${assessment.title} - ${assessment.patients.name}`}
      >
        <div className="flex gap-2">
          <Link href={`/assessments/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/reports/new?assessmentId=${params.id}`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <AssessmentDetails assessment={assessment} />
        </TabsContent>
        <TabsContent value="results">
          <AssessmentResults results={results || []} assessmentId={params.id} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
