"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/hooks/use-supabase"

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres.",
    }),
    confirmPassword: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

export function ResetPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { supabase } = useSupabase()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error.message,
        })
        return
      }

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi redefinida com sucesso.",
      })

      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro ao tentar redefinir sua senha. Tente novamente.",
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    </Form>
  )
}
