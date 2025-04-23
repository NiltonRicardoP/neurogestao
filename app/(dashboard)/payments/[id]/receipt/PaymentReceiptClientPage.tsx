"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftIcon, DownloadIcon, PrinterIcon } from "lucide-react"
import { ReceiptTemplate } from "@/components/payments/receipt-template"

export default function PaymentReceiptClientPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  // Buscar pagamento
  const [payment, items, organizationName, systemName] = usePaymentData(supabase, params.id)

  if (!payment) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/payments/${params.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recibo de Pagamento</h1>
            <p className="text-muted-foreground">
              Recibo para {payment.patient.name} -{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payment.amount)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none">
        <CardContent className="p-8 print:p-0">
          <ReceiptTemplate payment={payment} items={items || []} organizationName={organizationName} />
        </CardContent>
      </Card>
    </div>
  )
}

function usePaymentData(supabase: any, paymentId: string) {
  const [payment, setPayment] = React.useState<any>(null)
  const [items, setItems] = React.useState<any[]>([])
  const [organizationName, setOrganizationName] = React.useState<string>("NeuroGestão")
  const [systemName, setSystemName] = React.useState<string>("NeuroGestão")

  React.useEffect(() => {
    async function fetchData() {
      // Buscar pagamento
      const { data: paymentData, error } = await supabase
        .from("payments")
        .select(`
          *,
          patient:patients(id, name, email, phone, document),
          payment_method:payment_methods(id, name)
        `)
        .eq("id", paymentId)
        .single()

      if (error || !paymentData) {
        console.error("Erro ao buscar pagamento:", error)
        return
      }

      setPayment(paymentData)

      // Buscar itens do pagamento
      const { data: itemsData, error: itemsError } = await supabase
        .from("payment_items")
        .select("*")
        .eq("payment_id", paymentId)
        .order("created_at")

      if (itemsError) {
        console.error("Erro ao buscar itens do pagamento:", itemsError)
      }

      setItems(itemsData || [])

      // Buscar configurações da organização
      const { data: orgSettings, error: settingsError } = await supabase
        .from("settings")
        .select("value")
        .in("key", ["general.organizationName", "general.systemName"])

      if (settingsError) {
        console.error("Erro ao buscar configurações:", settingsError)
      }

      const orgName = orgSettings?.find((s) => s.key === "general.organizationName")?.value || "NeuroGestão"
      const sysName = orgSettings?.find((s) => s.key === "general.systemName")?.value || "NeuroGestão"

      setOrganizationName(orgName)
      setSystemName(sysName)
    }

    fetchData()
  }, [supabase, paymentId])

  return [payment, items, organizationName, systemName]
}
import React from "react"
