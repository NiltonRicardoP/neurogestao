"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSupabase } from "@/hooks/use-supabase"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  patient_id: z.string().uuid(),
  date: z.date(),
  model_id: z.string().uuid(),
  notes: z.string().optional(),
  status: z.enum(["agendada", "em_andamento", "concluida", "cancelada"]),
  field_values: z.record(z.string(), z.string().optional()),
})

export function AssessmentForm({ patients, models, assessment, isEditing = false }) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [modelSections, setModelSections] = useState([])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: assessment?.patient_id || "",
      date: assessment?.date ? new Date(assessment.date) : new Date(),
      model_id: assessment?.model_id || "",
      notes: assessment?.notes || "",
      status: assessment?.status || "agendada",
      field_values: {},
    },
  })

  // Carregar seções e campos do modelo selecionado
  useEffect(() => {
    const modelId = form.watch("model_id")
    if (!modelId) return

    const loadModelData = async () => {
      try {
        // Buscar seções do modelo
        const { data: sections, error: sectionsError } = await supabase
          .from("assessment_sections")
          .select("*")
          .eq("model_id", modelId)
          .order("order_index", { ascending: true })

        if (sectionsError) throw sectionsError

        // Buscar campos para cada seção
        const sectionsWithFields = await Promise.all(
          sections.map(async (section) => {
            const { data: fields, error: fieldsError } = await supabase
              .from("assessment_fields")
              .select("*")
              .eq("section_id", section.id)
              .order("order_index", { ascending: true })

            if (fieldsError) throw fieldsError

            return {
              ...section,
              fields: fields || [],
            }
          }),
        )

        setModelSections(sectionsWithFields)
        setSelectedModel(models.find((m) => m.id === modelId))

        // Se estiver editando, carregar valores dos campos
        if (isEditing && assessment?.id) {
          const { data: fieldValues, error: fieldValuesError } = await supabase
            .from("assessment_results")
            .select("field_id, value")
            .eq("assessment_id", assessment.id)

          if (fieldValuesError) throw fieldValuesError

          const values = {}
          fieldValues.forEach((item) => {
            values[item.field_id] = item.value
          })

          form.setValue("field_values", values)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do modelo:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do modelo de avaliação.",
          variant: "destructive",
        })
      }
    }

    loadModelData()
  }, [form.watch("model_id"), supabase, isEditing, assessment, models, form])

  async function onSubmit(values) {
    setLoading(true)
    try {
      let assessmentId = assessment?.id

      // Criar ou atualizar a avaliação
      if (isEditing && assessmentId) {
        const { error } = await supabase
          .from("assessments")
          .update({
            patient_id: values.patient_id,
            date: values.date.toISOString(),
            model_id: values.model_id,
            notes: values.notes,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assessmentId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from("assessments")
          .insert({
            patient_id: values.patient_id,
            date: values.date.toISOString(),
            model_id: values.model_id,
            notes: values.notes,
            status: values.status,
          })
          .select()

        if (error) throw error
        assessmentId = data[0].id
      }

      // Salvar os valores dos campos
      if (values.field_values && Object.keys(values.field_values).length > 0) {
        // Primeiro, excluir resultados existentes se estiver editando
        if (isEditing) {
          await supabase.from("assessment_results").delete().eq("assessment_id", assessmentId)
        }

        // Inserir novos resultados
        const resultsToInsert = Object.entries(values.field_values)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([fieldId, value]) => ({
            assessment_id: assessmentId,
            field_id: fieldId,
            value: value,
          }))

        if (resultsToInsert.length > 0) {
          const { error } = await supabase.from("assessment_results").insert(resultsToInsert)

          if (error) throw error
        }
      }

      toast({
        title: "Sucesso",
        description: isEditing ? "Avaliação atualizada com sucesso." : "Avaliação criada com sucesso.",
      })

      router.push(isEditing ? `/assessments/${assessmentId}` : "/assessments")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a avaliação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Renderizar campo de acordo com o tipo
  const renderField = (field, fieldValue) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={fieldValue || ""}
            onChange={(e) => {
              const newValues = { ...form.getValues("field_values") }
              newValues[field.id] = e.target.value
              form.setValue("field_values", newValues)
            }}
            placeholder={`Digite ${field.label.toLowerCase()}`}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={fieldValue || ""}
            onChange={(e) => {
              const newValues = { ...form.getValues("field_values") }
              newValues[field.id] = e.target.value
              form.setValue("field_values", newValues)
            }}
            placeholder={`Digite ${field.label.toLowerCase()}`}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={fieldValue || ""}
            onChange={(e) => {
              const newValues = { ...form.getValues("field_values") }
              newValues[field.id] = e.target.value
              form.setValue("field_values", newValues)
            }}
            placeholder={`Digite ${field.label.toLowerCase()}`}
          />
        )
      case "select":
        const selectOptions = field.options ? JSON.parse(field.options) : []
        return (
          <Select
            value={fieldValue || ""}
            onValueChange={(value) => {
              const newValues = { ...form.getValues("field_values") }
              newValues[field.id] = value
              form.setValue("field_values", newValues)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        const radioOptions = field.options ? JSON.parse(field.options) : []
        return (
          <RadioGroup
            value={fieldValue || ""}
            onValueChange={(value) => {
              const newValues = { ...form.getValues("field_values") }
              newValues[field.id] = value
              form.setValue("field_values", newValues)
            }}
          >
            {radioOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <label htmlFor={`${field.id}-${option}`}>{option}</label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        const checkboxOptions = field.options ? JSON.parse(field.options) : []
        const selectedValues = fieldValue ? fieldValue.split(",") : []

        return (
          <div className="space-y-2">
            {checkboxOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelectedValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option)

                    const newValues = { ...form.getValues("field_values") }
                    newValues[field.id] = newSelectedValues.join(",")
                    form.setValue("field_values", newValues)
                  }}
                />
                <label htmlFor={`${field.id}-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        )
      default:
        return <Input />
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={loading}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="model_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo de Avaliação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading || isEditing}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo de avaliação" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {isEditing
                  ? "O modelo de avaliação não pode ser alterado após a criação."
                  : "Selecione o modelo de avaliação a ser utilizado."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Observações sobre a avaliação"
                  className="resize-none"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedModel && modelSections.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Formulário de Avaliação: {selectedModel.name}</h3>

            <Tabs defaultValue={modelSections[0]?.id} className="w-full">
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${modelSections.length}, 1fr)` }}>
                {modelSections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {modelSections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description || "Sem descrição"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.fields.map((field) => {
                        const fieldValues = form.getValues("field_values")
                        const fieldValue = fieldValues[field.id]

                        return (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center">
                              <label className="text-sm font-medium">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                            </div>
                            {renderField(field, fieldValue)}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Atualizar Avaliação" : "Criar Avaliação"}
        </Button>
      </form>
    </Form>
  )
}
