import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

interface Props {
  params: { ramoId: string; claseId: string }
}

export default async function ClasePage({ params }: Props) {
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

  const { data: clase } = await supabase
    .from('clases')
    .select('*')
    .eq('id', params.claseId)
    .eq('ramo_id', params.ramoId)
    .single()

  if (!clase) notFound()

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href={`/ramos/${params.ramoId}`}
          className="text-[#6b7280] hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors"
        >
          ← {ramo.nombre}
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-2.5 py-0.5 rounded-full font-medium">
              Clase {clase.numero}
            </span>
            {clase.sintesis && (
              <span className="text-xs bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2.5 py-0.5 rounded-full font-medium">
                ✓ Síntesis generada
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{clase.nombre}</h1>
          <p className="text-[#6b7280] text-xs mt-2">
            {new Date(clase.created_at).toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {clase.sintesis ? (
          <SintesisView sintesis={clase.sintesis} transcripcion={clase.transcripcion} />
        ) : (
          <div className="text-center py-16 border border-dashed border-[#1f2937] rounded-2xl">
            <div className="text-4xl mb-3">🎙️</div>
            <h2 className="text-lg font-semibold mb-2">Sin síntesis aún</h2>
            <p className="text-[#6b7280] text-sm">
              Esta clase no tiene una síntesis generada todavía.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function SintesisView({ sintesis, transcripcion }: { sintesis: string; transcripcion: string | null }) {
  const lineas = sintesis.split('\n').filter((l) => l.trim())

  const secciones: { titulo: string; contenido: string[] }[] = []
  let seccionActual: { titulo: string; contenido: string[] } | null = null

  for (const linea of lineas) {
    const esEncabezado =
      /^#{1,3}\s/.test(linea) ||
      /^\d+[\)\.]\s/.test(linea) ||
      linea.toLowerCase().includes('resumen') ||
      linea.toLowerCase().includes('conceptos') ||
      linea.toLowerCase().includes('puntos')

    if (esEncabezado) {
      if (seccionActual) secciones.push(seccionActual)
      seccionActual = {
        titulo: linea.replace(/^#+\s*/, '').replace(/^\d+[\)\.]\s*/, ''),
        contenido: [],
      }
    } else if (seccionActual) {
      if (linea.trim()) seccionActual.contenido.push(linea.replace(/^[-*•]\s*/, ''))
    }
  }
  if (seccionActual) secciones.push(seccionActual)

  const iconos = ['📋', '🔑', '⚡']

  return (
    <div className="space-y-6">
      {secciones.length > 0 ? (
        secciones.map((seccion, i) => (
          <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{iconos[i] ?? '📄'}</span>
              <h2 className="font-semibold text-base text-white">{seccion.titulo}</h2>
            </div>
            {seccion.contenido.length > 0 ? (
              <ul className="space-y-2">
                {seccion.contenido.map((item, j) => (
                  <li key={j} className="text-sm text-[#d1d5db] flex gap-2">
                    <span className="text-[#4ade80] shrink-0 mt-0.5">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
          <p className="text-sm text-[#d1d5db] whitespace-pre-wrap leading-relaxed">{sintesis}</p>
        </div>
      )}

      {transcripcion && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-[#6b7280] hover:text-white transition-colors list-none flex items-center gap-2 mb-3">
            <span className="group-open:rotate-90 transition-transform text-[#4ade80]">›</span>
            Ver transcripción completa
          </summary>
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
            <p className="text-sm text-[#6b7280] whitespace-pre-wrap leading-relaxed font-mono">
              {transcripcion}
            </p>
          </div>
        </details>
      )}
    </div>
  )
}
