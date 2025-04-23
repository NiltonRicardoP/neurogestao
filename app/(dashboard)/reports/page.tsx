import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { ReportsList } from "@/components/reports/reports-list"

export const metadata: Metadata = {
  title: "Relatórios - NeuroGestão",
  description: "Gerenciamento de relatórios",
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const supabase = createClient()
  const page = Number(searchParams.page) || 1
  const pageSize = 10
  const search = searchParams.search || ""

  // Fetch total count for pagination
  let query = supabase.from("reports").select("*", { count: "exact" })

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const { count } = await query

  // Fetch reports with pagination
  let reportsQuery = supabase
    .from("reports")
    .select("*, patients(name)")
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("created_at", { ascending: false })

  if (search) {
    reportsQuery = reportsQuery.ilike("title", `%${search}%`)
  }

  const { data: reports } = await reportsQuery

  return (
    <DashboardShell>
      <DashboardHeader heading="Relatórios" description="Gerenciamento de relatórios">
        <Link href="/reports/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Relatório
          </Button>
        </Link>
      </DashboardHeader>
      <ReportsList reports={reports || []} pageCount={Math.ceil((count || 0) / pageSize)} page={page} search={search} />
    </DashboardShell>
  )
}
