'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import Grabadora from '@/components/Grabadora'

interface Props {
  params: { ramoId: string }
}

export default function NuevaClasePage({ params }: Props) {
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [claseId, setClaseId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCrearClase(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('clases')
      .insert({
        ramo_id: params.ramoId,
        numero: parseInt(numero),
        nombre,
      })
      .select()
      .single()

    if (error) {
      setError('No se pudo crear la clase. Intenta de nuevo.')
      setLoading(false)
    } else {
      setClaseId(data.id)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <NavBar />

      <main className="max-w-xl mx-auto px-4 py-10">
        <Link
          href={`/ramos/${params.ramoId}`}
          className="text-[#6b7280] hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors"
        >
          ← Volver al ramo
        </Link>

        {!claseId ? (
          <>
            <h1 className="text-2xl font-bold mb-1">Nueva clase</h1>
            <p className="text-[#6b7280] text-sm mb-8">
              Ingresa los datos de la clase y luego activa la grabación
            </p>

            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
              <form onSubmit={handleCrearClase} className="space-y-5">
                <div>
                  <label className="text-sm text-[#9ca3af] block mb-1.5">
                    Número de clase <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                    min="1"
                    placeholder="Ej: 3"
                    className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#9ca3af] block mb-1.5">
                    Nombre de la clase <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej: Termodinámica — Segunda ley"
                    className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/ramos/${params.ramoId}`}
                    className="flex-1 text-center border border-[#1f2937] text-[#6b7280] font-medium py-3 rounded-xl hover:border-[#374151] hover:text-white transition-colors text-sm"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !numero || !nombre.trim()}
                    className="flex-1 bg-[#4ade80] text-[#0d0d0d] font-semibold py-3 rounded-xl hover:bg-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? 'Creando...' : 'Crear y grabar'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-2.5 py-0.5 rounded-full font-medium">
                  Clase {numero}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{nombre}</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Graba el audio de la clase. Al detener, la IA generará una síntesis automática.
              </p>
            </div>

            <Grabadora claseId={claseId} ramoId={params.ramoId} />
          </>
        )}
      </main>
    </div>
  )
}
