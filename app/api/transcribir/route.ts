import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/groq'
import { toFile } from 'groq-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'No se recibió ningún archivo de audio' }, { status: 400 })
    }

    const arrayBuffer = await audio.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const transcripcion = await groq.audio.transcriptions.create({
      file: await toFile(buffer, 'grabacion.webm', { type: 'audio/webm' }),
      model: 'whisper-large-v3',
      language: 'es',
      response_format: 'text',
    })

    return NextResponse.json({ transcripcion })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    console.error('[/api/transcribir]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
