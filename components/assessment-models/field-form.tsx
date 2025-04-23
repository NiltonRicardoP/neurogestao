"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type Field = Database["public"]["Tables"]["assessment_fields"]["Row"]

const formSchema = z.object({
  label: z.string().min(2, {
    message: "O rótulo deve ter pelo menos 2 caracteres.",
  }),
  type: z.string().min(1, {
    message: "Por favor, selecione um tipo de campo.",
  }),
  required: z.boolean().default(false),
  options: z.string().optional(),
})

interface FieldFormProps {
  field?: Field
  action: (formData: FormData) => Promise<void>
}

export function FieldForm({ field, action }: FieldFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const params = useParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: field?.label || "",
      type: field?.type || "text",
      required: field?.required || false,
      options: field?.options ? (field.options as string[]).join("\n") : "",
    },
  })

  const watchType = form.watch("type")

  useEffect(() => {
    setShowOptions(["select", "radio", "checkbox"].includes(watchType))
  }, [watchType])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("label", data.label)
    formData.append("type", data.type)
    formData.append("required", data.required.toString())
    formData.append("options", data.options || "")

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
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rótulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Rótulo do campo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome descritivo para o campo (ex: "Nome", "Data de Nascimento", "Pontuação")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Campo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo de campo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Texto curto</SelectItem>
                      <SelectItem value="textarea">Texto longo</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="select">Seleção (dropdown)</SelectItem>
                      <SelectItem value="radio">Opções (radio)</SelectItem>
                      <SelectItem value="checkbox">Múltipla escolha (checkbox)</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Selecione o tipo de campo que melhor se adequa à informação</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Campo Obrigatório</FormLabel>
                    <FormDescription>Marque esta opção se o campo deve ser preenchido obrigatoriamente</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {showOptions && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opções</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite cada opção em uma linha separada"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Digite cada opção em uma linha separada. Exemplo:
                      <br />
                      Opção 1
                      <br />
                      Opção 2
                      <br />
                      Opção 3
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
