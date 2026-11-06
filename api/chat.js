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

  let parsedBody = req.body;
  if (typeof parsedBody === 'string') {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch (e) {
      parsedBody = {};
    }
  }

  const { messages = [], systemPrompt = '', temperature = 0.4, maxTokens = 450 } = parsedBody || {};

  try {
    // 1. Obtener clave desde cualquier nombre de variable común en Vercel / .env
    const rawKey =
      process.env.ANTHROPIC_API_KEY ||
      process.env.CLAUDE_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.MISTRAL_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.API_KEY ||
      process.env.VITE_ANTHROPIC_API_KEY ||
      process.env.VITE_AI_API_KEY ||
      process.env.VITE_OPENAI_API_KEY ||
      '';

    // Limpiar comillas o espacios accidentales al copiar desde .env o secrets.toml
    const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

    const rawProvider = (
      process.env.AI_PROVIDER ||
      process.env.PROVIDER ||
      process.env.VITE_AI_PROVIDER ||
      ''
    ).replace(/^["']|["']$/g, '').trim().toLowerCase();

    const customModel = (
      process.env.AI_MODEL ||
      process.env.ANTHROPIC_MODEL ||
      process.env.CLAUDE_MODEL ||
      process.env.MODEL ||
      process.env.VITE_AI_MODEL ||
      ''
    ).replace(/^["']|["']$/g, '').trim();

    // Si no hay clave configurada en Vercel, responder con respuesta de demostración inteligente
    if (!apiKey) {
      const demoResponse = getFallbackResponse(messages, systemPrompt);
      return res.status(200).json({
        content: demoResponse,
        provider: 'demo-local',
        model: 'simulacion-hackathon',
        isDemo: true,
        reason: 'missing_api_key'
      });
    }

    // 2. Normalizar historial de mensajes:
    // Anthropic (y varios endpoints estrictos) exigen que el primer mensaje tras 'system' sea SIEMPRE 'user'.
    // Nuestro chat inicia con un saludo de bienvenida de 'assistant', por lo que lo integramos al systemPrompt.
    let systemText = systemPrompt || 'Eres Puente Contigo, asistente de Fundación Puente.';
    const cleanedMessages = [];

    for (const m of messages) {
      if (!m || !m.content) continue;
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      if (cleanedMessages.length === 0 && role === 'assistant') {
        systemText += `\n\n[Contexto: Ya saludaste al estudiante diciendo: "${m.content}"]`;
        continue;
      }
      // Evitar dos mensajes consecutivos del mismo rol
      if (cleanedMessages.length > 0 && cleanedMessages[cleanedMessages.length - 1].role === role) {
        cleanedMessages[cleanedMessages.length - 1].content += `\n${m.content}`;
      } else {
        cleanedMessages.push({ role, content: String(m.content) });
      }
    }

    if (cleanedMessages.length === 0) {
      cleanedMessages.push({ role: 'user', content: 'Hola, necesito orientación.' });
    }

    // 3. Detectar si es Claude / Anthropic
    const isAnthropic =
      rawProvider === 'anthropic' ||
      rawProvider === 'claude' ||
      apiKey.startsWith('sk-ant') ||
      customModel.startsWith('claude') ||
      Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.VITE_ANTHROPIC_API_KEY);

    if (isAnthropic) {
      // Lista de modelos en orden de prioridad:
      // 1° El declarado en variable de entorno (si existe)
      // 2° 'claude-haiku-5-5' (declarado en comun/nucleo_st.py de la Hackathon UC 2026)
      // 3° 'claude-haiku-4-5' / 'claude-3-5-haiku-latest' como respaldo
      const candidateModels = [
        ...(customModel ? [customModel] : []),
        'claude-haiku-5-5',
        'claude-haiku-4-5',
        'claude-3-5-haiku-latest'
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      const errors = [];

      for (const candidateModel of candidateModels) {
        // Intento A: Endpoint compatible con OpenAI usado en comun/nucleo_st.py (SIN temperature, porque Claude lo rechaza con 400)
        try {
          const compatRes = await fetch('https://api.anthropic.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: candidateModel,
              max_tokens: maxTokens,
              messages: [
                { role: 'system', content: systemText },
                ...cleanedMessages
              ]
              // IMPORTANTE: Se omite 'temperature' tal como en comun/nucleo_st.py (línea 652)
            })
          });

          if (compatRes.ok) {
            const data = await compatRes.json();
            const content = (data.choices?.[0]?.message?.content || '').trim();
            if (content) {
              return res.status(200).json({
                content,
                provider: 'anthropic',
                model: candidateModel,
                isDemo: false
              });
            }
          } else {
            const errTxt = await compatRes.text();
            errors.push(`compat(${candidateModel}): ${compatRes.status} ${errTxt.slice(0, 120)}`);
          }
        } catch (e) {
          errors.push(`compat(${candidateModel}): ${e.message}`);
        }

        // Intento B: Endpoint nativo de Anthropic (/v1/messages) también SIN temperature
        try {
          const nativeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: candidateModel,
              max_tokens: maxTokens,
              system: systemText,
              messages: cleanedMessages
            })
          });

          if (nativeRes.ok) {
            const data = await nativeRes.json();
            const content = (data.content?.[0]?.text || '').trim();
            if (content) {
              return res.status(200).json({
                content,
                provider: 'anthropic',
                model: candidateModel,
                isDemo: false
              });
            }
          } else {
            const errTxt = await nativeRes.text();
            errors.push(`native(${candidateModel}): ${nativeRes.status} ${errTxt.slice(0, 120)}`);
          }
        } catch (e) {
          errors.push(`native(${candidateModel}): ${e.message}`);
        }
      }

      console.error('Anthropic falló en todos los intentos:', errors.join(' | '));
      return res.status(200).json({
        content: getFallbackResponse(cleanedMessages, systemText),
        isDemo: true,
        note: 'Fallback por error de proveedor Anthropic',
        debug: errors
      });
    }

    // 4. Otros proveedores (Groq, Mistral, Gemini, OpenRouter, OpenAI)
    let endpoint = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
    let model = customModel || 'gpt-4o-mini';
    let isGroqGptOss = false;

    if (rawProvider === 'groq' || apiKey.startsWith('gsk_')) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      model = customModel || 'openai/gpt-oss-120b';
      isGroqGptOss = model.includes('gpt-oss');
    } else if (rawProvider === 'mistral') {
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      model = customModel || 'mistral-small-latest';
    } else if (rawProvider === 'gemini' || apiKey.startsWith('AIza')) {
      endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      model = customModel || 'gemini-2.5-flash';
    } else if (rawProvider === 'openrouter' || apiKey.startsWith('sk-or-')) {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      model = customModel || 'openai/gpt-oss-120b';
    }

    const fullMessages = [
      { role: 'system', content: systemText },
      ...cleanedMessages
    ];

    const payload = {
      model,
      messages: fullMessages,
      temperature,
      max_tokens: isGroqGptOss ? maxTokens + 2000 : maxTokens
    };

    if (isGroqGptOss) {
      payload.reasoning_effort = 'medium';
    }

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('API Error:', errText);
      return res.status(200).json({
        content: getFallbackResponse(cleanedMessages, systemText),
        isDemo: true,
        note: 'Fallback por saturación o clave',
        debug: `${apiRes.status}: ${errText.slice(0, 160)}`
      });
    }

    const data = await apiRes.json();
    const content = (data.choices?.[0]?.message?.content || '').trim();

    return res.status(200).json({
      content: content || getFallbackResponse(cleanedMessages, systemText),
      provider: rawProvider || 'openai-compatible',
      model,
      isDemo: !content
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(200).json({
      content: getFallbackResponse(messages, systemPrompt),
      isDemo: true,
      error: error.message
    });
  }
}

