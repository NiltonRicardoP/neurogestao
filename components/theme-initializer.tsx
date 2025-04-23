"use client"

import { useTheme } from "@/components/theme-provider"
import { useEffect } from "react"

export function ThemeInitializer() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Forçar a aplicação do tema atual
    if (theme) {
      // Pequeno atraso para garantir que o tema seja aplicado após a renderização
      const timer = setTimeout(() => {
        setTheme(theme)
        console.log("ThemeInitializer: Tema aplicado:", theme)
        console.log("Atributos HTML:", document.documentElement.getAttribute("data-theme"))
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [theme, setTheme])

  return null
}
