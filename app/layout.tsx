import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NeuroGestão - Sistema de Gestão para Neuropsicólogos",
  description:
    "Sistema completo para profissionais de neuropsicologia gerenciarem pacientes, avaliações, agendamentos e relatórios.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="neurogestao-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
