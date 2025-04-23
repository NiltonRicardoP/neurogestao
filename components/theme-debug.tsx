"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"

export function ThemeDebug() {
  const { theme, setTheme } = useTheme()
  const [htmlAttributes, setHtmlAttributes] = useState<Record<string, string>>({})
  const themes = ["light", "dark", "system", "oceanic", "mint", "lavender", "rose"]

  useEffect(() => {
    // Capturar os atributos do elemento HTML
    const htmlElement = document.documentElement
    const attributes: Record<string, string> = {}

    for (let i = 0; i < htmlElement.attributes.length; i++) {
      const attr = htmlElement.attributes[i]
      attributes[attr.name] = attr.value
    }

    setHtmlAttributes(attributes)
  }, [theme])

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Depuração de Tema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">
              Tema selecionado: <span className="text-primary">{theme}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Atributo data-theme: {document.documentElement.getAttribute("data-theme")}
            </p>
          </div>

          <div>
            <p className="font-medium">Atributos do HTML:</p>
            <pre className="mt-1 p-2 bg-muted rounded-md text-xs">{JSON.stringify(htmlAttributes, null, 2)}</pre>
          </div>

          <div>
            <p className="font-medium mb-2">Temas disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as any)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    theme === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Amostra de cores:</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-primary"></div>
                <span className="text-xs mt-1">Primary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-secondary"></div>
                <span className="text-xs mt-1">Secondary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-accent"></div>
                <span className="text-xs mt-1">Accent</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-md bg-muted"></div>
                <span className="text-xs mt-1">Muted</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
