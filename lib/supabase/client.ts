"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Singleton pattern to ensure only one instance is created
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) {
    console.log("Retornando cliente Supabase existente")
    return supabaseClient
  }

  console.log("Criando novo cliente Supabase com URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Variáveis de ambiente do Supabase não definidas:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "definida" : "não definida",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "definida" : "não definida",
    })
    throw new Error("Variáveis de ambiente do Supabase não definidas")
  }

  // Desativar funcionalidades em tempo real
  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      realtime: {
        enabled: false,
      },
    },
  )

  return supabaseClient
}
