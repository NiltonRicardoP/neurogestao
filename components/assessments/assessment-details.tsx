import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Database } from "@/types/supabase"

type AssessmentWithPatient = Database["public"]["Tables"]["assessments"]["Row"] & {
  patients: {
    name: string
  }
}

interface AssessmentDetailsProps {
  assessment: AssessmentWithPatient
}

export function AssessmentDetails({ assessment }: AssessmentDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Avaliação</CardTitle>
        <CardDescription>Detalhes da avaliação neuropsicológica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Título</h3>
            <p className="text-base">{assessment.title}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Paciente</h3>
            <p className="text-base">{assessment.patients.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
            <p className="text-base">{formatDate(assessment.date)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <StatusBadge status={assessment.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
            <p className="text-base">{formatDate(assessment.created_at)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
            <p className="text-base">{formatDate(assessment.updated_at)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
          <p className="text-base whitespace-pre-line">{assessment.notes || "Nenhuma observação registrada."}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/assessments">
          <Button variant="outline">Voltar</Button>
        </Link>
        <Link href={`/patients/${assessment.patient_id}`}>
          <Button variant="outline">Ver Paciente</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
