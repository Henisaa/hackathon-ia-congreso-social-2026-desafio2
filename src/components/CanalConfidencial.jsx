import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldAlert, HeartHandshake, CheckCircle2, User, AlertTriangle, PhoneCall, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { enviarMensajeIA, evaluarSemaforo, MENSAJE_CRISIS } from '../services/aiService';
import { PERFILES_SIMULACION } from '../services/estudiantesData';
import { obtenerChatDePerfil, guardarChatDePerfil } from '../services/storageService';

const FRASES_DEMO = {
  P1: 'Hola, me cambiaron el turno en el trabajo y no tengo plata para la micro ni para almorzar esta semana... tengo miedo de tener que dejar la carrera.',
  P2: 'Me saqué un 2.8 en mi primera prueba de programación y no entiendo nada, me da mucha vergüenza pedir ayuda a los profesores.',
  P3: 'Estoy viviendo una situación de violencia familiar muy grave en mi casa, siento angustia extrema y ya no doy más...',
  P4: 'Me avisaron que me van a desalojar de la pieza a fin de mes y no tengo redes en Santiago ni para pagar arriendo.',
  P5: 'Tengo dudas con el formulario FUAS para apelar a la gratuidad, tengo miedo de perder la beca este semestre.',
  P6: 'Hola, quería consultar qué talleres del CAI y cursos de nivelación están disponibles para becados de primer año.'
};

