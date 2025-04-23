import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { AssessmentsList } from "@/components/assessments/assessments-list"

export const metadata: Metadata = {
  title: "Avaliações - NeuroGestão",
  description: "Gerenciamento de avaliações neuropsicológicas",
}

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string }
}) {
  const supabase = createClient()
  const page = Number(searchParams.page) || 1
  const pageSize = 10
  const search = searchParams.search || ""
  const status = searchParams.status || ""

  // Fetch total count for pagination
  let query = supabase.from("assessments").select("*", { count: "exact" })

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { count } = await query

  // Fetch assessments with pagination
  let assessmentsQuery = supabase
    .from("assessments")
    .select("*, patients(name)")
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("date", { ascending: false })

  if (search) {
    assessmentsQuery = assessmentsQuery.ilike("title", `%${search}%`)
  }

  if (status) {
    assessmentsQuery = assessmentsQuery.eq("status", status)
  }

  const { data: assessments } = await assessmentsQuery

  // Map status values to English equivalents if needed
  const mappedAssessments =
    assessments?.map((assessment) => {
      // This is where you would map Portuguese status to English if needed
      // For example: assessment.status = mapStatusToEnglish(assessment.status);
      return assessment
    }) || []

  return (
    <DashboardShell>
      <DashboardHeader heading="Avaliações" description="Gerenciamento de avaliações neuropsicológicas">
        <Link href="/assessments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </Link>
      </DashboardHeader>
      <AssessmentsList
        assessments={mappedAssessments}
        pageCount={Math.ceil((count || 0) / pageSize)}
        page={page}
        search={search}
        status={status}
      />
    </DashboardShell>
  )
}
