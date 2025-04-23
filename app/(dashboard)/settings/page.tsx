import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { GeneralSettings } from "@/components/settings/general-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { AdvancedSettings } from "@/components/settings/advanced-settings"
import { ClinicalSettings } from "@/components/settings/clinical-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { InterfaceSettings } from "@/components/settings/interface-settings"
import { Cog, ShieldAlert, Wrench, Stethoscope, Bell, Palette } from "lucide-react"

export const metadata: Metadata = {
  title: "Configurações - NeuroGestão",
  description: "Configurações do sistema",
}

export default async function SettingsPage() {
  const supabase = createClient()

  // Buscar configurações do sistema
  const { data: settings } = await supabase.from("settings").select("*")

  // Organizar as configurações por categoria
  const generalSettings = settings?.filter((s) => s.key.startsWith("general.")) || []
  const securitySettings = settings?.filter((s) => s.key.startsWith("security.")) || []
  const advancedSettings = settings?.filter((s) => s.key.startsWith("advanced.")) || []
  const clinicalSettings = settings?.filter((s) => s.key.startsWith("clinical.")) || []
  const notificationSettings = settings?.filter((s) => s.key.startsWith("notification.")) || []
  const interfaceSettings = settings?.filter((s) => s.key.startsWith("interface.")) || []
  const reportSettings = settings?.filter((s) => s.key.startsWith("reports.")) || []

  return (
    <DashboardShell>
      <DashboardHeader heading="Configurações" description="Gerencie as configurações do sistema" />

      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2 py-3">
              <Cog className="h-4 w-4" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-3">
              <ShieldAlert className="h-4 w-4" />
              <span>Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-2 py-3">
              <Stethoscope className="h-4 w-4" />
              <span>Clínica</span>
            </TabsTrigger>
            <TabsTrigger value="notification" className="flex items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span>Interface</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 py-3">
              <Wrench className="h-4 w-4" />
              <span>Avançado</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralSettings settings={generalSettings} />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecuritySettings settings={securitySettings} />
          </TabsContent>

          <TabsContent value="clinical" className="space-y-4">
            <ClinicalSettings settings={clinicalSettings} />
          </TabsContent>

          <TabsContent value="notification" className="space-y-4">
            <NotificationSettings settings={notificationSettings} />
          </TabsContent>

          <TabsContent value="interface" className="space-y-4">
            <InterfaceSettings settings={interfaceSettings} reportSettings={reportSettings} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <AdvancedSettings settings={advancedSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
