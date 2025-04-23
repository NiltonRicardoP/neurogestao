"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type React from "react"

type Theme = "light" | "dark" | "system" | "oceanic" | "mint" | "lavender" | "rose"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "neurogestao-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Carregar tema do localStorage no lado do cliente
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
      setMounted(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    // Aplicar tema ao elemento HTML
    const root = document.documentElement

    // Remover temas anteriores
    root.classList.remove("dark")
    const dataTheme = root.getAttribute("data-theme")
    if (dataTheme) {
      root.removeAttribute("data-theme")
    }

    // Aplicar novo tema
    if (theme !== "system") {
      root.setAttribute("data-theme", theme)
    }

    // Aplicar classe dark se necessário
    if (
      theme === "dark" ||
      (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark")
    }

    // Salvar tema no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, mounted, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  // Evitar flash de tema incorreto durante SSR
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
