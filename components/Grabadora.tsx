'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Estado = 'idle' | 'grabando' | 'procesando' | 'listo' | 'error'

interface Props {
  claseId: string
  ramoId: string
}

export default function Grabadora({ claseId, ramoId }: Props) {
  const router = useRouter()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [estado, setEstado] = useState<Estado>('idle')
  const [segundos, setSegundos] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const iniciarGrabacion = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 32000,
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(1000)
      setEstado('grabando')
      setSegundos(0)

      timerRef.current = setInterval(() => {
        setSegundos((prev) => prev + 1)
      }, 1000)
    } catch {
      setError('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
    }
  }, [])

  const detenerGrabacion = useCallback(async () => {
    if (!mediaRecorderRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)

    setEstado('procesando')

    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())

    await new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

          // 1. Transcribir
          const formData = new FormData()
          formData.append('audio', audioBlob, 'grabacion.webm')

          const transcRes = await fetch('/api/transcribir', {
            method: 'POST',
            body: formData,
          })

          if (!transcRes.ok) {
            const body = await transcRes.json().catch(() => ({}))
            throw new Error(body.error || `Error al transcribir (${transcRes.status})`)
          }
          const { transcripcion } = await transcRes.json()

          // 2. Sintetizar
          const sintRes = await fetch('/api/sintetizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcripcion }),
          })

          if (!sintRes.ok) {
            const body = await sintRes.json().catch(() => ({}))
            throw new Error(body.error || `Error al sintetizar (${sintRes.status})`)
          }
          const { sintesis } = await sintRes.json()

          // 3. Guardar en Supabase
          const supabase = createClient()
          const { error: dbError } = await supabase
            .from('clases')
            .update({ transcripcion, sintesis })
            .eq('id', claseId)

          if (dbError) throw new Error('Error al guardar la síntesis')

          setEstado('listo')
          setTimeout(() => {
            router.push(`/ramos/${ramoId}/clases/${claseId}`)
          }, 1500)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido'
          setError(msg)
          setEstado('error')
        }
        resolve()
      }
    })
  }, [claseId, ramoId, router])

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 flex flex-col items-center gap-8">
      {/* Estado visual */}
      <div className="text-center">
        {estado === 'idle' && (
          <p className="text-[#6b7280] text-sm">Presiona el botón para comenzar a grabar</p>
        )}
        {estado === 'grabando' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-[#4ade80] font-medium tracking-widest uppercase animate-pulse">
              Grabando
            </span>
            <span className="text-4xl font-bold font-mono text-white">{formatTime(segundos)}</span>
          </div>
        )}
        {estado === 'procesando' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-[#38bdf8] font-medium tracking-widest uppercase">
              Procesando con IA...
            </span>
            <p className="text-[#6b7280] text-xs max-w-xs text-center">
              Transcribiendo audio y generando síntesis. Esto puede tomar un momento.
            </p>
          </div>
        )}
        {estado === 'listo' && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#4ade80] text-3xl">✓</span>
            <span className="text-[#4ade80] font-semibold">¡Síntesis lista!</span>
            <p className="text-[#6b7280] text-xs">Redirigiendo...</p>
          </div>
        )}
        {estado === 'error' && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* Animación de onda */}
      {estado === 'grabando' && (
        <div className="flex items-center gap-1.5 h-14">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                height: `${24 + Math.random() * 28}px`,
                animationDelay: `${(i * 0.07).toFixed(2)}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Spinner procesando */}
      {estado === 'procesando' && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Botones */}
      {(estado === 'idle' || estado === 'error') && (
        <button
          onClick={iniciarGrabacion}
          className="w-20 h-20 rounded-full bg-[#4ade80] hover:bg-[#22c55e] transition-all flex items-center justify-center shadow-lg shadow-[#4ade80]/20 hover:shadow-[#4ade80]/40 hover:scale-105 active:scale-95"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#0d0d0d">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#0d0d0d" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {estado === 'grabando' && (
        <button
          onClick={detenerGrabacion}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105 active:scale-95"
        >
          <div className="w-9 h-9 bg-white rounded-md" />
        </button>
      )}

      {estado === 'grabando' && (
        <p className="text-[#6b7280] text-xs text-center">
          Presiona el botón rojo para detener la grabación y generar la síntesis
        </p>
      )}
    </div>
  )
}
