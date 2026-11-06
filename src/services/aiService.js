// Servicio de Inteligencia Artificial conectado con Vercel (/api/chat) y fallback cliente
import { CATALOGO_SERVICIOS } from './catalogoData';

// Expresiones regulares de salvaguardas éticas
export const PATRON_CRISIS = /(suicid|matarme|quitarme la vida|no quiero (seguir )?viv|no (le )?veo sentido a (la vida|vivir)|desaparecer para siempre|hacerme da[ñn]o|autolesi|cortarme|terminar con todo|me quiero morir|me pega|me golpea|abus[oa]|violaci)/i;

export const PATRON_NARANJA = /(dejar la carrera|retirar(me)?|salirme|no puedo pagar|no tengo plata|no tengo para (comer|almorzar|la micro|el pasaje)|sin comida|sin micro|desaloj|perder la pieza|perder el techo|no tengo donde vivir)/i;

export const PATRON_AMARILLA = /(reprob|me fue mal|rojo|echarme el ramo|duda.*fuas|apelar.*gratuidad|perder.*beca|tramite|no entiendo nada)/i;

export const PATRON_DIAGNOSTICO = /\b(tienes|sufres|padeces|parece que tienes)\s+(depresi[oó]n|ansiedad|un trastorno|tdah|estr[eé]s postraum)|\bdiagn[oó]stic/i;

export const MENSAJE_CRISIS = `Gracias por contarlo. Lo que describes es importante y mereces apoyo de una persona ahora, no de una IA.\n\n• Si piensas en hacerte daño, llama a la **Línea de Prevención del Suicidio *4141** (gratuita, desde celulares) o a **Salud Responde 600 360 7777**.\n• En una emergencia, llama al **131 (SAMU)** o acude a urgencias.\n\nAvisé al equipo psicosocial de Fundación Puente para que una profesional te contacte de inmediato. (En la hackathon es una simulación).`;

// Filtro de tuteo chileno idéntico a comun/nucleo_st.py
const VOSEO_MAP = {
  'elegís': 'eliges',
  'tenés': 'tienes',
  'podés': 'puedes',
  'querés': 'quieres',
  'sabés': 'sabes',
  'sentís': 'sientes',
  'contás': 'cuentas',
  'decís': 'dices',
  'necesitás': 'necesitas',
  'preferís': 'prefieres',
  'decidís': 'decides',
  'escribís': 'escribes',
  'pedís': 'pides',
  'estás vos': 'estás tú',
  'vos ': 'tú '
};

function tutear(texto = '') {
  let res = String(texto);
  for (const [vos, tu] of Object.entries(VOSEO_MAP)) {
    const regex = new RegExp(`\\b${vos}`, 'gi');
    res = res.replace(regex, (m) => (m[0] === m[0].toUpperCase() ? tu.charAt(0).toUpperCase() + tu.slice(1) : tu));
  }
  return res;
}

