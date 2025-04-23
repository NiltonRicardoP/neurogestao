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
import { toast } from "@/components/ui/use-toast"
import {
  KeyRound,
  Clock,
  ShieldCheck,
  Lock,
  CaseSensitiveIcon as LetterCase,
  Hash,
  Asterisk,
  Timer,
  UserCheck,
  Database,
} from "lucide-react"

const formSchema = z.object({
  passwordMinLength: z.string().transform((val) => Number.parseInt(val, 10)),
  passwordRequireUppercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSpecialChars: z.boolean(),
  sessionTimeout: z.string(),
  maxLoginAttempts: z.string().transform((val) => Number.parseInt(val, 10)),
  twoFactorAuth: z.boolean(),
  dataEncryption: z.boolean(),
})

type SecurityFormValues = z.infer<typeof formSchema>

export function SecuritySettings({ settings }: { settings: any[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()

  // Extrair valores das configurações
  const getSettingValue = (key: string, defaultValue: any = "") => {
    const setting = settings.find((s) => s.key === `security.${key}`)
    return setting ? setting.value : defaultValue
  }

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordMinLength: getSettingValue("passwordMinLength", "8"),
      passwordRequireUppercase: getSettingValue("passwordRequireUppercase", true),
      passwordRequireNumbers: getSettingValue("passwordRequireNumbers", true),
      passwordRequireSpecialChars: getSettingValue("passwordRequireSpecialChars", false),
      sessionTimeout: getSettingValue("sessionTimeout", "30min"),
      maxLoginAttempts: getSettingValue("maxLoginAttempts", "5"),
      twoFactorAuth: getSettingValue("twoFactorAuth", false),
      dataEncryption: getSettingValue("dataEncryption", true),
    },
  })

  async function onSubmit(data: SecurityFormValues) {
    setIsLoading(true)

    try {
      // Função para atualizar ou criar uma configuração
      const upsertSetting = async (key: string, value: any) => {
        const fullKey = `security.${key}`
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
            description: `Configuração de segurança: ${key}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      // Atualizar todas as configurações
      await Promise.all([
        upsertSetting("passwordMinLength", data.passwordMinLength),
        upsertSetting("passwordRequireUppercase", data.passwordRequireUppercase),
        upsertSetting("passwordRequireNumbers", data.passwordRequireNumbers),
        upsertSetting("passwordRequireSpecialChars", data.passwordRequireSpecialChars),
        upsertSetting("sessionTimeout", data.sessionTimeout),
        upsertSetting("maxLoginAttempts", data.maxLoginAttempts),
        upsertSetting("twoFactorAuth", data.twoFactorAuth),
        upsertSetting("dataEncryption", data.dataEncryption),
      ])

      toast({
        title: "Configurações atualizadas",
        description: "As configurações de segurança foram atualizadas com sucesso.",
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
              <KeyRound className="h-5 w-5" />
              Política de Senhas
            </CardTitle>
            <CardDescription>Configure os requisitos de segurança para senhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="passwordMinLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Tamanho Mínimo da Senha
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="6" max="20" />
                    </FormControl>
                    <FormDescription>Número mínimo de caracteres para senhas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxLoginAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      Tentativas Máximas de Login
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="3" max="10" />
                    </FormControl>
                    <FormDescription>Número máximo de tentativas antes de bloquear</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="passwordRequireUppercase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1">
                        <LetterCase className="h-4 w-4" />
                        Letras Maiúsculas
                      </FormLabel>
                      <FormDescription className="text-xs">Exigir pelo menos uma letra maiúscula</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordRequireNumbers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        Números
                      </FormLabel>
                      <FormDescription className="text-xs">Exigir pelo menos um número</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordRequireSpecialChars"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1">
                        <Asterisk className="h-4 w-4" />
                        Caracteres Especiais
                      </FormLabel>
                      <FormDescription className="text-xs">Exigir caracteres especiais (!@#$%)</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Segurança da Sessão
            </CardTitle>
            <CardDescription>Configure as opções de segurança para sessões de usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Tempo Limite da Sessão
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tempo limite" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15min">15 minutos</SelectItem>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="1h">1 hora</SelectItem>
                      <SelectItem value="2h">2 horas</SelectItem>
                      <SelectItem value="4h">4 horas</SelectItem>
                      <SelectItem value="8h">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Tempo de inatividade antes de encerrar a sessão</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="twoFactorAuth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1 text-base">
                        <ShieldCheck className="h-4 w-4" />
                        Autenticação de Dois Fatores
                      </FormLabel>
                      <FormDescription>Exigir verificação adicional ao fazer login</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEncryption"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1 text-base">
                        <Database className="h-4 w-4" />
                        Criptografia de Dados
                      </FormLabel>
                      <FormDescription>Criptografar dados sensíveis no banco de dados</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
