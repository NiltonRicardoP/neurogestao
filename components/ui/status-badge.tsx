import { cn } from "@/lib/utils"

type StatusType =
  // Agendamentos
  | "agendado"
  | "confirmado"
  | "cancelado"
  | "concluído"
  // Avaliações
  | "agendada"
  | "em_andamento"
  | "concluída"
  | "cancelada"
  // Genéricos
  | "ativo"
  | "inativo"
  | "pendente"
  | "bloqueado"
  | "expirado"
  // English equivalents
  | "pending"
  | "completed"
  | "in_progress"
  | "cancelled"
  | "scheduled"
  | "confirmed"
  | "active"
  | "inactive"
  | "blocked"
  | "expired"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Mapeamento de status para cores
  const statusStyles: Record<StatusType, string> = {
    // Agendamentos
    agendado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    confirmado:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    concluído: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",

    // Avaliações (algumas são iguais aos agendamentos, mas mantidas para clareza)
    agendada: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    em_andamento:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    concluída:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",

    // Genéricos
    ativo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    inativo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    pendente:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    bloqueado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    expirado:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",

    // English equivalents
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    in_progress:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    confirmed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    expired:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  }

  // Formatação do texto do status
  const formatStatus = (status: string) => {
    // First, handle special case for English status that should remain as is
    if (
      [
        "Pending",
        "Completed",
        "In Progress",
        "Cancelled",
        "Scheduled",
        "Confirmed",
        "Active",
        "Inactive",
        "Blocked",
        "Expired",
      ].includes(status)
    ) {
      return status
    }

    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        statusStyles[status.toLowerCase() as StatusType] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  )
}
