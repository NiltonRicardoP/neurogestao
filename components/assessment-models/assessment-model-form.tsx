"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/types/supabase"

type AssessmentModel = Database["public"]["Tables"]["assessment_models"]["Row"]

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
})

type AssessmentModelFormValues = z.infer<typeof formSchema>

interface AssessmentModelFormProps {
  model?: AssessmentModel
  action: (formData: FormData) => Promise<void>
}

export function AssessmentModelForm({ model, action }: AssessmentModelFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!model

  const form = useForm<AssessmentModelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: model?.name || "",
      description: model?.description || "",
    },
  })

  async function onSubmit(data: AssessmentModelFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()

      if (model?.id) {
        formData.append("id", model.id)
      }

      formData.append("name", data.name)
      if (data.description) {
        formData.append("description", data.description)
      }

      await action(formData)

      toast({
        title: isEditing ? "Modelo atualizado" : "Modelo criado",
        description: isEditing
          ? "O modelo de avaliação foi atualizado com sucesso."
          : "O modelo de avaliação foi criado com sucesso.",
      })

      if (!isEditing) {
        router.push("/assessment-models")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o modelo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Avaliação Neuropsicológica Completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o propósito e uso deste modelo de avaliação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Atualizar Modelo" : "Salvar Modelo"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
