import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    console.log("Middleware: Verificando autenticação para:", request.nextUrl.pathname)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    const { data } = await supabase.auth.getSession()
    console.log("Middleware: Sessão:", data.session ? "Autenticado" : "Não autenticado")

    // If the user is not signed in and the route is protected, redirect to login
    if (
      !data.session &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/forgot-password") &&
      !request.nextUrl.pathname.startsWith("/reset-password") &&
      request.nextUrl.pathname !== "/"
    ) {
      console.log("Middleware: Redirecionando para /login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // If the user is signed in and trying to access login, redirect to dashboard
    if (
      data.session &&
      (request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/forgot-password") ||
        request.nextUrl.pathname.startsWith("/reset-password") ||
        request.nextUrl.pathname === "/")
    ) {
      console.log("Middleware: Redirecionando para /dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } catch (error) {
    console.error("Erro no middleware:", error)
    // Em caso de erro, permitimos que a requisição continue
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
