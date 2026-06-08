import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: ramos } = await supabase
    .from('ramos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis ramos</h1>
            <p className="text-[#6b7280] mt-1 text-sm">
              {ramos?.length ?? 0} ramo{ramos?.length !== 1 ? 's' : ''} registrado{ramos?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/ramos/nuevo"
            className="flex items-center gap-2 bg-[#4ade80] text-[#0d0d0d] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#22c55e] transition-colors text-sm"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo ramo
          </Link>
        </div>

        {!ramos || ramos.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#1f2937] rounded-2xl">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Aún no tienes ramos</h2>
            <p className="text-[#6b7280] text-sm mb-6">
              Crea tu primer ramo para empezar a grabar y sintetizar tus clases
            </p>
            <Link
              href="/ramos/nuevo"
              className="inline-flex items-center gap-2 bg-[#4ade80] text-[#0d0d0d] font-semibold px-6 py-3 rounded-xl hover:bg-[#22c55e] transition-colors text-sm"
            >
              Crear mi primer ramo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ramos.map((ramo) => (
              <Link
                key={ramo.id}
                href={`/ramos/${ramo.id}`}
                className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 hover:border-[#4ade80]/40 hover:bg-[#111827]/80 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#4ade80]/10 rounded-xl flex items-center justify-center text-[#4ade80] text-lg">
                    📖
                  </div>
                  <span className="text-[#6b7280] text-xs">
                    {new Date(ramo.created_at).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-base group-hover:text-[#4ade80] transition-colors">
                  {ramo.nombre}
                </h3>
                {ramo.descripcion && (
                  <p className="text-[#6b7280] text-sm mt-1 line-clamp-2">
                    {ramo.descripcion}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
