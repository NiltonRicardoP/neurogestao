"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Edit, Eye, FileText, Search, Trash2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { StatusBadge } from "@/components/ui/status-badge"
import type { Database } from "@/types/supabase"
import { createClient } from "@/lib/supabase/client"

type AssessmentWithPatient = Database["public"]["Tables"]["assessments"]["Row"] & {
  patients: {
    name: string
  }
}

interface AssessmentsListProps {
  assessments: AssessmentWithPatient[]
  pageCount: number
  page: number
  search: string
  status: string
}

export function AssessmentsList({ assessments, pageCount, page, search, status }: AssessmentsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(search)
  const [statusFilter, setStatusFilter] = useState(status)
  const [assessmentToDelete, setAssessmentToDelete] = useState<AssessmentWithPatient | null>(null)
  const supabase = createClient()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    if (statusFilter) {
      params.set("status", statusFilter)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    if (value) {
      params.set("status", value)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return

    try {
      await supabase.from("assessments").delete().eq("id", assessmentToDelete.id)
      router.refresh()
    } catch (error) {
      console.error("Error deleting assessment:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Avaliações</CardTitle>
        <CardDescription>Gerencie suas avaliações neuropsicológicas.</CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Button>
          </form>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="agendada">Agendada</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluída">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.length > 0 ? (
              assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.title}</TableCell>
                  <TableCell>{assessment.patients.name}</TableCell>
                  <TableCell>{formatDate(assessment.date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={assessment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/assessments/${assessment.id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Link href={`/reports/new?assessmentId=${assessment.id}`}>
                        <Button size="icon" variant="ghost">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Gerar Relatório</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={() => setAssessmentToDelete(assessment)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a avaliação <strong>{assessmentToDelete?.title}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAssessment}
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
                  Nenhuma avaliação encontrada.
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
                href={`${pathname}?page=${page > 1 ? page - 1 : 1}${
                  search ? `&search=${search}` : ""
                }${status ? `&status=${status}` : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`${pathname}?page=${i + 1}${
                    search ? `&search=${search}` : ""
                  }${status ? `&status=${status}` : ""}`}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`${pathname}?page=${page < pageCount ? page + 1 : pageCount}${search ? `&search=${search}` : ""}${
                  status ? `&status=${status}` : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