export default function CanalConfidencial({ becadoPerfil, setBecadoPerfil, agregarCasoBandeja, setVistaActual }) {
  const [perfilSelId, setPerfilSelId] = useState('P1');
  const [consentimiento, setConsentimiento] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alertaActiva, setAlertaActiva] = useState('VERDE');
  const [fraseGatillante, setFraseGatillante] = useState('');
  const [servicioSugerido, setServicioSugerido] = useState('S01');
  const [resumenFinal, setResumenFinal] = useState(null);
  const chatBottomRef = useRef(null);

  // 1. Cargar estado persistente en caché al cambiar o inicializar el perfil
  useEffect(() => {
    const p = PERFILES_SIMULACION.find(x => x.id_persona === perfilSelId) || PERFILES_SIMULACION[0];
    setBecadoPerfil({
      nombre: p.nombre_ficticio,
      institucion: p.institucion,
      carrera: p.carrera,
      jornada: p.jornada,
      trabaja: p.trabaja,
      horas_trabajo_semana: p.horas_trabajo_semana,
      cuida_dependientes: p.cuida_dependientes,
      gratuidad: p.gratuidad,
      nota_promedio: p.nota_promedio,
      de_region: p.de_region,
      beneficios_activos: ['S01']
    });

    const guardado = obtenerChatDePerfil(perfilSelId);
    setConsentimiento(guardado.consentimiento || false);
    setHistorial(guardado.historial || []);
    setAlertaActiva(guardado.alertaActiva || 'VERDE');
    setFraseGatillante(guardado.fraseGatillante || '');
    setServicioSugerido(guardado.servicioSugerido || 'S01');
    setResumenFinal(guardado.resumenFinal || null);
  }, [perfilSelId]);

  // 2. Guardar en caché cada vez que cambie el historial o el semáforo del perfil
  useEffect(() => {
    guardarChatDePerfil(perfilSelId, {
      consentimiento,
      historial,
      alertaActiva,
      fraseGatillante,
      servicioSugerido,
      resumenFinal
    });
  }, [consentimiento, historial, alertaActiva, fraseGatillante, servicioSugerido, resumenFinal, perfilSelId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial, cargando]);

  const iniciarChat = () => {
    if (!consentimiento) return;
    const msgInicial = {
      role: 'assistant',
      content: `¡Hola ${becadoPerfil.nombre}! Soy Puente Contigo, el asistente de apoyo y orientación de Fundación Puente. ¿Cómo va tu semana en ${becadoPerfil.carrera}? Cuéntame cómo te estás sintiendo o en qué duda universitaria te puedo orientar.`
    };
    setHistorial([msgInicial]);
    setAlertaActiva('VERDE');
  };

  const handleEnviar = async (e, textoForzado = null) => {
    e?.preventDefault();
    const userText = (textoForzado || inputMensaje).trim();
    if (!userText || cargando) return;

    setInputMensaje('');
    const nuevoHistorial = [...historial, { role: 'user', content: userText }];
    setHistorial(nuevoHistorial);
    setCargando(true);

    // Evaluación en tiempo real inmediata del Semáforo
    const semaforoInmediato = evaluarSemaforo(userText, alertaActiva);
    setAlertaActiva(semaforoInmediato.alerta);
    if (semaforoInmediato.gatillante) {
      setFraseGatillante(semaforoInmediato.gatillante);
    }
    setServicioSugerido(semaforoInmediato.servicioSugerido);

    try {
      const resp = await enviarMensajeIA(nuevoHistorial, becadoPerfil, alertaActiva);

      setHistorial([...nuevoHistorial, { role: 'assistant', content: resp.content, isDemo: resp.isDemo }]);

      // Actualizar semáforo con respuesta consolidada
      const alertaFinal = resp.alerta || semaforoInmediato.alerta;
      setAlertaActiva(alertaFinal);
      if (resp.gatillante || semaforoInmediato.gatillante) {
        setFraseGatillante(resp.gatillante || semaforoInmediato.gatillante);
      }
      if (resp.servicioSugerido) {
        setServicioSugerido(resp.servicioSugerido);
      }

      // Si activó Alerta ROJA, NARANJA o AMARILLA, sincronizar automáticamente con la bandeja del equipo
      if (['ROJA', 'NARANJA', 'AMARILLA'].includes(alertaFinal)) {
        agregarCasoBandeja({
          persona_id: perfilSelId,
          estudiante: becadoPerfil.nombre,
          origen: 'Canal Confidencial',
          alerta: alertaFinal,
          frase_gatillante: resp.gatillante || semaforoInmediato.gatillante || userText,
          servicio_sugerido: resp.servicioSugerido || semaforoInmediato.servicioSugerido || 'S01',
          resumen_ia:
            alertaFinal === 'ROJA'
              ? 'Señal de crisis vital o violencia detectada: contacto humano urgente.'
              : alertaFinal === 'NARANJA'
              ? 'Riesgo económico o habitacional inminente: contacto en 48 horas.'
              : 'Dificultad académica o de trámite: derivar a apoyo CAI o asistente social.',
          conversacion: nuevoHistorial.map(m => `${m.role === 'user' ? becadoPerfil.nombre : 'Puente Contigo'}: ${m.content}`).join('\n')
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarResumen = () => {
    const resumen = {
      titulo: 'Orientación Registrada Exitosamente',
      mensaje: `Gracias por conversar con Puente Contigo, ${becadoPerfil.nombre}. Las orientaciones han quedado guardadas de forma segura en caché. Tu profesional de acompañamiento en Fundación Puente revisará tus consultas para brindarte apoyo oportuno.`
    };
    setResumenFinal(resumen);
  };

  const handleReiniciarChat = () => {
    setHistorial([]);
    setAlertaActiva('VERDE');
    setFraseGatillante('');
    setServicioSugerido('S01');
    setResumenFinal(null);
  };

  const handleCargarFraseDemo = () => {
    const frase = FRASES_DEMO[perfilSelId] || FRASES_DEMO['P1'];
    setInputMensaje(frase);
  };

  const perfilActual = PERFILES_SIMULACION.find(x => x.id_persona === perfilSelId) || PERFILES_SIMULACION[0];

  return (
    <div className="grid-cols-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
      {/* Columna Izquierda: Chat */}
      <div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💬 Canal Confidencial "Puente Contigo"
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-green">Activo 24/7</span>
              <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                💾 En Caché Local
              </span>
            </div>
          </div>

          {!historial.length ? (
            <div style={{ background: '#FFF7F8', border: '1px solid #F1D4DB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🤝</div>
              <h3 style={{ color: '#9F1127', fontSize: '1.15rem', marginBottom: '8px' }}>Espacio Seguro para Becados(as)</h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '16px', lineHeight: '1.5' }}>
                Aquí puedes consultar dudas universitarias o conversar con confianza sobre cómo te estás sintiendo en tu carrera. La decisión de cualquier apoyo presencial siempre la toma una profesional humana de Fundación Puente.
              </p>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0DB', marginBottom: '16px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                  Entiendo que converso con un asistente de orientación de Fundación Puente, que puedo cerrar cuando quiera y que mis datos sensibles están protegidos bajo secreto ético.
                </span>
              </label>

              <button
                onClick={iniciarChat}
                disabled={!consentimiento}
                className="btn-primary"
                style={{ width: '100%', opacity: consentimiento ? 1 : 0.5 }}
              >
                Comenzar conversación confidencial
              </button>
            </div>
          ) : (
            <div>
              {/* Contenedor de Mensajes */}
              <div className="chat-container">
                {historial.map((m, idx) => (
                  <div key={idx} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-asst'}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: m.role === 'user' ? '#166534' : '#9F1127' }}>
                      {m.role === 'user' ? `🧑‍🎓 ${becadoPerfil.nombre}` : '🤝 Puente Contigo'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>
                      {m.content}
                    </div>
                    {m.isDemo && (
                      <div style={{ fontSize: '0.72rem', color: '#92400E', marginTop: '6px', fontStyle: 'italic' }}>
                        🤖 Respuesta de orientación de demostración
                      </div>
                    )}
                  </div>
                ))}
                {cargando && (
                  <div className="chat-bubble-asst" style={{ color: '#6B7280', fontStyle: 'italic' }}>
                    Puente Contigo está redactando con empatía…
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input de Mensaje */}
              <form onSubmit={handleEnviar} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  value={inputMensaje}
                  onChange={(e) => setInputMensaje(e.target.value)}
                  placeholder="Escribe tu consulta o cómo te sientes aquí…"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" disabled={cargando || !inputMensaje.trim()} className="btn-primary" style={{ padding: '0 18px' }}>
                  <Send size={18} />
                </button>
              </form>

              {/* Botón de ayuda para Pitch: inyectar frase de prueba */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCargarFraseDemo}
                  className="btn-secondary"
                  title="Carga una frase realista para probar el semáforo de este perfil"
                  style={{ fontSize: '0.78rem', color: '#9F1127', borderColor: '#F1D4DB', background: '#FFF5F6' }}
                >
                  ⚡ Cargar frase de prueba ({perfilActual.nombre_ficticio})
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={handleCerrarResumen} className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                    🏁 Guardar resumen
                  </button>
                  <button onClick={handleReiniciarChat} className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                    🔄 Reiniciar chat
                  </button>
                </div>
              </div>

              {resumenFinal && (
                <div style={{ marginTop: '14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>{resumenFinal.titulo}</div>
                  <div style={{ fontSize: '0.88rem', color: '#1F2937' }}>{resumenFinal.mensaje}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Semáforo en Tiempo Real y Selector de Simulación */}
      <div>
        {/* WIDGET DEL SEMÁFORO EN TIEMPO REAL */}
        <div className="card" style={{ padding: '18px', marginBottom: '14px', borderLeft: `6px solid ${alertaActiva === 'ROJA' ? '#DC2626' : alertaActiva === 'NARANJA' ? '#EA580C' : alertaActiva === 'AMARILLA' ? '#D97706' : '#23A455'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#32373C', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🚦 Semáforo de Alertas en Tiempo Real
            </h3>
            {alertaActiva === 'ROJA' ? (
              <span className="badge badge-red" style={{ animation: 'pulse 1.5s infinite' }}>🔴 ROJA EN VIVO</span>
            ) : alertaActiva === 'NARANJA' ? (
              <span className="badge badge-orange" style={{ animation: 'pulse 1.5s infinite' }}>🟠 NARANJA EN VIVO</span>
            ) : alertaActiva === 'AMARILLA' ? (
              <span className="badge badge-amber">🟡 AMARILLA EN VIVO</span>
            ) : (
              <span className="badge badge-green">🟢 REGULAR</span>
            )}
          </div>

          {/* Luces del Semáforo Visual */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            background: '#1F2937',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            {/* Luz Roja */}
            <div style={{
              background: alertaActiva === 'ROJA' ? '#EF4444' : '#374151',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 4px',
              boxShadow: alertaActiva === 'ROJA' ? '0 0 14px #EF4444' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '1.2rem' }}>🔴</div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700' }}>Inmediata</div>
            </div>

            {/* Luz Naranja */}
            <div style={{
              background: alertaActiva === 'NARANJA' ? '#F97316' : '#374151',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 4px',
              boxShadow: alertaActiva === 'NARANJA' ? '0 0 14px #F97316' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '1.2rem' }}>🟠</div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700' }}>48 Horas</div>
            </div>

            {/* Luz Amarilla */}
            <div style={{
              background: alertaActiva === 'AMARILLA' ? '#FBBF24' : '#374151',
              color: alertaActiva === 'AMARILLA' ? '#1F2937' : '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 4px',
              boxShadow: alertaActiva === 'AMARILLA' ? '0 0 14px #FBBF24' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '1.2rem' }}>🟡</div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700' }}>Agenda</div>
            </div>

            {/* Luz Verde */}
            <div style={{
              background: alertaActiva === 'VERDE' ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 4px',
              boxShadow: alertaActiva === 'VERDE' ? '0 0 14px #22C55E' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '1.2rem' }}>🟢</div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700' }}>Normal</div>
            </div>
          </div>

          {/* Estado de la Alerta Actual */}
          <div style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '6px' }}>
              <b>Cita Textual Gatillante:</b>{' '}
              {fraseGatillante ? (
                <span style={{ color: '#9F1127', fontStyle: 'italic', fontWeight: '600' }}>"{fraseGatillante}"</span>
              ) : (
                <span style={{ color: '#6B7280' }}>Sin alerta de riesgo detectada</span>
              )}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <b>Tiempo de Respuesta Humano:</b>{' '}
              <span style={{ fontWeight: '700', color: alertaActiva === 'ROJA' ? '#DC2626' : alertaActiva === 'NARANJA' ? '#EA580C' : alertaActiva === 'AMARILLA' ? '#D97706' : '#166534' }}>
                {alertaActiva === 'ROJA' ? 'Urgente / Inmediato (Protocolo *4141)' : alertaActiva === 'NARANJA' ? 'Contacto Humano en < 48 horas' : alertaActiva === 'AMARILLA' ? 'Seguimiento en Agenda' : 'Orientación Informativa Activa'}
              </span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <b>Apoyo Sugerido:</b> <span className="badge badge-puente">{servicioSugerido}</span>
            </div>

            {/* Sincronización en vivo con botón para ir al Panel del Equipo */}
            <div style={{ background: '#F8F6F4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E0DB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                <span>Sincronizado en tiempo real con Panel del Equipo</span>
              </div>
              {setVistaActual && (
                <button
                  type="button"
                  onClick={() => setVistaActual('equipo')}
                  style={{
                    background: '#9F1127',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Ver en Panel <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta de Selección de Perfil para Simulación */}
        <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#9F1127', marginBottom: '8px' }}>
            🎭 Simular como Becado(a)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '10px' }}>
            Selecciona un perfil ficticio para probar los diferentes niveles del semáforo:
          </p>
          <select
            value={perfilSelId}
            onChange={(e) => setPerfilSelId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              marginBottom: '10px',
              fontSize: '0.9rem'
            }}
          >
            {PERFILES_SIMULACION.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.id_persona} · {p.nombre_ficticio} ({p.carrera}, {p.institucion})
              </option>
            ))}
          </select>

          <div className="quote-box" style={{ marginBottom: '8px' }}>
            "{perfilActual.contexto_para_simular}"
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
            <span><b>Alerta esperada:</b> <span className="badge badge-amber">{perfilActual.tipo_alerta_esperada}</span></span>
            <button
              onClick={handleCargarFraseDemo}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9F1127',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Usar frase demo
            </button>
          </div>
        </div>

        {/* Tarjeta de Salvaguardas Éticas */}
        <div className="card" style={{ padding: '16px', background: '#FFFDF9', borderLeft: '5px solid #F0960B' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#B45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> Salvaguardas Éticas Fijas
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: '1.5' }}>
            <div>• <b>0% Diagnósticos:</b> La IA nunca emite etiquetas de salud mental ni juicios de personalidad.</div>
            <div>• <b>0% Sesgo:</b> La alerta se activa <u>únicamente por la cita textual</u> del estudiante, nunca por sexo, edad, comuna ni colegio.</div>
            <div>• <b>Decisión Humana:</b> La trabajadora social es quien evalúa y aprueba cada asignación.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
