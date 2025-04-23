"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type Section = Database["public"]["Tables"]["assessment_sections"]["Row"]

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
})

interface SectionFormProps {
  section?: Section
  action: (formData: FormData) => Promise<void>
}

export function SectionForm({ section, action }: SectionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section?.title || "",
      description: section?.description || "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description || "")

    try {
      await action(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da seção" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome descritivo para a seção (ex: "Dados Pessoais", "Avaliação Cognitiva")
                  </FormDescription>
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
                    <Textarea placeholder="Descrição da seção" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>Descreva o propósito e as características desta seção</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={`/assessment-models/${params.id}`}>
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
