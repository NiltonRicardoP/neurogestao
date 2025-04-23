"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSupabase } from "@/hooks/use-supabase"
import type { Database } from "@/types/supabase"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { supabase } = useSupabase()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) return

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", sessionData.session.user.email)
        .single()

      if (!userData) return

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    }

    fetchNotifications()

    // Configurar um intervalo para buscar notificações em vez de usar realtime
    const intervalId = setInterval(fetchNotifications, 30000) // A cada 30 segundos

    return () => {
      clearInterval(intervalId)
    }
  }, [supabase])

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id)

    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
