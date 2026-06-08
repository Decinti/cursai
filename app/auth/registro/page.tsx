'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-10">
          <span className="text-[#4ade80] text-3xl font-bold tracking-tight">Curs</span>
          <span className="bg-[#4ade80] text-[#0d0d0d] text-3xl font-bold px-2 rounded tracking-tight">ai</span>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">Crea tu cuenta</h1>
          <p className="text-[#6b7280] text-sm mb-8">Empieza a sintetizar tus clases con IA</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-sm text-[#9ca3af] block mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] block mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#9ca3af] block mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repite tu contraseña"
                className="w-full bg-[#0d0d0d] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4ade80] transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4ade80] text-[#0d0d0d] font-semibold py-3 rounded-xl hover:bg-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[#4ade80] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
