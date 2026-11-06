import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldAlert, HeartHandshake, CheckCircle2, User, AlertTriangle, PhoneCall } from 'lucide-react';
import { enviarMensajeIA, MENSAJE_CRISIS } from '../services/aiService';
import { PERFILES_SIMULACION } from '../services/estudiantesData';

export default function CanalConfidencial({ becadoPerfil, setBecadoPerfil, agregarCasoBandeja }) {
  const [consentimiento, setConsentimiento] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resumenFinal, setResumenFinal] = useState(null);
  const [perfilSelId, setPerfilSelId] = useState('P1');
  const chatBottomRef = useRef(null);

  // Al cambiar perfil simulado
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
    // Reiniciar chat
    setHistorial([]);
    setConsentimiento(false);
    setResumenFinal(null);
  }, [perfilSelId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial, cargando]);

  const iniciarChat = () => {
    if (!consentimiento) return;
    setHistorial([
      {
        role: 'assistant',
        content: `¡Hola ${becadoPerfil.nombre}! Soy Puente Contigo, el asistente de apoyo y orientación de Fundación Puente. ¿Cómo va tu semana en ${becadoPerfil.carrera}? Cuéntame cómo te estás sintiendo o en qué duda universitaria te puedo orientar.`
      }
    ]);
  };

  const handleEnviar = async (e) => {
    e?.preventDefault();
    if (!inputMensaje.trim() || cargando) return;

    const userText = inputMensaje.trim();
    setInputMensaje('');

    const nuevoHistorial = [...historial, { role: 'user', content: userText }];
    setHistorial(nuevoHistorial);
    setCargando(true);

    try {
      const resp = await enviarMensajeIA(nuevoHistorial, becadoPerfil);
      
      setHistorial([...nuevoHistorial, { role: 'assistant', content: resp.content, isDemo: resp.isDemo }]);

      // Si se activó alguna alerta, registrar automáticamente en la bandeja de la fundación
      if (['ROJA', 'NARANJA', 'AMARILLA'].includes(resp.alerta)) {
        agregarCasoBandeja({
          persona_id: perfilSelId,
          estudiante: becadoPerfil.nombre,
          origen: 'Canal Confidencial',
          alerta: resp.alerta,
          frase_gatillante: resp.gatillante || userText,
          servicio_sugerido: resp.servicioSugerido || 'S01',
          resumen_ia: resp.alerta === 'ROJA' ? 'Señal de crisis vital/violencia: requiere contacto humano inmediato.' : (resp.alerta === 'NARANJA' ? 'Riesgo económico o habitacional: contacto en 48 horas.' : 'Duda académica o de trámite.'),
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
    const soloUser = historial.filter(m => m.role === 'user').map(m => m.content).join(' ');
    setResumenFinal({
      titulo: 'Orientación Registrada Exitosamente',
      mensaje: `Gracias por conversar con Puente Contigo, ${becadoPerfil.nombre}. Las orientaciones han quedado guardadas de forma segura. Tu profesional de acompañamiento en Fundación Puente revisará tus consultas para brindarte apoyo oportuno.`
    });
  };

  const perfilActual = PERFILES_SIMULACION.find(x => x.id_persona === perfilSelId) || PERFILES_SIMULACION[0];

  return (
    <div className="grid-cols-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
      {/* Columna Izquierda: Chat */}
      <div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💬 Canal Confidencial "Puente Contigo"
            </h2>
            <span className="badge badge-green">Activo 24/7</span>
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

              {/* Botones de Cierre */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button onClick={handleCerrarResumen} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                  🏁 Finalizar y guardar resumen
                </button>
                <button onClick={() => setHistorial([])} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                  🔄 Reiniciar chat
                </button>
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

      {/* Columna Derecha: Simulación y Reglas Éticas */}
      <div>
        <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#9F1127', marginBottom: '10px' }}>
            🎭 Simular como Becado(a)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '12px' }}>
            Selecciona un perfil ficticio para probar los diferentes niveles del semáforo de alertas éticas:
          </p>
          <select
            value={perfilSelId}
            onChange={(e) => setPerfilSelId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              marginBottom: '12px',
              fontSize: '0.9rem'
            }}
          >
            {PERFILES_SIMULACION.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.id_persona} · {p.nombre_ficticio} ({p.carrera}, {p.institucion})
              </option>
            ))}
          </select>

          <div className="quote-box">
            "{perfilActual.contexto_para_simular}"
          </div>

          <div style={{ fontSize: '0.84rem', marginTop: '8px' }}>
            <b>Alerta esperada:</b> <span className="badge badge-amber">{perfilActual.tipo_alerta_esperada}</span>
          </div>
        </div>

        {/* Tarjeta de Protocolo Ético */}
        <div className="card" style={{ padding: '18px', background: '#FFFDF9', borderLeft: '5px solid #F0960B' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#B45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={18} /> Semáforo de Alertas Sin Sesgos
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '6px' }}>
              <b>🔴 Roja (Inmediata):</b> Peligro vital o violencia → Protocolo <code>*4141</code> y aviso de llamada urgente.
            </div>
            <div style={{ marginBottom: '6px' }}>
              <b>🟠 Naranja (48 h):</b> Riesgo de deserción por falta de pasajes, comida o techo → Contacto en <b>48 horas</b>.
            </div>
            <div style={{ marginBottom: '6px' }}>
              <b>🟡 Amarilla (Seguimiento):</b> Reprobación de ramos o dudas con trámites → Agenda para apoyo CAI o asistente social.
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9F1127', fontStyle: 'italic', marginTop: '8px' }}>
              * Garantía ética: la alerta se activa por lo que el estudiante dice (cita textual), <u>nunca por su comuna, género o colegio</u>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
