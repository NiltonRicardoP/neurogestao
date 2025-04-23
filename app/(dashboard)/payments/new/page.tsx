import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/payments/payment-form"

export const metadata: Metadata = {
  title: "Novo Pagamento | NeuroGestão",
  description: "Registre um novo pagamento",
}

export default async function NewPaymentPage() {
  const supabase = createClient()

  // Buscar pacientes
  const { data: patients, error: patientsError } = await supabase.from("patients").select("id, name").order("name")

  if (patientsError) {
    console.error("Erro ao buscar pacientes:", patientsError)
  }

  // Buscar métodos de pagamento
  const { data: paymentMethods, error: methodsError } = await supabase
    .from("payment_methods")
    .select("id, name")
    .eq("active", true)
    .order("name")

  if (methodsError) {
    console.error("Erro ao buscar métodos de pagamento:", methodsError)
  }

  // Buscar planos de pagamento
  const { data: paymentPlans, error: plansError } = await supabase
    .from("payment_plans")
    .select("id, name, amount, description")
    .eq("active", true)
    .order("name")

  if (plansError) {
    console.error("Erro ao buscar planos de pagamento:", plansError)
  }

  // Buscar agendamentos pendentes
  const { data: pendingAppointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, date, patient_id, patients(name)")
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(50)

  if (appointmentsError) {
    console.error("Erro ao buscar agendamentos:", appointmentsError)
  }

  // Função para criar pagamento
  async function createPayment(formData: FormData) {
    "use server"

    const supabase = createClient()

    const patientId = formData.get("patientId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const status = formData.get("status") as string
    const paymentMethodId = formData.get("paymentMethodId") as string
    const dueDate = formData.get("dueDate") as string
    const notes = formData.get("notes") as string
    const referenceType = formData.get("referenceType") as string
    const referenceId = formData.get("referenceId") as string

    // Criar o pagamento
    const { data, error } = await supabase
      .from("payments")
      .insert({
        patient_id: patientId,
        amount,
        status,
        payment_method_id: paymentMethodId || null,
        due_date: dueDate || null,
        payment_date: status === "completed" ? new Date().toISOString() : null,
        notes,
        reference_type: referenceType || null,
        reference_id: referenceId || null,
      })
      .select()

    if (error) {
      console.error("Erro ao criar pagamento:", error)
      throw new Error("Erro ao criar pagamento")
    }

    // Se for um pagamento para um agendamento, atualizar o status do agendamento
    if (referenceType === "appointment" && referenceId) {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "paid" })
        .eq("id", referenceId)

      if (updateError) {
        console.error("Erro ao atualizar agendamento:", updateError)
      }
    }

    return data[0]
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Pagamento</h1>
        <p className="text-muted-foreground">Registre um novo pagamento no sistema</p>
      </div>

      <PaymentForm
        patients={patients || []}
        paymentMethods={paymentMethods || []}
        paymentPlans={paymentPlans || []}
        pendingAppointments={pendingAppointments || []}
        createPayment={createPayment}
      />
    </div>
  )
}
