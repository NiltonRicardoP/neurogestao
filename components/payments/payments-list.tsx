"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontalIcon, SearchIcon, EyeIcon, EditIcon, ReceiptIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Função auxiliar para formatar data
function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
}

// Função para formatar valor monetário
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função para obter a cor do status
function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "refunded":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Função para obter o texto do status
function getStatusText(status: string) {
  switch (status) {
    case "completed":
      return "Concluído"
    case "pending":
      return "Pendente"
    case "cancelled":
      return "Cancelado"
    case "refunded":
      return "Reembolsado"
    default:
      return status
  }
}

type Payment = {
  id: string
  patient_id: string
  amount: number
  status: string
  payment_method_id: string | null
  payment_date: string | null
  due_date: string | null
  notes: string | null
  reference_type: string | null
  reference_id: string | null
  created_at: string
  updated_at: string
  patient: {
    id: string
    name: string
  }
  payment_method: {
    id: string
    name: string
  } | null
}

interface PaymentsListProps {
  payments: Payment[]
}

export function PaymentsList({ payments }: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrar pagamentos
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pagamentos</CardTitle>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente ou observações..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum pagamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.patient.name}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
                    </TableCell>
                    <TableCell>{payment.payment_method?.name || "-"}</TableCell>
                    <TableCell>
                      {payment.payment_date
                        ? formatDate(payment.payment_date)
                        : payment.due_date
                          ? `Venc: ${formatDate(payment.due_date)}`
                          : formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/payments/${payment.id}`}>
                              <EyeIcon className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          {payment.status === "pending" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/payments/${payment.id}/edit`}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {payment.status === "completed" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/payments/${payment.id}/receipt`}>
                                <ReceiptIcon className="mr-2 h-4 w-4" />
                                Recibo
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
