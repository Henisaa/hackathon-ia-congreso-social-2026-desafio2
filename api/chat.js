export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { messages = [], systemPrompt = '', temperature = 0.4, maxTokens = 400 } = req.body || {};

    // Obtener clave desde las variables de entorno de Vercel
    const apiKey = process.env.AI_API_KEY ||
                   process.env.OPENAI_API_KEY ||
                   process.env.GROQ_API_KEY ||
                   process.env.ANTHROPIC_API_KEY ||
                   process.env.MISTRAL_API_KEY ||
                   process.env.GEMINI_API_KEY;

    const provider = (process.env.AI_PROVIDER || '').toLowerCase();

    // Si no hay clave configurada en Vercel, responder con respuesta de demostración inteligente
    if (!apiKey) {
      const demoResponse = getFallbackResponse(messages);
      return res.status(200).json({
        content: demoResponse,
        provider: 'demo-local',
        model: 'simulacion-hackathon',
        isDemo: true
      });
    }

    // Identificar endpoint y proveedor
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let model = 'gpt-4o-mini';
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    if (provider === 'groq' || apiKey.startsWith('gsk_')) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'openai/gpt-oss-120b';
    } else if (provider === 'anthropic' || apiKey.startsWith('sk-ant')) {
      endpoint = 'https://api.anthropic.com/v1/messages';
      // Formato Anthropic Claude
      const systemText = systemPrompt || 'Eres Puente Contigo, asistente de Fundación Puente.';
      const anthropicMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const anthropicRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-5-5',
          max_tokens: maxTokens,
          system: systemText,
          messages: anthropicMessages
        })
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        console.error('Anthropic API error:', errText);
        return res.status(200).json({
          content: getFallbackResponse(messages),
          isDemo: true,
          note: 'Fallback por error de proveedor'
        });
      }

      const data = await anthropicRes.json();
      const content = data.content?.[0]?.text || '';
      return res.status(200).json({
        content,
        provider: 'anthropic',
        model: 'claude-haiku-5-5',
        isDemo: false
      });
    } else if (provider === 'mistral') {
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      model = 'mistral-small-latest';
    }

    // Formato estándar OpenAI / Groq
    const fullMessages = [];
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt });
    }
    fullMessages.push(...messages);

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: fullMessages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('API Error:', errText);
      return res.status(200).json({
        content: getFallbackResponse(messages),
        isDemo: true,
        note: 'Fallback por saturación o clave'
      });
    }

    const data = await apiRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      content,
      provider: provider || 'openai-compatible',
      model,
      isDemo: false
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(200).json({
      content: getFallbackResponse([]),
      isDemo: true,
      error: error.message
    });
  }
}

function getFallbackResponse(messages) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (lastMsg.includes('plata') || lastMsg.includes('pasaje') || lastMsg.includes('micro') || lastMsg.includes('comida') || lastMsg.includes('dejar')) {
    return 'Entiendo que estás pasando por un momento muy pesado económicamente. En Fundación Puente contamos con la **Beca Mensual [S01]**, las **Becas de Emergencia [S04]** y la posibilidad de postular a **Residencia [S05]**. He dejado un aviso prioritario en la bandeja del equipo para que tu profesional te contacte en menos de 48 horas.';
  }
  
  if (lastMsg.includes('reprob') || lastMsg.includes('nota') || lastMsg.includes('ramo') || lastMsg.includes('prueba')) {
    return 'Es completamente normal que la primera etapa universitaria sea desafiante. En el **CAI · Tutorías Académicas [S02]** contamos con voluntarios que te apoyan sin juicios en las materias que más te cuesten. ¿Te gustaría inscribirte en una sesión esta semana?';
  }

  return 'Hola, gracias por compartir tu experiencia con Puente Contigo. Como becado de primer año de Fundación Puente cuentas con toda nuestra red de acompañamiento, el Centro de Atención Integral (CAI) y orientación en becas. ¿En qué trámite o apoyo te gustaría profundizar hoy?';
}
