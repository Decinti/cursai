'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'

export default function NuevoRamoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data, error } = await supabase
      .from('ramos')
      .insert({ nombre, descripcion: descripcion || null, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError('No se pudo crear el ramo. Intenta de nuevo.')
      setLoading(false)
    } else {
      router.push(`/ramos/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <NavBar />

      <main className="max-w-xl mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="text-[#6b7280] hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors"
        >
          ← Volver a mis ramos
        </Link>

        <h1 className="text-2xl font-bold mb-1">Nuevo ramo</h1>
        <p className="text-[#6b7280] text-sm mb-8">
          Crea un ramo para organizar tus clases grabadas
        </p>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-[#9ca3af] block mb-1.5">
                Nombre del ramo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej: Cálculo I, Historia del Arte..."
                className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] block mb-1.5">
                Descripción <span className="text-[#4b5563]">(opcional)</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Ej: Semestre 1, 2026 — Profesor García"
                className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 text-center border border-[#1f2937] text-[#6b7280] font-medium py-3 rounded-xl hover:border-[#374151] hover:text-white transition-colors text-sm"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || !nombre.trim()}
                className="flex-1 bg-[#4ade80] text-[#0d0d0d] font-semibold py-3 rounded-xl hover:bg-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Creando...' : 'Crear ramo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
