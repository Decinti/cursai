'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-[#1f2937] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1.5 group">
          <span className="text-[#4ade80] text-xl font-bold tracking-tight">Curs</span>
          <span className="bg-[#4ade80] text-[#0d0d0d] text-xl font-bold px-1.5 rounded tracking-tight">ai</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[#6b7280] hover:text-white transition-colors"
          >
            Mis ramos
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-[#6b7280] hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}
