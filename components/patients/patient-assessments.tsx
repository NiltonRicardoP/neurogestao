import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Database } from "@/types/supabase"

type Assessment = Database["public"]["Tables"]["assessments"]["Row"]

interface PatientAssessmentsProps {
  assessments: Assessment[]
  patientId: string
}

export function PatientAssessments({ assessments, patientId }: PatientAssessmentsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
        <CardDescription>Histórico de avaliações neuropsicológicas do paciente</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.length > 0 ? (
              assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.title}</TableCell>
                  <TableCell>{formatDate(assessment.date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={assessment.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/assessments/${assessment.id}`}>
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhuma avaliação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Link href={`/assessments/new?patientId=${patientId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
