import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ReceiptTemplateProps {
  payment: any
  items: any[]
  organizationName: string
}

export function ReceiptTemplate({ payment, items, organizationName }: ReceiptTemplateProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  // Gerar número do recibo baseado no ID do pagamento e data
  const receiptNumber = `REC-${payment.id.substring(0, 8).toUpperCase()}-${format(
    new Date(payment.created_at),
    "yyyyMMdd",
  )}`

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{organizationName}</h1>
        <p className="text-muted-foreground">CNPJ: XX.XXX.XXX/0001-XX</p>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold">RECIBO DE PAGAMENTO</h2>
        <p className="text-muted-foreground">Nº {receiptNumber}</p>
      </div>

      <div className="mb-8 rounded-lg border p-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recebemos de:</p>
            <p className="font-medium">{payment.patient.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ:</p>
            <p>{payment.patient.document || "Não informado"}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground">A importância de:</p>
          <p className="font-medium">{formatCurrency(payment.amount)}</p>
          <p className="mt-1 text-sm">{valorPorExtenso(payment.amount)}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground">Referente a:</p>
          <p>
            {items && items.length > 0
              ? items.map((item) => item.description).join(", ")
              : payment.notes || "Serviços prestados"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Forma de Pagamento:</p>
            <p>{payment.payment_method?.name || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data do Pagamento:</p>
            <p>{formatDate(payment.payment_date || payment.created_at)}</p>
          </div>
        </div>
      </div>

      {items && items.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-2 font-medium">Detalhamento dos Serviços</h3>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Descrição</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Qtd</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Valor Unit.</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Desconto</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm">{item.description}</td>
                    <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.discount || 0)}</td>
                    <td className="px-4 py-2 text-right text-sm font-medium">
                      {formatCurrency(item.amount * item.quantity - (item.discount || 0))}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/50">
                  <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium">
                    Total
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(payment.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <p>
          Para maior clareza firmamos o presente recibo para que produza os seus efeitos, dando plena, rasa e
          irrevogável quitação, pelo valor recebido.
        </p>
      </div>

      <div className="mb-8 text-center">
        <p>{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      <div className="mt-16 text-center">
        <div className="mx-auto w-64 border-t border-gray-400 pt-2">
          <p className="font-medium">{organizationName}</p>
          <p className="text-sm text-muted-foreground">CNPJ: XX.XXX.XXX/0001-XX</p>
        </div>
      </div>
    </div>
  )
}

// Função para converter valor numérico em texto por extenso
function valorPorExtenso(valor: number): string {
  if (valor === 0) return "Zero reais"

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"]
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
  const dezenasEspeciais = [
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ]
  const centenas = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ]

  const valorInteiro = Math.floor(valor)
  const valorCentavos = Math.round((valor - valorInteiro) * 100)

  let resultado = ""

  // Função para converter um número de até 3 dígitos
  function converterGrupo(numero: number): string {
    let resultado = ""

    const centena = Math.floor(numero / 100)
    const dezena = Math.floor((numero % 100) / 10)
    const unidade = numero % 10

    if (centena > 0) {
      if (centena === 1 && dezena === 0 && unidade === 0) {
        resultado += "cem"
      } else {
        resultado += centenas[centena]
      }

      if (dezena > 0 || unidade > 0) {
        resultado += " e "
      }
    }

    if (dezena > 0) {
      if (dezena === 1) {
        resultado += dezenasEspeciais[unidade]
      } else {
        resultado += dezenas[dezena]

        if (unidade > 0) {
          resultado += " e " + unidades[unidade]
        }
      }
    } else if (unidade > 0) {
      resultado += unidades[unidade]
    }

    return resultado
  }

  // Converter parte inteira
  if (valorInteiro > 0) {
    if (valorInteiro === 1) {
      resultado += "um real"
    } else {
      const milhoes = Math.floor(valorInteiro / 1000000)
      const milhares = Math.floor((valorInteiro % 1000000) / 1000)
      const reais = valorInteiro % 1000

      if (milhoes > 0) {
        resultado += converterGrupo(milhoes)
        resultado += milhoes === 1 ? " milhão" : " milhões"

        if (milhares > 0 || reais > 0) {
          resultado += " "
        }
      }

      if (milhares > 0) {
        resultado += converterGrupo(milhares)
        resultado += " mil"

        if (reais > 0) {
          resultado += " "
        }
      }

      if (reais > 0) {
        resultado += converterGrupo(reais)
      }

      resultado += " reais"
    }
  }

  // Converter centavos
  if (valorCentavos > 0) {
    if (valorInteiro > 0) {
      resultado += " e "
    }

    if (valorCentavos === 1) {
      resultado += "um centavo"
    } else {
      resultado += converterGrupo(valorCentavos) + " centavos"
    }
  }

  return resultado.charAt(0).toUpperCase() + resultado.slice(1)
}
