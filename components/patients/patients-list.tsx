"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Edit, Eye, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Database } from "@/types/supabase"
import { createClient } from "@/lib/supabase/client"

type Patient = Database["public"]["Tables"]["patients"]["Row"]

interface PatientsListProps {
  patients: Patient[]
  pageCount: number
  page: number
  search: string
}

export function PatientsList({ patients, pageCount, page, search }: PatientsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(search)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const supabase = createClient()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDeletePatient = async () => {
    if (!patientToDelete) return

    try {
      await supabase.from("patients").delete().eq("id", patientToDelete.id)
      router.refresh()
    } catch (error) {
      console.error("Error deleting patient:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pacientes</CardTitle>
        <CardDescription>Gerencie seus pacientes, visualize detalhes e histórico de atendimentos.</CardDescription>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{formatDate(patient.birth_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/patients/${patient.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/patients/${patient.id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={() => setPatientToDelete(patient)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o paciente <strong>{patientToDelete?.name}</strong>? Esta
                              ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeletePatient}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`${pathname}?page=${page > 1 ? page - 1 : 1}${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`${pathname}?page=${i + 1}${search ? `&search=${search}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`${pathname}?page=${page < pageCount ? page + 1 : pageCount}${search ? `&search=${search}` : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
