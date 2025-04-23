"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export function useSupabase() {
  // Usamos useState para garantir que o mesmo cliente seja usado durante todo o ciclo de vida do componente
  const [supabase] = useState<SupabaseClient<Database>>(() => {
    console.log("Inicializando cliente Supabase no hook useSupabase")
    return createClient()
  })

  // Verificar se o cliente está funcionando corretamente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log(
          "Sessão atual:",
          data.session ? "Autenticado" : "Não autenticado",
          error ? `Erro: ${error.message}` : "",
        )
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err)
      }
    }

    checkAuth()
  }, [supabase])

  return { supabase }
}
