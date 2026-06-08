import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

interface Props {
  params: { ramoId: string }
}

export default async function RamoPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: ramo } = await supabase
    .from('ramos')
    .select('*')
    .eq('id', params.ramoId)
    .eq('user_id', user.id)
    .single()

  if (!ramo) notFound()

  const { data: clases } = await supabase
    .from('clases')
    .select('*')
    .eq('ramo_id', ramo.id)
    .order('numero', { ascending: true })

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="text-[#6b7280] hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors"
        >
          ← Mis ramos
        </Link>

        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{ramo.nombre}</h1>
            {ramo.descripcion && (
              <p className="text-[#6b7280] mt-1 text-sm">{ramo.descripcion}</p>
            )}
            <p className="text-[#6b7280] text-xs mt-2">
              {clases?.length ?? 0} clase{clases?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href={`/ramos/${ramo.id}/nueva-clase`}
            className="flex items-center gap-2 bg-[#4ade80] text-[#0d0d0d] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#22c55e] transition-colors text-sm whitespace-nowrap"
          >
            <span className="text-lg leading-none">+</span>
            Nueva clase
          </Link>
        </div>

        {!clases || clases.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#1f2937] rounded-2xl">
            <div className="text-5xl mb-4">🎙️</div>
            <h2 className="text-xl font-semibold mb-2">Sin clases aún</h2>
            <p className="text-[#6b7280] text-sm mb-6">
              Graba tu primera clase y obtén una síntesis automática con IA
            </p>
            <Link
              href={`/ramos/${ramo.id}/nueva-clase`}
              className="inline-flex items-center gap-2 bg-[#4ade80] text-[#0d0d0d] font-semibold px-6 py-3 rounded-xl hover:bg-[#22c55e] transition-colors text-sm"
            >
              Grabar primera clase
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clases.map((clase) => (
              <Link
                key={clase.id}
                href={`/ramos/${ramo.id}/clases/${clase.id}`}
                className="flex items-center gap-5 bg-[#111827] border border-[#1f2937] rounded-2xl p-5 hover:border-[#4ade80]/40 transition-all group"
              >
                <div className="w-11 h-11 bg-[#0d0d0d] border border-[#1f2937] rounded-xl flex items-center justify-center text-[#4ade80] font-bold text-sm shrink-0">
                  {clase.numero}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-[#4ade80] transition-colors truncate">
                    {clase.nombre}
                  </h3>
                  <p className="text-[#6b7280] text-xs mt-0.5">
                    {clase.sintesis
                      ? 'Síntesis disponible'
                      : clase.transcripcion
                      ? 'Procesando...'
                      : 'Sin síntesis'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {clase.sintesis ? (
                    <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-2.5 py-1 rounded-full">
                      ✓ Lista
                    </span>
                  ) : (
                    <span className="text-xs bg-[#374151] text-[#6b7280] px-2.5 py-1 rounded-full">
                      Pendiente
                    </span>
                  )}
                  <span className="text-[#4b5563] text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
