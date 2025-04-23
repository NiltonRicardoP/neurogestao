"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useSupabase } from "@/hooks/use-supabase"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
})

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { supabase } = useSupabase()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar e-mail de recuperação",
          description: error.message,
        })
        return
      }

      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para o link de recuperação de senha.",
      })
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail de recuperação",
        description: "Ocorreu um erro ao tentar enviar o e-mail. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>
    </Form>
  )
}
