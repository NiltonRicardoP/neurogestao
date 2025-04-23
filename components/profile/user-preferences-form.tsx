"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { useSupabase } from "@/hooks/use-supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"

const preferencesFormSchema = z.object({
  theme: z.string(),
  language: z.string(),
  notifications_enabled: z.boolean(),
  email_notifications_enabled: z.boolean(),
})

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>

export function UserPreferencesForm({ preferences, userId }: { preferences: any; userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const { setTheme } = useTheme()

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: preferences.theme || "system",
      language: preferences.language || "pt-BR",
      notifications_enabled: preferences.notifications_enabled || false,
      email_notifications_enabled: preferences.email_notifications_enabled || false,
    },
  })

  // Aplicar o tema quando o formulário for carregado
  useEffect(() => {
    if (preferences.theme) {
      setTheme(preferences.theme)
    }
  }, [preferences.theme, setTheme])

  async function onSubmit(data: PreferencesFormValues) {
    setIsLoading(true)

    try {
      // Aplicar o tema imediatamente
      setTheme(data.theme)

      if (preferences.id) {
        // Atualizar preferências existentes
        const { error } = await supabase
          .from("user_preferences")
          .update({
            theme: data.theme,
            language: data.language,
            notifications_enabled: data.notifications_enabled,
            email_notifications_enabled: data.email_notifications_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq("id", preferences.id)

        if (error) throw error
      } else {
        // Criar novas preferências
        const { error } = await supabase.from("user_preferences").insert({
          user_id: userId,
          theme: data.theme,
          language: data.language,
          notifications_enabled: data.notifications_enabled,
          email_notifications_enabled: data.email_notifications_enabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao atualizar preferências",
        description: "Ocorreu um erro ao atualizar suas preferências. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências do Usuário</CardTitle>
        <CardDescription>Personalize sua experiência no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Aplicar o tema imediatamente ao mudar o select
                      setTheme(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="oceanic">Oceânico</SelectItem>
                      <SelectItem value="mint">Verde Menta</SelectItem>
                      <SelectItem value="lavender">Lavanda</SelectItem>
                      <SelectItem value="rose">Rosa Suave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Escolha o tema de sua preferência.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
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
                  <FormDescription>Escolha o idioma de sua preferência.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificações no sistema</FormLabel>
                    <FormDescription>Receba notificações dentro do sistema.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email_notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificações por email</FormLabel>
                    <FormDescription>Receba notificações por email.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar preferências"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
