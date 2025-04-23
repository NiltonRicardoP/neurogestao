import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"
import { Notifications } from "@/components/dashboard/notifications"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("email", session.user.email).single()

  if (!userData) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Logo className="h-6 w-6" />
            <h1 className="hidden text-xl font-bold md:inline-block">NeuroGestão</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Notifications />
            <ModeToggle />
            <UserNav user={userData} />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DashboardNav isCollapsed={false} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-2 sm:p-4 md:py-8">{children}</main>
      </div>
    </div>
  )
}
