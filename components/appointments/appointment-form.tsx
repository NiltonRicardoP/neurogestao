"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type Patient = Pick<Database["public"]["Tables"]["patients"]["Row"], "id" | "name">
type Appointment = Database["public"]["Tables"]["appointments"]["Row"]

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Por favor, selecione um paciente.",
  }),
  date: z.string().min(1, {
    message: "Por favor, selecione uma data.",
  }),
  time: z.string().min(1, {
    message: "Por favor, selecione um horário.",
  }),
  status: z.string().min(1, {
    message: "Por favor, selecione um status.",
  }),
  notes: z.string().optional(),
})

interface AppointmentFormProps {
  patients: Patient[]
  appointment?: Appointment
  action: (formData: FormData) => Promise<void>
  defaultPatientId?: string
}

export function AppointmentForm({ patients, appointment, action, defaultPatientId }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Format date and time from appointment if it exists
  const appointmentDate = appointment?.date ? new Date(appointment.date).toISOString().split("T")[0] : ""

  const appointmentTime = appointment?.date
    ? new Date(appointment.date).toISOString().split("T")[1].substring(0, 5)
    : ""

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patient_id || defaultPatientId || "",
      date: appointmentDate || "",
      time: appointmentTime || "",
      status: appointment?.status || "agendado",
      notes: appointment?.notes || "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("patientId", data.patientId)
    formData.append("date", data.date)
    formData.append("time", data.time)
    formData.append("status", data.status)
    formData.append("notes", data.notes || "")

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="concluído">Concluído</SelectItem>
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
                    <Textarea placeholder="Observações sobre o agendamento" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>Inclua informações relevantes sobre o agendamento.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/appointments">
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
