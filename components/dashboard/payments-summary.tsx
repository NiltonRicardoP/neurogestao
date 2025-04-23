import { Card, CardContent } from "@/components/ui/card"
import { BanknoteIcon, CalendarIcon, ClockIcon, DollarSignIcon } from "lucide-react"

interface PaymentStats {
  total_received: number
  total_pending: number
  total_today: number
  total_this_week: number
  total_this_month: number
}

interface PaymentsSummaryProps {
  stats: PaymentStats
}

export function PaymentsSummary({ stats }: PaymentsSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <DollarSignIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            <h3 className="text-sm font-medium">Total Recebido</h3>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold sm:text-xl md:text-2xl tabular-nums truncate">
              {formatCurrency(stats.total_received)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">Total de pagamentos concluídos</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            <h3 className="text-sm font-medium">Pendente</h3>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold sm:text-xl md:text-2xl tabular-nums truncate">
              {formatCurrency(stats.total_pending)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">Total de pagamentos pendentes</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <BanknoteIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            <h3 className="text-sm font-medium">Hoje</h3>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold sm:text-xl md:text-2xl tabular-nums truncate">
              {formatCurrency(stats.total_today)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">Pagamentos recebidos hoje</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            <h3 className="text-sm font-medium">Esta Semana</h3>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold sm:text-xl md:text-2xl tabular-nums truncate">
              {formatCurrency(stats.total_this_week)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">Pagamentos recebidos esta semana</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            <h3 className="text-sm font-medium">Este Mês</h3>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold sm:text-xl md:text-2xl tabular-nums truncate">
              {formatCurrency(stats.total_this_month)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">Pagamentos recebidos este mês</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
