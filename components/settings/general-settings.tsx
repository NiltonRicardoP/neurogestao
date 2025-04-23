"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSupabase } from "@/hooks/use-supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Building, Calendar, Clock, Globe, Mail, MessageSquare, Bell } from "lucide-react"

const formSchema = z.object({
  systemName: z.string().min(2, {
    message: "O nome do sistema deve ter pelo menos 2 caracteres.",
  }),
  organizationName: z.string().min(2, {
    message: "O nome da organização deve ter pelo menos 2 caracteres.",
  }),
  contactEmail: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  dateFormat: z.string(),
  timeFormat: z.string(),
  defaultLanguage: z.string(),
  enableNotifications: z.boolean(),
  welcomeMessage: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof formSchema>

export function GeneralSettings({ settings }: { settings: any[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()

  // Extrair valores das configurações
  const getSettingValue = (key: string, defaultValue: any = "") => {
    const setting = settings.find((s) => s.key === `general.${key}`)
    return setting ? setting.value : defaultValue
  }

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemName: getSettingValue("systemName", "NeuroGestão"),
      organizationName: getSettingValue("organizationName", ""),
      contactEmail: getSettingValue("contactEmail", ""),
      dateFormat: getSettingValue("dateFormat", "DD/MM/YYYY"),
      timeFormat: getSettingValue("timeFormat", "24h"),
      defaultLanguage: getSettingValue("defaultLanguage", "pt-BR"),
      enableNotifications: getSettingValue("enableNotifications", true),
      welcomeMessage: getSettingValue("welcomeMessage", ""),
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true)

    try {
      // Função para atualizar ou criar uma configuração
      const upsertSetting = async (key: string, value: any) => {
        const fullKey = `general.${key}`
        const existingSetting = settings.find((s) => s.key === fullKey)

        if (existingSetting) {
          await supabase
            .from("settings")
            .update({
              value,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSetting.id)
        } else {
          await supabase.from("settings").insert({
            key: fullKey,
            value,
            description: `Configuração geral: ${key}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      // Atualizar todas as configurações
      await Promise.all([
        upsertSetting("systemName", data.systemName),
        upsertSetting("organizationName", data.organizationName),
        upsertSetting("contactEmail", data.contactEmail),
        upsertSetting("dateFormat", data.dateFormat),
        upsertSetting("timeFormat", data.timeFormat),
        upsertSetting("defaultLanguage", data.defaultLanguage),
        upsertSetting("enableNotifications", data.enableNotifications),
        upsertSetting("welcomeMessage", data.welcomeMessage),
      ])

      toast({
        title: "Configurações atualizadas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações da Organização
            </CardTitle>
            <CardDescription>Configure as informações básicas da sua organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="systemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Sistema</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Nome exibido no cabeçalho e título da página</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Organização</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Nome da sua clínica ou organização</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    E-mail de Contato
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>E-mail usado para notificações do sistema</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Localização e Formato
            </CardTitle>
            <CardDescription>Configure os formatos de data, hora e idioma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Formato de Data
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Formato de Hora
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="24h">24 horas</SelectItem>
                        <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Idioma Padrão
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações e Mensagens
            </CardTitle>
            <CardDescription>Configure as notificações e mensagens do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificações do Sistema</FormLabel>
                    <FormDescription>Ativar notificações automáticas do sistema</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Mensagem de Boas-vindas
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma mensagem de boas-vindas para os usuários"
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Esta mensagem será exibida na tela de login</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
