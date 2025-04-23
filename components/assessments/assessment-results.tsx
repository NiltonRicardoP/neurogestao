"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type AssessmentResultWithField = Database["public"]["Tables"]["assessment_results"]["Row"] & {
  assessment_fields: {
    label: string
    type: string
    options: any
  }
}

interface AssessmentResultsProps {
  results: AssessmentResultWithField[]
  assessmentId: string
}

export function AssessmentResults({ results, assessmentId }: AssessmentResultsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>(
    results.reduce(
      (acc, result) => {
        acc[result.field_id] = result.value
        return acc
      },
      {} as Record<string, string>,
    ),
  )
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Update existing results
      for (const result of results) {
        if (formValues[result.field_id] !== result.value) {
          await supabase
            .from("assessment_results")
            .update({ value: formValues[result.field_id], updated_at: new Date().toISOString() })
            .eq("id", result.id)
        }
      }

      // Update assessment status if needed
      await supabase
        .from("assessments")
        .update({
          status: "em_andamento",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (result: AssessmentResultWithField) => {
    const { assessment_fields: field, field_id } = result

    if (isEditing) {
      switch (field.type) {
        case "text":
          return (
            <Input value={formValues[field_id] || ""} onChange={(e) => handleInputChange(field_id, e.target.value)} />
          )
        case "textarea":
          return (
            <Textarea
              value={formValues[field_id] || ""}
              onChange={(e) => handleInputChange(field_id, e.target.value)}
              className="min-h-[100px]"
            />
          )
        case "number":
          return (
            <Input
              type="number"
              value={formValues[field_id] || ""}
              onChange={(e) => handleInputChange(field_id, e.target.value)}
            />
          )
        default:
          return (
            <Input value={formValues[field_id] || ""} onChange={(e) => handleInputChange(field_id, e.target.value)} />
          )
      }
    } else {
      return <div className="whitespace-pre-line">{result.value || "Não preenchido"}</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados da Avaliação</CardTitle>
        <CardDescription>Resultados e observações da avaliação neuropsicológica</CardDescription>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="space-y-2">
                <Label>{result.assessment_fields.label}</Label>
                {renderField(result)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum resultado registrado para esta avaliação.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione campos de avaliação ou selecione um modelo para começar.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </>
        ) : (
          <>
            <Link href={`/assessments/${assessmentId}/fields`}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Gerenciar Campos
              </Button>
            </Link>
            <Button onClick={() => setIsEditing(true)}>Editar Resultados</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
