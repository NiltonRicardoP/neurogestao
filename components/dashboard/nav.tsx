"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  BarChart3Icon,
  CalendarIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  LayoutTemplateIcon,
  Settings2Icon,
  UsersIcon,
  DollarSignIcon,
  BellIcon,
} from "lucide-react"

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean
}

export function DashboardNav({ className, isCollapsed, ...props }: NavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
    },
    {
      title: "Pacientes",
      href: "/patients",
      icon: UsersIcon,
    },
    {
      title: "Agendamentos",
      href: "/appointments",
      icon: CalendarIcon,
    },
    {
      title: "Avaliações",
      href: "/assessments",
      icon: ClipboardListIcon,
    },
    {
      title: "Modelos de Avaliação",
      href: "/assessment-models",
      icon: LayoutTemplateIcon,
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: FileTextIcon,
    },
    {
      title: "Pagamentos",
      href: "/payments",
      icon: DollarSignIcon,
    },
    {
      title: "Notificações",
      href: "/notifications",
      icon: BellIcon,
    },
    {
      title: "Estatísticas",
      href: "/statistics",
      icon: BarChart3Icon,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: Settings2Icon,
    },
  ]

  return (
    <nav className={cn("flex flex-col gap-2", className)} {...props}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center",
            )}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