export async function enviarMensajeIA(messages, becadoInfo = {}) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';

  // 1. Verificación ética de crisis vital
  if (PATRON_CRISIS.test(lastUserMsg)) {
    return {
      content: MENSAJE_CRISIS,
      alerta: 'ROJA',
      gatillante: 'Señal de crisis vital o violencia detectada',
      servicioSugerido: 'S03',
      provider: 'protocolo-crisis',
      isCrisis: true
    };
  }

  // 2. Detección de Alerta Naranja (48 horas) o Amarilla
  let alertaDetectada = 'VERDE';
  let fraseGatillante = '';
  let servicioSugerido = 'S01';

  const matchNaranja = lastUserMsg.match(PATRON_NARANJA);
  if (matchNaranja) {
    alertaDetectada = 'NARANJA';
    fraseGatillante = matchNaranja[0];
    servicioSugerido = 'S04';
  } else {
    const matchAmarilla = lastUserMsg.match(PATRON_AMARILLA);
    if (matchAmarilla) {
      alertaDetectada = 'AMARILLA';
      fraseGatillante = matchAmarilla[0];
      servicioSugerido = 'S02';
    }
  }

  // 3. Preparar System Prompt Institucional y normalizar mensajes (primer mensaje = user)
  const catalogoTexto = CATALOGO_SERVICIOS.map(
    (s) => `- [${s.id}] ${s.nombre} (${s.tipo_origen}): ${s.para_que_sirve}. Cómo acceder: ${s.como_acceder}`
  ).join('\n');

  let systemPrompt = `Eres "Puente Contigo", asistente virtual de apoyo y orientación para becados de primer año de Fundación Puente en Chile.
Tu misión: acompañar con calidez, orientar sobre la vida universitaria y recomendar apoyos reales del catálogo verificado.
REGLAS FIJAS OBLIGATORIAS:
1. No eres psicólogo: no diagnosticas ni usas rótulos clínicos.
2. Tutea con calidez en español chileno respetuoso ("tú", no voseo). Máximo 3 frases por respuesta.
3. Menciona SOLO servicios del catálogo verificado con su código entre corchetes, ej. [S01] o [S02].
4. En beneficios, di siempre "podrías optar" o "podrías postular", nunca afirmes derechos garantizados.
Catálogo:
${catalogoTexto}`;

  // Asegurar que la secuencia de mensajes comience con role: 'user' (requerido por Claude Haiku 5.5)
  const normalizedMessages = [];
  for (const m of messages) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    if (normalizedMessages.length === 0 && role === 'assistant') {
      systemPrompt += `\n\n[Saludo inicial ya enviado al estudiante: "${m.content}"]`;
      continue;
    }
    normalizedMessages.push({ role, content: String(m.content) });
  }

  // 4. Llamar al backend serverless de Vercel (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: normalizedMessages,
        systemPrompt,
        temperature: 0.4,
        maxTokens: 350
      })
    });

    if (response.ok) {
      const data = await response.json();
      let texto = tutear(data.content || '');

      // Filtro ético anti-diagnóstico
      if (PATRON_DIAGNOSTICO.test(texto)) {
        texto = 'Gracias por contarlo. En Fundación Puente no emitimos diagnósticos de salud mental, pero sí contamos con los **Servicios Psicosociales del CAI [S03]**. ¿Te gustaría que coordinemos una orientación con una profesional?';
      }

      if (texto) {
        return {
          content: texto,
          alerta: alertaDetectada,
          gatillante: fraseGatillante,
          servicioSugerido,
          provider: data.provider || 'vercel-serverless',
          model: data.model || 'claude-haiku-5-5',
          isDemo: data.isDemo || false
        };
      }
    }
  } catch (err) {
    console.log('Llamada a /api/chat no disponible, verificando clave cliente:', err);
  }

  // 5. Fallback directo en cliente si existen variables VITE_*
  const rawClientKey =
    import.meta.env?.VITE_ANTHROPIC_API_KEY ||
    import.meta.env?.VITE_AI_API_KEY ||
    import.meta.env?.VITE_OPENAI_API_KEY ||
    import.meta.env?.VITE_GROQ_API_KEY ||
    '';
  const clientKey = rawClientKey.replace(/^["']|["']$/g, '').trim();
  const clientModel = (import.meta.env?.VITE_AI_MODEL || '').replace(/^["']|["']$/g, '').trim();

  if (clientKey) {
    try {
      const isAnthropic =
        clientKey.startsWith('sk-ant') ||
        clientModel.startsWith('claude') ||
        Boolean(import.meta.env?.VITE_ANTHROPIC_API_KEY);

      const url = isAnthropic
        ? 'https://api.anthropic.com/v1/chat/completions'
        : clientKey.startsWith('gsk_')
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model =
        clientModel ||
        (isAnthropic ? 'claude-haiku-5-5' : clientKey.startsWith('gsk_') ? 'openai/gpt-oss-120b' : 'gpt-4o-mini');

      const bodyPayload = {
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...normalizedMessages],
        max_tokens: 350
      };
      // Claude rechaza temperature < 1 en su endpoint compatible con OpenAI
      if (!isAnthropic) {
        bodyPayload.temperature = 0.4;
      }

      const clientRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientKey}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (clientRes.ok) {
        const d = await clientRes.json();
        const texto = tutear(d.choices?.[0]?.message?.content || '');
        if (texto) {
          return {
            content: texto,
            alerta: alertaDetectada,
            gatillante: fraseGatillante,
            servicioSugerido,
            provider: isAnthropic ? 'anthropic-client' : 'openai-client',
            model,
            isDemo: false
          };
        }
      }
    } catch (e) {
      console.log('Error clientKey:', e);
    }
  }

  // 6. Fallback simulado de demostración (Garantía de cero caídas en demo)
  let demoTexto = `Hola ${becadoInfo.nombre || ''}, gracias por contármelo. Adaptarse al primer año universitario tiene muchos desafíos. En Fundación Puente cuentas con el **CAI · Tutorías Académicas [S02]** y la **Beca Mensual [S01]** para acompañarte. ¿Te gustaría que revisemos alguna materia o trámite específico?`;

  if (alertaDetectada === 'NARANJA') {
    demoTexto = `Hola ${becadoInfo.nombre || ''}, entiendo lo angustiante que es no contar con recursos para la locomoción o comida. En Fundación Puente tenemos la **Beca Mensual [S01]** y las **Becas de Emergencia [S04]**. Dejaré un aviso prioritario en la bandeja del equipo para que tu trabajadora social te contacte en **menos de 48 horas**. ¿Hay algo más que quieras compartirme?`;
  } else if (alertaDetectada === 'AMARILLA') {
    demoTexto = `Comprendo que te preocupe esa evaluación o trámite, ${becadoInfo.nombre || ''}. Que ocurran dificultades en el primer semestre es muy frecuente. Con el **CAI · Tutorías Académicas [S02]** podemos apoyarte sin juicios, y con **Beneficios Estatales [S06]** podemos revisar tu apelación. ¿Te gustaría coordinar una tutoría?`;
  }

  return {
    content: demoTexto,
    alerta: alertaDetectada,
    gatillante: fraseGatillante,
    servicioSugerido,
    provider: 'demo-local',
    model: 'simulacion-hackathon',
    isDemo: true
  };
}
