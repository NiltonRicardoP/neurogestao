"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu } from "lucide-react"
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

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="font-bold">NeuroGestão</span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col gap-2 pl-1 pr-7">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
