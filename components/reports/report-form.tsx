"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Database } from "@/types/supabase"
import { createClient } from "@/lib/supabase/client"
import { Editor } from "@/components/editor"

type Patient = Pick<Database["public"]["Tables"]["patients"]["Row"], "id" | "name">
type Report = Database["public"]["Tables"]["reports"]["Row"]
type AssessmentWithPatient = Database["public"]["Tables"]["assessments"]["Row"] & {
  patients: {
    name: string
  }
}

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Por favor, selecione um paciente.",
  }),
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  content: z.string().min(10, {
    message: "O conteúdo deve ter pelo menos 10 caracteres.",
  }),
})

interface ReportFormProps {
  patients: Patient[]
  report?: Report
  action: (formData: FormData) => Promise<void>
  defaultPatientId?: string
  assessment?: AssessmentWithPatient | null
}

export function ReportForm({ patients, report, action, defaultPatientId, assessment }: ReportFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: report?.patient_id || defaultPatientId || "",
      title: report?.title || (assessment ? `Relatório: ${assessment.title}` : ""),
      content: report?.content || "",
    },
  })

  const patientId = form.watch("patientId")

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return

      // Fetch patient details
      const { data: patient } = await supabase.from("patients").select("*").eq("id", patientId).single()

      if (!patient) return

      // Fetch patient assessments
      const { data: assessments } = await supabase
        .from("assessments")
        .select("*")
        .eq("patient_id", patientId)
        .order("date", { ascending: false })

      setPatientData({
        patient,
        assessments: assessments || [],
      })
    }

    fetchPatientData()
  }, [patientId, supabase])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("patientId", data.patientId)
    formData.append("title", data.title)
    formData.append("content", data.content)

    try {
      await action(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const generateTemplate = () => {
    if (!patientData) return ""

    const { patient, assessments } = patientData
    const age = calculateAge(patient.birth_date)

    const template = `# Relatório de Avaliação Neuropsicológica

## Identificação
**Nome:** ${patient.name}
**Idade:** ${age} anos
**Data de Nascimento:** ${formatDate(patient.birth_date)}
**Gênero:** ${patient.gender}

## Motivo da Avaliação
[Descreva aqui o motivo da avaliação]

## Histórico
${patient.medical_history || "[Descreva aqui o histórico do paciente]"}

## Testes Aplicados
[Liste aqui os testes aplicados]

## Resultados
[Descreva aqui os resultados obtidos]

## Conclusão
[Descreva aqui a conclusão da avaliação]

## Recomendações
[Descreva aqui as recomendações para o paciente]

---
Data: ${formatDate(new Date().toISOString())}
`

    return template
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do relatório" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Editor value={field.value} onChange={field.onChange} placeholder="Conteúdo do relatório" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {patientId && !report && (
              <Button type="button" variant="outline" onClick={() => form.setValue("content", generateTemplate())}>
                Gerar Modelo de Relatório
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/reports">
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
