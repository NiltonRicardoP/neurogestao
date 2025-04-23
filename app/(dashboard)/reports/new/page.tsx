import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ReportForm } from "@/components/reports/report-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Novo Relatório - NeuroGestão",
  description: "Criar novo relatório",
}

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: { patientId?: string; assessmentId?: string }
}) {
  const supabase = createClient()

  // Fetch patients for the dropdown
  const { data: patients } = await supabase.from("patients").select("id, name").order("name", { ascending: true })

  // If assessmentId is provided, fetch assessment details
  let assessment = null
  if (searchParams.assessmentId) {
    const { data } = await supabase
      .from("assessments")
      .select("*, patients(name)")
      .eq("id", searchParams.assessmentId)
      .single()

    assessment = data
  }

  async function createReport(formData: FormData) {
    "use server"

    const supabase = createClient()

    const patientId = formData.get("patientId") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    const { data, error } = await supabase
      .from("reports")
      .insert({
        patient_id: patientId,
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw new Error(`Erro ao criar relatório: ${error.message}`)
    }

    redirect(`/reports/${data[0].id}`)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Novo Relatório" description="Crie um novo relatório para o paciente" />
      <ReportForm
        patients={patients || []}
        action={createReport}
        defaultPatientId={searchParams.patientId || assessment?.patient_id || ""}
        assessment={assessment}
      />
    </DashboardShell>
  )
}
