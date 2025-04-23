"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface DynamicAssessmentFormProps {
  patientId: string
  modelId: string
  sections: any[]
}

export function DynamicAssessmentForm({ patientId, modelId, sections }: DynamicAssessmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Criar um schema dinâmico baseado nos campos do modelo
  const createDynamicSchema = () => {
    const schemaFields: Record<string, any> = {
      title: z.string().min(1, { message: "O título é obrigatório" }),
      notes: z.string().optional(),
    }

    sections.forEach((section) => {
      section.fields.forEach((field: any) => {
        const fieldId = `field_${field.id}`

        if (field.type === "text" || field.type === "textarea") {
          schemaFields[fieldId] = field.required
            ? z.string().min(1, { message: "Este campo é obrigatório" })
            : z.string().optional()
        } else if (field.type === "number") {
          schemaFields[fieldId] = field.required
            ? z
                .string()
                .min(1, { message: "Este campo é obrigatório" })
                .refine((val) => !isNaN(Number(val)), { message: "Deve ser um número válido" })
            : z
                .string()
                .optional()
                .refine((val) => !val || !isNaN(Number(val)), { message: "Deve ser um número válido" })
        } else if (field.type === "select" || field.type === "radio") {
          schemaFields[fieldId] = field.required
            ? z.string().min(1, { message: "Este campo é obrigatório" })
            : z.string().optional()
        } else if (field.type === "checkbox") {
          schemaFields[fieldId] = z.array(z.string()).optional()
        } else {
          schemaFields[fieldId] = field.required
            ? z.string().min(1, { message: "Este campo é obrigatório" })
            : z.string().optional()
        }
      })
    })

    return z.object(schemaFields)
  }

  const dynamicSchema = createDynamicSchema()
  type FormValues = z.infer<typeof dynamicSchema>

  // Criar valores padrão para o formulário
  const createDefaultValues = () => {
    const defaultValues: Record<string, any> = {
      title: "",
      notes: "",
    }

    sections.forEach((section) => {
      section.fields.forEach((field: any) => {
        const fieldId = `field_${field.id}`

        if (field.type === "checkbox") {
          defaultValues[fieldId] = []
        } else {
          defaultValues[fieldId] = ""
        }
      })
    })

    return defaultValues
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: createDefaultValues(),
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      // Criar a avaliação
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          patient_id: patientId,
          title: values.title,
          notes: values.notes,
          model_id: modelId,
          status: "em_andamento",
        })
        .select()
        .single()

      if (assessmentError) {
        throw new Error(`Erro ao criar avaliação: ${assessmentError.message}`)
      }

      // Salvar os resultados dos campos
      const fieldResults = sections.flatMap((section) =>
        section.fields.map((field: any) => {
          const fieldId = `field_${field.id}`
          let value = values[fieldId]

          // Converter arrays para string JSON
          if (Array.isArray(value)) {
            value = JSON.stringify(value)
          }

          return {
            assessment_id: assessment.id,
            field_id: field.id,
            value: value || "",
          }
        }),
      )

      const { error: resultsError } = await supabase.from("assessment_results").insert(fieldResults)

      if (resultsError) {
        throw new Error(`Erro ao salvar resultados: ${resultsError.message}`)
      }

      toast({
        title: "Avaliação criada com sucesso",
        description: "A avaliação foi criada e os resultados foram salvos.",
      })

      router.push(`/assessments/${assessment.id}`)
    } catch (error: any) {
      console.error("Erro ao salvar avaliação:", error)
      toast({
        variant: "destructive",
        title: "Erro ao criar avaliação",
        description: error.message || "Ocorreu um erro ao tentar criar a avaliação.",
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
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Informações básicas sobre a avaliação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Avaliação</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da avaliação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações gerais sobre a avaliação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field: any) => {
                const fieldId = `field_${field.id}`

                return (
                  <div key={field.id}>
                    {field.type === "text" && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                              <Input {...formField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {field.type === "textarea" && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                              <Textarea {...formField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {field.type === "number" && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...formField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {field.type === "select" && field.options && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {JSON.parse(field.options).map((option: string) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {field.type === "radio" && field.options && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={({ field: formField }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={formField.onChange}
                                defaultValue={formField.value}
                                className="flex flex-col space-y-1"
                              >
                                {JSON.parse(field.options).map((option: string) => (
                                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {field.type === "checkbox" && field.options && (
                      <FormField
                        control={form.control}
                        name={fieldId}
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">
                                {field.label} {field.required && <span className="text-destructive">*</span>}
                              </FormLabel>
                            </div>
                            {JSON.parse(field.options).map((option: string) => (
                              <FormField
                                key={option}
                                control={form.control}
                                name={fieldId}
                                render={({ field: formField }) => {
                                  return (
                                    <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={formField.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? formField.onChange([...formField.value, option])
                                              : formField.onChange(
                                                  formField.value?.filter((value: string) => value !== option),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">{option}</FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Avaliação"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
