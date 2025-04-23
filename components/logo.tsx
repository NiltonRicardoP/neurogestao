import { Brain } from "lucide-react"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return <Brain className={className} />
}
