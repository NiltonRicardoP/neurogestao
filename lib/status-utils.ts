// Map between Portuguese and English status values
export const statusMap: Record<string, string> = {
  // Portuguese to English
  agendado: "scheduled",
  confirmado: "confirmed",
  cancelado: "cancelled",
  concluído: "completed",
  agendada: "scheduled",
  em_andamento: "in_progress",
  concluída: "completed",
  cancelada: "cancelled",
  ativo: "active",
  inativo: "inactive",
  pendente: "pending",
  bloqueado: "blocked",
  expirado: "expired",

  // English to Portuguese
  scheduled: "agendado",
  confirmed: "confirmado",
  cancelled: "cancelado",
  completed: "concluído",
  in_progress: "em_andamento",
  active: "ativo",
  inactive: "inativo",
  pending: "pendente",
  blocked: "bloqueado",
  expired: "expirado",
}

// Convert Portuguese status to English
export function toEnglishStatus(status: string): string {
  return statusMap[status.toLowerCase()] || status
}

// Convert English status to Portuguese
export function toPortugueseStatus(status: string): string {
  return statusMap[status.toLowerCase()] || status
}
