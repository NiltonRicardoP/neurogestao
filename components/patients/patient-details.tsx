import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type Patient = Database["public"]["Tables"]["patients"]["Row"]

interface PatientDetailsProps {
  patient: Patient
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Detalhes do cadastro do paciente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
            <p className="text-base">{patient.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">E-mail</h3>
            <p className="text-base">{patient.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
            <p className="text-base">{patient.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Data de Nascimento</h3>
            <p className="text-base">{formatDate(patient.birth_date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Gênero</h3>
            <p className="text-base capitalize">{patient.gender}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Cadastrado em</h3>
            <p className="text-base">{formatDate(patient.created_at)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
          <p className="text-base">{patient.address}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Histórico Médico</h3>
          <p className="text-base whitespace-pre-line">
            {patient.medical_history || "Nenhum histórico médico registrado."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
