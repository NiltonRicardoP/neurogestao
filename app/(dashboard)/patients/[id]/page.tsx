import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { PatientDetails } from "@/components/patients/patient-details"
import { PatientAppointments } from "@/components/patients/patient-appointments"
import { PatientAssessments } from "@/components/patients/patient-assessments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Detalhes do Paciente - NeuroGestão",
  description: "Visualizar detalhes do paciente",
}

export default async function PatientPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Fetch patient details
  const { data: patient, error } = await supabase.from("patients").select("*").eq("id", params.id).single()

  if (error || !patient) {
    notFound()
  }

  // Fetch patient appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", params.id)
    .order("date", { ascending: false })

  // Fetch patient assessments
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("patient_id", params.id)
    .order("date", { ascending: false })

  return (
    <DashboardShell>
      <DashboardHeader heading={patient.name} description="Detalhes do paciente">
        <Link href={`/patients/${params.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </DashboardHeader>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <PatientDetails patient={patient} />
        </TabsContent>
        <TabsContent value="appointments">
          <PatientAppointments appointments={appointments || []} patientId={params.id} />
        </TabsContent>
        <TabsContent value="assessments">
          <PatientAssessments assessments={assessments || []} patientId={params.id} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