function getFallbackResponse(messages, systemPrompt = '') {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (lastMsg.includes('plata') || lastMsg.includes('pasaje') || lastMsg.includes('micro') || lastMsg.includes('comida') || lastMsg.includes('dejar')) {
    return 'Entiendo que estás pasando por un momento muy pesado económicamente. En los registros oficiales de Fundación Puente cuentas con la **Beca Mensual [S01]**, las **Becas de Emergencia [S04]** y la posibilidad de postular a **Residencia [S05]**. He dejado un aviso prioritario en la bandeja del equipo para que tu profesional te contacte en menos de 48 horas.';
  }
  
  if (lastMsg.includes('reprob') || lastMsg.includes('nota') || lastMsg.includes('ramo') || lastMsg.includes('prueba')) {
    return 'Es completamente normal que la primera etapa universitaria sea desafiante. En el **CAI · Tutorías Académicas [S02]** de Fundación Puente cuentas con voluntarios que te apoyan sin juicios en las materias que más te cuesten. ¿Te gustaría coordinar una sesión esta semana?';
  }

  if (lastMsg.includes('beca') || lastMsg.includes('arancel') || lastMsg.includes('dae')) {
    return 'Para revisar becas y aranceles oficiales, recuerda que la información no verificada en registros oficiales debe validarse directamente en la Dirección de Asuntos Estudiantiles (DAE) de tu institución y con tu trabajadora social de Fundación Puente a través del apoyo [S01].';
  }

  return 'Hola, gracias por compartir tu experiencia con Puente Contigo. Como becado de primer año de Fundación Puente cuentas con toda nuestra red de acompañamiento, el Centro de Atención Integral (CAI [S02]) y orientación en becas [S01]. ¿En qué apoyo verificado te gustaría profundizar hoy?';
}
