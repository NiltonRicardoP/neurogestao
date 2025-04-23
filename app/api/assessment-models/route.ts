import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    console.log("API: Buscando modelos de avaliação")

    const { data, error } = await supabase.from("assessment_models").select("*").order("name", { ascending: true })

    if (error) {
      console.error("API: Erro ao buscar modelos de avaliação:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("API: Modelos encontrados:", data)

    return NextResponse.json({ models: data })
  } catch (error) {
    console.error("API: Erro inesperado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
