import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  if (!user) {
    return <div>Usuário não encontrado</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Perfil" text="Gerencie suas informações pessoais e preferências." />
      <div className="grid gap-8">
        <ProfileForm user={user} />
      </div>
    </DashboardShell>
  )
}
