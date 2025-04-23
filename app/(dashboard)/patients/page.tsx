import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { PatientsList } from "@/components/patients/patients-list"

export const metadata: Metadata = {
  title: "Pacientes - NeuroGestão",
  description: "Gerenciamento de pacientes",
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const supabase = createClient()
  const page = Number(searchParams.page) || 1
  const pageSize = 10
  const search = searchParams.search || ""

  // Fetch total count for pagination
  let query = supabase.from("patients").select("*", { count: "exact" })

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { count } = await query

  // Fetch patients with pagination
  let patientsQuery = supabase
    .from("patients")
    .select("*")
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("name", { ascending: true })

  if (search) {
    patientsQuery = patientsQuery.ilike("name", `%${search}%`)
  }

  const { data: patients } = await patientsQuery

  return (
    <DashboardShell>
      <DashboardHeader heading="Pacientes" description="Gerenciamento de pacientes">
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </DashboardHeader>
      <PatientsList
        patients={patients || []}
        pageCount={Math.ceil((count || 0) / pageSize)}
        page={page}
        search={search}
      />
    </DashboardShell>
  )
}
