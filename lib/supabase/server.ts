import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("NEXT_PUBLIC_SUPABASE_URL não está definido")
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    console.error("SUPABASE_ANON_KEY não está definido")
  }

  console.log("Criando cliente Supabase no servidor")
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "Definido" : "Não definido")

  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  return client
}

// Exportar a função com o nome que está sendo usado
export { createClient as createServerClient }
