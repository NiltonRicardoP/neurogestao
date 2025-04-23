"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAssessmentModel(modelId: string) {
  try {
    const supabase = createClient()

    // Excluir o modelo (as seções e campos serão excluídos automaticamente devido à restrição ON DELETE CASCADE)
    const { error } = await supabase.from("assessment_models").delete().eq("id", modelId)

    if (error) {
      console.error("Erro ao excluir modelo:", error)
      return { success: false, error: error.message }
    }

    // Revalidar o cache da página de modelos
    revalidatePath("/assessment-models")

    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir modelo:", error)
    return { success: false, error: "Erro ao excluir modelo" }
  }
}
