import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/groq'

const PROMPT_SISTEMA =
  'Eres un asistente académico. A continuación tienes la transcripción de una clase universitaria. Genera una síntesis estructurada con: 1) Resumen general (3-5 oraciones), 2) Conceptos clave (lista), 3) Puntos importantes a recordar (lista). Sé claro y conciso.'

export async function POST(request: NextRequest) {
  try {
    const { transcripcion } = await request.json()

    if (!transcripcion || typeof transcripcion !== 'string') {
      return NextResponse.json({ error: 'Transcripción inválida o vacía' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: PROMPT_SISTEMA },
        { role: 'user', content: transcripcion },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    })

    const sintesis = completion.choices[0]?.message?.content ?? ''

    return NextResponse.json({ sintesis })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    console.error('[/api/sintetizar]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
