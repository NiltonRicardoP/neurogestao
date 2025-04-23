"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[400px] font-mono"
      />
    )
  }

  return null
}
