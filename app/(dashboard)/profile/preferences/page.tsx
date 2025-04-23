import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserPreferencesForm } from "@/components/profile/user-preferences-form"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"

// Importe o componente ThemeDebug
import { ThemeDebug } from "@/components/theme-debug"

export default async function UserPreferencesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  // Adicione o componente ThemeDebug antes do UserPreferencesForm
  return (
    <DashboardShell>
      <DashboardHeader heading="Preferências" text="Personalize sua experiência no sistema." />
      <div className="grid gap-8">
        <ThemeDebug />
        <UserPreferencesForm preferences={preferences || {}} userId={session.user.id} />
      </div>
    </DashboardShell>
  )
}
