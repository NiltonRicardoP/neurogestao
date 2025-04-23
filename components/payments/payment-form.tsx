"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  patientId: z.string({
    required_error: "Selecione um paciente",
  }),
  amount: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  status: z.string({
    required_error: "Selecione um status",
  }),
  paymentMethodId: z.string().optional(),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  paymentPlanId: z.string().optional(),
})

type Patient = {
  id: string
  name: string
}

type PaymentMethod = {
  id: string
  name: string
}

type PaymentPlan = {
  id: string
  name: string
  amount: number
  description: string
}

type PendingAppointment = {
  id: string
  date: string
  patient_id: string
  patients: {
    name: string
  }
}

interface PaymentFormProps {
  patients: Patient[]
  paymentMethods: PaymentMethod[]
  paymentPlans: PaymentPlan[]
  pendingAppointments: PendingAppointment[]
  createPayment: (formData: FormData) => Promise<any>
}

// Função auxiliar para formatar data
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

export function PaymentForm({
  patients,
  paymentMethods,
  paymentPlans,
  pendingAppointments,
  createPayment,
}: PaymentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState("manual")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      amount: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString())
        } else if (value !== undefined) {
          formData.append(key, String(value))
        }
      })

      const payment = await createPayment(formData)
      toast({
        title: "Pagamento registrado com sucesso",
        description: `O pagamento foi registrado com o status ${values.status === "completed" ? "Concluído" : "Pendente"}.`,
      })
      router.push(`/payments/${payment.id}`)
      router.refresh()
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error)
      toast({
        title: "Erro ao registrar pagamento",
        description: "Ocorreu um erro ao registrar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlanSelect = (plan: PaymentPlan) => {
    form.setValue("amount", plan.amount.toString())
    form.setValue("paymentPlanId", plan.id)
  }

  const handleAppointmentSelect = (appointment: PendingAppointment) => {
    form.setValue("patientId", appointment.patient_id)
    form.setValue("referenceType", "appointment")
    form.setValue("referenceId", appointment.id)

    // Buscar o plano de pagamento para consulta individual
    const consultationPlan = paymentPlans.find((plan) => plan.name.includes("Consulta"))
    if (consultationPlan) {
      form.setValue("amount", consultationPlan.amount.toString())
      form.setValue("paymentPlanId", consultationPlan.id)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="manual">Pagamento Manual</TabsTrigger>
            <TabsTrigger value="appointment">De Agendamento</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="manual">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Paciente</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? patients.find((patient) => patient.id === field.value)?.name
                                  : "Selecione um paciente"}
                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Buscar paciente..." />
                              <CommandList>
                                <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                                <CommandGroup>
                                  {patients.map((patient) => (
                                    <CommandItem
                                      key={patient.id}
                                      value={patient.name}
                                      onSelect={() => {
                                        form.setValue("patientId", patient.id)
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          patient.id === field.value ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {patient.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" {...field} type="number" step="0.01" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentPlanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano de Pagamento</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            const plan = paymentPlans.find((p) => p.id === value)
                            if (plan) handlePlanSelect(plan)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} -{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(plan.amount)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="appointment">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referenceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agendamento</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            const appointment = pendingAppointments.find((a) => a.id === value)
                            if (appointment) handleAppointmentSelect(appointment)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um agendamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pendingAppointments.map((appointment) => (
                              <SelectItem key={appointment.id} value={appointment.id}>
                                {formatDate(appointment.date)} - {appointment.patients.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <div className="grid gap-6 md:grid-cols-2">
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
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? (
                              formatDate(field.value.toISOString()).split(" ")[0]
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
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
                      <Textarea placeholder="Observações sobre o pagamento" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Registrar Pagamento"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
