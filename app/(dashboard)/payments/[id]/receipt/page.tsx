import type { Metadata } from "next"
import PaymentReceiptClientPage from "./PaymentReceiptClientPage"

export const metadata: Metadata = {
  title: "Recibo de Pagamento | NeuroGestão",
  description: "Gere um recibo de pagamento",
}

export default async function PaymentReceiptPage({
  params,
}: {
  params: { id: string }
}) {
  return <PaymentReceiptClientPage params={params} />
}
