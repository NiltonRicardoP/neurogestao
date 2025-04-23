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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bug, Database, Save, Settings, Activity, Code, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  enableDebugMode: z.boolean(),
  logLevel: z.string(),
  backupFrequency: z.string(),
  backupRetention: z.string(),
  apiRateLimit: z.string().transform((val) => Number.parseInt(val, 10)),
  customCss: z.string().optional(),
  maintenanceMode: z.boolean(),
})

type AdvancedFormValues = z.infer<typeof formSchema>

export function AdvancedSettings({ settings }: { settings: any[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()

  // Extrair valores das configurações
  const getSettingValue = (key: string, defaultValue: any = "") => {
    const setting = settings.find((s) => s.key === `advanced.${key}`)
    return setting ? setting.value : defaultValue
  }

  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableDebugMode: getSettingValue("enableDebugMode", false),
      logLevel: getSettingValue("logLevel", "error"),
      backupFrequency: getSettingValue("backupFrequency", "daily"),
      backupRetention: getSettingValue("backupRetention", "30days"),
      apiRateLimit: getSettingValue("apiRateLimit", "100"),
      customCss: getSettingValue("customCss", ""),
      maintenanceMode: getSettingValue("maintenanceMode", false),
    },
  })

  async function onSubmit(data: AdvancedFormValues) {
    setIsLoading(true)

    try {
      // Função para atualizar ou criar uma configuração
      const upsertSetting = async (key: string, value: any) => {
        const fullKey = `advanced.${key}`
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
            description: `Configuração avançada: ${key}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      // Atualizar todas as configurações
      await Promise.all([
        upsertSetting("enableDebugMode", data.enableDebugMode),
        upsertSetting("logLevel", data.logLevel),
        upsertSetting("backupFrequency", data.backupFrequency),
        upsertSetting("backupRetention", data.backupRetention),
        upsertSetting("apiRateLimit", data.apiRateLimit),
        upsertSetting("customCss", data.customCss),
        upsertSetting("maintenanceMode", data.maintenanceMode),
      ])

      toast({
        title: "Configurações atualizadas",
        description: "As configurações avançadas foram atualizadas com sucesso.",
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
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Estas configurações são destinadas a usuários avançados. Alterações incorretas podem afetar o funcionamento
            do sistema.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Depuração e Logs
            </CardTitle>
            <CardDescription>Configure as opções de depuração e registro de logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="enableDebugMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1 text-base">
                        <Bug className="h-4 w-4" />
                        Modo de Depuração
                      </FormLabel>
                      <FormDescription>Ativar modo de depuração para desenvolvedores</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Nível de Log
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="error">Apenas Erros</SelectItem>
                        <SelectItem value="warning">Avisos e Erros</SelectItem>
                        <SelectItem value="info">Informações</SelectItem>
                        <SelectItem value="debug">Depuração Completa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Nível de detalhamento dos logs do sistema</FormDescription>
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
              <Save className="h-5 w-5" />
              Backup e Recuperação
            </CardTitle>
            <CardDescription>Configure as opções de backup e recuperação de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="backupFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Frequência de Backup
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Frequência com que os backups são realizados</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backupRetention"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Database className="h-4 w-4" />
                      Retenção de Backup
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="7days">7 dias</SelectItem>
                        <SelectItem value="30days">30 dias</SelectItem>
                        <SelectItem value="90days">90 dias</SelectItem>
                        <SelectItem value="1year">1 ano</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Período de retenção dos backups</FormDescription>
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
              <Activity className="h-5 w-5" />
              API e Desempenho
            </CardTitle>
            <CardDescription>Configure as opções de API e desempenho do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="apiRateLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Limite de Requisições API
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="10" max="1000" />
                  </FormControl>
                  <FormDescription>Número máximo de requisições por minuto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customCss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    CSS Personalizado
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Insira código CSS personalizado aqui"
                      className="font-mono min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>CSS personalizado para ajustar a aparência do sistema</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Modo de Manutenção
            </CardTitle>
            <CardDescription>Ative o modo de manutenção para realizar atualizações</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-destructive p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Modo de Manutenção</FormLabel>
                    <FormDescription>
                      Ativar modo de manutenção (sistema ficará indisponível para usuários)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
