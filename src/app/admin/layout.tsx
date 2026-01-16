import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-100 dark:bg-neutral-900">
      <aside className="w-full bg-white dark:bg-neutral-800 border-r dark:border-neutral-700 md:w-64 md:min-h-screen">
        <div className="p-6 border-b dark:border-neutral-700">
          <h2 className="text-xl font-bold font-display tracking-tight">Admin Panel</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lic. Federico Colella</p>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-left">
              📅 Agenda
            </Button>
          </Link>
          <Link href="/admin/cms">
            <Button variant="ghost" className="w-full justify-start text-left">
              ⭐ Casos de Éxito
            </Button>
          </Link>
          <Link href="/admin/settings">
             <Button variant="ghost" className="w-full justify-start text-left">
              ⚙️ Configuración
            </Button>
          </Link>
          <div className="mt-auto pt-4 border-t dark:border-neutral-700">
             <Link href="/">
                <Button variant="outline" className="w-full">
                    ← Volver al Sitio
                </Button>
             </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
